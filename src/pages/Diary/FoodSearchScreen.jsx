import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import robotImg from '../../assets/images/robot.png';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';
import { addFoodLog, parseCalories } from '../../utils/foodLogStorage';
import { createFoodLog } from '../../services/meals';
import { fetchFoodCatalog } from '../../services/foods';
import { getProfilePhoto, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { isFutureLocalDate, toLocalDateKey } from '../../utils/dateUtils.js';

const visualPresets = [
    { keywords: ['nasi', 'beras', 'jagung'], icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]', border: 'border-[#DCFCE7]' },
    { keywords: ['ayam', 'daging', 'sapi', 'ikan'], icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]', border: 'border-[#FFE4C4]' },
    { keywords: ['telur'], icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]', border: 'border-[#FFE4C4]' },
    { keywords: ['roti', 'mie', 'tepung'], icon: 'mdi:bread-slice', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]', border: 'border-[#Dbeafe]' },
    { keywords: ['sayur', 'bayam', 'kangkung', 'daun', 'wortel', 'brokoli'], icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]', border: 'border-[#DCFCE7]' },
    { keywords: ['buah', 'pisang', 'apel', 'pepaya', 'jeruk'], icon: 'mdi:food-apple', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]', border: 'border-[#DCFCE7]' },
    { keywords: ['kacang', 'kelapa', 'alpukat'], icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]', border: 'border-[#ede9fe]' }
];

const formatCalories = (item) => item.cals || `${Number(item.calories || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})} kkal`;

const decorateFood = (item = {}) => {
    const name = item.name || 'Makanan';
    const normalized = name.toLowerCase();
    const visual = visualPresets.find((preset) => preset.keywords.some((keyword) => normalized.includes(keyword))) || {
        icon: 'mdi:food-variant',
        color: 'text-[#14AE5C]',
        bg: 'bg-[#F0FDF4]',
        border: 'border-[#DCFCE7]'
    };

    return {
        ...item,
        name,
        qty: item.qty || '100g',
        cals: formatCalories(item),
        calories: Number(item.calories || parseCalories(item.cals)),
        icon: item.icon || visual.icon,
        color: item.color || visual.color,
        bg: item.bg || visual.bg,
        border: item.border || visual.border
    };
};

const shuffle = (items = []) => [...items].sort(() => Math.random() - 0.5);

const FoodSearchScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const selectedLogDate = toLocalDateKey(location.state?.logDate || new Date());
    const profilePhoto = getProfilePhoto(userEmail) || profileImg;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeMealMenu, setActiveMealMenu] = useState(null);
    const [recentFoods, setRecentFoods] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [foodOptions, setFoodOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [activePopover, setActivePopover] = useState(null);
    
    const recommendationScrollRef = useRef(null);
    const togglePopover = (id) => setActivePopover(prev => prev === id ? null : id);

    useEffect(() => {
        let isActive = true;
        const timeout = setTimeout(async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const catalog = await fetchFoodCatalog({
                    query: searchQuery,
                    goal: selectedGoal,
                    limit: searchQuery.trim() ? 30 : 24,
                    recommendationLimit: 24
                });

                if (!isActive) return;
                setRecentFoods((catalog.recent || []).map(decorateFood));
                setRecommendations(shuffle((catalog.recommendations || []).map(decorateFood)));
                setFoodOptions(searchQuery.trim()
                    ? (catalog.foods || []).map(decorateFood)
                    : shuffle((catalog.foods || []).map(decorateFood))
                );
            } catch (error) {
                if (!isActive) return;
                setErrorMessage(error.message || 'Gagal memuat katalog makanan data-science.');
                setRecentFoods([]);
                setRecommendations([]);
                setFoodOptions([]);
            } finally {
                if (isActive) setIsLoading(false);
            }
        }, 250);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [searchQuery, selectedGoal, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const scrollRecommendations = (direction) => {
        const scroller = recommendationScrollRef.current || document.querySelector('.food-recommendation-scroll');
        if (!scroller) return;

        const nextLeft = Math.max(
            0,
            Math.min(scroller.scrollLeft + direction * 180, scroller.scrollWidth - scroller.clientWidth)
        );

        scroller.scrollTo({
            left: nextLeft,
            behavior: 'smooth'
        });
    };

    const mealIds = {
        SARAPAN: 'sarapan',
        'MAKAN SIANG': 'makansiang',
        'MAKAN MALAM': 'makanmalam',
        CAMILAN: 'camilan'
    };

    const heavyFoodKeywords = ['nasi', 'mie', 'gulai', 'sate', 'rawon', 'bakso', 'rendang', 'ayam goreng', 'daging', 'nasi goreng'];
    const isHeavyFood = (foodName) => heavyFoodKeywords.some((keyword) => foodName.toLowerCase().includes(keyword));
    const getMealOptions = (item) => isHeavyFood(item.name) ? ['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM'] : ['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM', 'CAMILAN'];

    const handleAddFood = async (item, meal) => {
        if (isFutureLocalDate(selectedLogDate)) {
            alert('Tidak bisa menambahkan makanan untuk tanggal besok atau tanggal setelah hari ini.');
            return;
        }

        if (meal === 'CAMILAN' && isHeavyFood(item.name)) {
            alert(`Validasi Gagal: ${item.name} termasuk makanan berat, tidak boleh dimasukkan ke Camilan.`);
            return;
        }

        const calories = Number(item.calories || parseCalories(item.cals));
        const foodPayload = {
            foodName: item.name,
            calories,
            mealType: meal,
            logDate: selectedLogDate
        };

        const token = localStorage.getItem('authToken');
        let savedFood = null;
        if (token) {
            try {
                const response = await createFoodLog(foodPayload);
                savedFood = response.data;
            } catch (error) {
                if (error.status && error.status < 500) {
                    alert(error.message || "Gagal menyimpan makanan ke database.");
                    return;
                }
                alert(error.message || "Makanan tetap dicatat lokal, tapi gagal tersimpan ke database. Pastikan backend berjalan di port 5000.");
                console.error(error);
            }
        }

        addFoodLog(userEmail, savedFood || {
            name: item.name,
            qty: item.qty,
            calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
            mealId: mealIds[meal],
            icon: item.icon,
            color: item.color,
            bg: item.bg,
            logDate: selectedLogDate
        });
        navigate('/diary', { state: { goal: selectedGoal, email: userEmail, selectedDate: selectedLogDate } });
    };

    const ContextPopover = ({ id, title, content, position = "bottom-full mb-3 left-0", origin = "origin-bottom-left" }) => {
        if (activePopover !== id) return null;
        return (
            <div className={`absolute ${position} w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-5 z-[100] animate-scaleIn ${origin} cursor-default text-left`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#F0FDF4] rounded-full flex items-center justify-center border border-[#DCFCE7] flex-shrink-0">
                        <Icon icon="mdi:information-variant" className="text-lg text-[#14AE5C]" />
                    </div>
                    <h4 className="text-[14px] font-extrabold text-gray-800">{title}</h4>
                </div>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed">{content}</p>
            </div>
        );
    };

    const renderFoodRow = (item, keyPrefix) => {
        const menuKey = `${keyPrefix}-${item.id || item.name}`;

        return (
            <div key={menuKey} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative hover:border-[#14AE5C] transition-colors group">
                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3 flex-shrink-0 shadow-sm`}>
                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-[14px] font-bold text-black truncate group-hover:text-[#14AE5C] transition-colors">{item.name}</span>
                    <span className="text-[11px] font-medium text-gray-500 truncate">{item.qty}, {item.cals}</span>
                    <span className="text-[10px] font-medium text-gray-400 truncate">{item.category || item.label || 'Data TKPI'}</span>
                </div>
                <button
                    onClick={() => setActiveMealMenu(activeMealMenu === menuKey ? null : menuKey)}
                    className="w-[28px] h-[28px] rounded-full flex justify-center items-center border-2 border-[#14AE5C] text-[#14AE5C] text-lg hover:bg-[#F0FDF4] transition-colors relative z-10 flex-shrink-0"
                >
                    <Icon icon="mdi:plus" />
                </button>

                {activeMealMenu === menuKey && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMealMenu(null)}></div>
                        <div className="absolute right-0 top-12 w-[160px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden flex flex-col">
                            {getMealOptions(item).map((meal) => (
                                <div
                                    key={meal}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMealMenu(null);
                                        handleAddFood(item, meal);
                                    }}
                                    className="w-full py-3 px-4 border-b border-gray-50 last:border-0 hover:bg-[#F0FDF4] active:bg-[#E8F5EE] cursor-pointer flex items-center transition-colors"
                                >
                                    <span className="text-[#14AE5C] text-[12px] font-bold tracking-wide">{meal}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative' onClick={() => setActivePopover(null)}>
            
            {activePopover && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActivePopover(null)}></div>}
            <nav className="hidden md:flex fixed top-0 w-full h-[84px] bg-white shadow-sm border-b border-gray-100 z-50 justify-center">
                <div className="w-full max-w-[1400px] px-6 lg:px-8 flex justify-between items-center h-full gap-4">
                    <div className="flex items-center cursor-pointer gap-3 flex-shrink-0" onClick={() => navigate('/dashboard')}>
                        <img src={logoIcon} alt="Logo" className="w-[36px] h-[36px] lg:w-[42px] lg:h-[42px] object-contain" />
                        <h1 className="text-[20px] lg:text-[24px] font-extrabold text-[#14AE5C] tracking-tight">EatSistent</h1>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-[100px] p-1 border border-gray-100 shadow-inner flex-shrink-0 overflow-x-auto hide-scrollbar">
                        {[
                            { path: '/dashboard', label: 'Beranda' },
                            { path: '/diary', label: 'Diary' },
                            { path: '/progress', label: 'Progress' },
                            { path: '/insight', label: 'Insight' }
                        ].map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path, { state: { goal: selectedGoal, email: userEmail } })}
                                className={`px-5 lg:px-7 py-2 lg:py-2.5 rounded-[100px] text-[13px] lg:text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${
                                    location.pathname === item.path
                                    ? 'bg-white text-[#14AE5C] shadow-md transform scale-100' 
                                    : 'text-gray-500 hover:text-[#14AE5C] hover:bg-gray-100 scale-95'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                        <div className="relative z-50">
                            <button 
                                onClick={(e) => { e.stopPropagation(); togglePopover('nav-catat'); }}
                                className="bg-[#14AE5C] text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-[100px] text-[13px] lg:text-[14px] font-bold flex items-center gap-2 hover:bg-[#108e4b] transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                                <Icon icon="mdi:plus-circle-outline" className="text-[18px] lg:text-[20px]" /> Catat Makanan
                            </button>
                            {activePopover === 'nav-catat' && (
                                <div className="absolute right-0 top-full mt-3 w-[220px] lg:w-[240px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 animate-scaleIn origin-top-right text-left" onClick={(e) => e.stopPropagation()}>
                                    <div onClick={() => navigate('/cari-makanan', { state: { goal: selectedGoal, email: userEmail, logDate: selectedLogDate } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group">
                                        <div className="w-10 h-10 bg-[#14AE5C] rounded-full flex items-center justify-center text-white"><Icon icon="mdi:magnify" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Cari Manual</span>
                                    </div>
                                    <div onClick={() => navigate('/scan-barcode', { state: { goal: selectedGoal, email: userEmail, logDate: selectedLogDate } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group mt-1">
                                        <div className="w-10 h-10 bg-[#14AE5C] rounded-full flex items-center justify-center text-white"><Icon icon="mdi:barcode-scan" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Scan Barcode</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="w-[1px] h-[30px] bg-gray-200"></div>

                        <div className="relative cursor-pointer z-50">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm" onClick={(e) => { e.stopPropagation(); togglePopover('nav-notif'); }}>
                                <Icon icon="mdi:bell-outline" className="text-[20px] lg:text-[22px] text-gray-600" />
                            </div>
                            <span className="absolute top-[0px] right-[2px] w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] bg-red-500 rounded-full border-[2px] lg:border-[2.5px] border-white"></span>
                            <ContextPopover id="nav-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                        </div>

                        <div 
                            onClick={() => navigate('/profile', { state: { goal: selectedGoal, email: userEmail } })}
                            className={`w-[40px] h-[40px] lg:w-[44px] lg:h-[44px] rounded-full border-[2.5px] cursor-pointer transition-all overflow-hidden shadow-sm flex-shrink-0 border-gray-100 hover:border-[#14AE5C]`}
                        >
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="md:hidden fixed top-0 w-full h-[75px] bg-white shadow-sm border-b border-gray-100 z-50 flex items-center px-4 gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-800 hover:text-[#14AE5C] transition-colors rounded-full hover:bg-gray-50 active:scale-95">
                    <Icon icon="mdi:arrow-left" className="text-2xl font-bold" />
                </button>
                <h2 className="text-[18px] font-extrabold text-gray-800 flex-1 text-center pr-10">Pilih Santapan</h2>
            </div>
            <main className="flex-1 w-full max-w-[1400px] mx-auto pt-[90px] md:pt-[120px] pb-6 md:pb-16 flex flex-col lg:flex-row gap-0 lg:gap-8 lg:px-8">
                <div className="w-full lg:w-[35%] flex flex-col lg:sticky lg:top-[100px] lg:h-fit">
                    <div className="px-4 lg:px-0 mb-4 lg:mb-6 flex-shrink-0">
                        <div className="relative w-full h-[52px]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                <Icon icon="mdi:magnify" />
                            </div>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari makanan dari data TKPI" 
                                className="w-full h-full bg-white border-[1.5px] border-gray-200 rounded-[16px] pl-12 pr-14 font-medium outline-none focus:border-[#14AE5C] focus:shadow-[0_0_0_4px_rgba(20,174,92,0.1)] transition-all text-[14px] lg:text-[15px]"
                            />
                            <button 
                                onClick={() => navigate('/scan-barcode', { state: { goal: selectedGoal, email: userEmail, logDate: selectedLogDate } })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-[38px] h-[38px] bg-[#14AE5C] rounded-[12px] flex justify-center items-center text-white text-lg hover:bg-[#0f8b48] shadow-md transition-colors"
                            >
                                <Icon icon="mdi:barcode-scan" />
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-6 w-full">
                        {!searchQuery.trim() && (
                            <div className="w-full bg-[#F0FDF4]/50 rounded-[24px] p-5 shadow-sm border border-[#DCFCE7] flex-shrink-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={robotImg} alt="AI Rekomendasi" className="w-[50px] h-[50px] object-contain flex-shrink-0" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h4 className="text-[14px] font-extrabold text-[#14AE5C]">Rekomendasi AI</h4>
                                        <p className="text-[12px] font-medium text-gray-500 leading-tight mt-0.5">Berdasarkan profil nutrisi & sisa kalori kamu.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {recommendations.slice(0,4).map((rek) => (
                                        <button
                                            key={`rek-${rek.id || rek.name}`}
                                            onClick={() => setSearchQuery(rek.name)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 ${rek.bg} rounded-xl border ${rek.border} hover:shadow-sm active:scale-95 transition-all text-center`}
                                        >
                                            <Icon icon={rek.icon} className={`${rek.color} text-2xl`} />
                                            <span className="text-[11px] font-bold text-gray-800 leading-tight w-full truncate">{rek.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-[15px] font-extrabold text-gray-800 mb-4">Riwayat Makanan</h3>
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto hide-scrollbar pr-2">
                                {recentFoods.length > 0 ? recentFoods.map((item) => renderFoodRow(item, 'riwayat')) : (
                                    <div className="w-full bg-gray-50 rounded-[16px] p-6 text-center border border-dashed border-gray-200 flex flex-col items-center justify-center">
                                        <Icon icon="mdi:history" className="text-3xl text-gray-300 mb-2" />
                                        <span className="text-[13px] font-bold text-gray-400">Belum ada riwayat</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[65%] flex flex-col px-4 lg:px-0">
                    
                    {errorMessage && (
                        <div className="mb-4 rounded-[16px] border border-red-100 bg-red-50 p-4 text-[13px] font-bold text-[#F43F5E] flex items-center gap-2">
                            <Icon icon="mdi:alert-circle-outline" className="text-xl" />
                            {errorMessage}
                        </div>
                    )}

                    <div className="lg:hidden flex flex-col w-full mb-6">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-3 px-1">Riwayat Terakhir</h3>
                        <div className="flex flex-col gap-3">
                            {recentFoods.length > 0 ? recentFoods.map((item) => renderFoodRow(item, 'riwayat')) : (
                                <div className="w-full bg-white rounded-[16px] p-5 text-center border border-gray-100">
                                    <span className="text-[13px] font-medium text-gray-500">Belum ada riwayat makanan</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-[16px] md:text-[18px] font-extrabold text-gray-800">{searchQuery.trim() ? 'Hasil Pencarian' : 'Saran Makanan'}</h3>
                        <button onClick={handleRefresh} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 text-gray-500 flex justify-center items-center hover:text-[#14AE5C] active:scale-95 transition-all">
                            <Icon icon="mdi:refresh" className="text-lg" />
                        </button>
                    </div>

                    <div className="lg:hidden w-full">
                        {!searchQuery.trim() && (
                            <div className="w-full bg-[#F0FDF4]/50 rounded-[20px] p-4 shadow-sm border border-[#DCFCE7] mb-5 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <img src={robotImg} alt="AI Rekomendasi" className="w-[60px] h-[60px] object-contain flex-shrink-0 drop-shadow-sm" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h4 className="text-[13px] font-extrabold text-[#14AE5C]">Rekomendasi AI</h4>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => scrollRecommendations(-1)} className="w-7 h-7 rounded-full bg-white border border-[#DCFCE7] text-[#14AE5C] flex items-center justify-center shadow-sm active:scale-95 transition-all"><Icon icon="mdi:chevron-left" className="text-lg" /></button>
                                                <button onClick={() => scrollRecommendations(1)} className="w-7 h-7 rounded-full bg-white border border-[#DCFCE7] text-[#14AE5C] flex items-center justify-center shadow-sm active:scale-95 transition-all"><Icon icon="mdi:chevron-right" className="text-lg" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div ref={recommendationScrollRef} className="food-recommendation-scroll flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 pt-1 -mx-1 px-1">
                                    {recommendations.map((rek) => (
                                        <button
                                            key={`rek-${rek.id || rek.name}`}
                                            onClick={() => setSearchQuery(rek.name)}
                                            className={`min-w-[130px] flex items-center gap-2.5 px-3 py-2.5 ${rek.bg} rounded-xl border ${rek.border} flex-shrink-0 snap-start active:scale-95 transition-transform`}
                                        >
                                            <Icon icon={rek.icon} className={`${rek.color} text-xl flex-shrink-0`} />
                                            <div className="flex flex-col items-start min-w-0">
                                                <span className="text-[11px] font-bold text-gray-800 leading-tight w-full truncate text-left">{rek.name}</span>
                                                <span className="text-[10px] font-semibold text-gray-500">{rek.cals}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-4 pb-6 w-full">
                        {isLoading ? (
                            <div className="w-full lg:col-span-2 bg-white rounded-[20px] p-8 text-center border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                                <Icon icon="mdi:loading" className="text-4xl text-[#14AE5C] animate-spin mb-3" />
                                <span className="text-[14px] font-bold text-gray-500">Memuat data makanan...</span>
                            </div>
                        ) : foodOptions.length > 0 ? (
                            foodOptions.map((item) => renderFoodRow(item, 'saran'))
                        ) : (
                            <div className="w-full lg:col-span-2 bg-gray-50 rounded-[20px] p-8 text-center border border-dashed border-gray-200 flex flex-col items-center justify-center">
                                <Icon icon="mdi:food-off-outline" className="text-4xl text-gray-300 mb-3" />
                                <span className="text-[14px] font-bold text-gray-400">Tidak ada makanan yang cocok di database</span>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <footer className="hidden md:block w-full bg-[#FAFAFA] border-t border-gray-200 pt-16 pb-8 mt-auto z-30 relative text-left">
                <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                        <div className="flex-1 max-w-lg">
                            <div className="flex items-center gap-3 mb-5">
                                <img src={logoIcon} alt="Logo" className="w-[40px] h-[40px] object-contain" />
                                <h2 className="text-[24px] font-extrabold text-[#14AE5C]">EatSistent</h2>
                            </div>
                            <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">
                                Membangun masa depan yang lebih sehat melalui teknologi kecerdasan buatan. Kami hadir untuk membantu kamu mencapai target nutrisi harian secara cerdas dan efisien.
                            </p>
                            <div className="relative w-fit">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); togglePopover('footer-email'); }} 
                                    className="flex items-center gap-2 text-[14px] font-bold text-gray-500 hover:text-[#14AE5C] cursor-pointer w-fit transition-colors"
                                >
                                    <Icon icon="mdi:email-outline" className="text-xl" /> eatsistent@gmail.com
                                </div>
                                <ContextPopover id="footer-email" title="Hubungi Kami" content="Punya pertanyaan atau masukan? Jangan ragu untuk menghubungi tim dukungan kami melalui email eatsistent@gmail.com." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                            </div>
                        </div>

                        <div className="flex-1 max-w-xs text-left">
                            <h4 className="text-[14px] font-extrabold text-gray-800 tracking-widest mb-6 uppercase">Bantuan</h4>
                            <div className="flex flex-col gap-4 text-[14px] font-semibold text-gray-500 items-start">
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-privacy'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Kebijakan Privasi</span>
                                    <ContextPopover id="footer-privacy" title="Kebijakan Privasi" content="Informasi selengkapnya terkait Kebijakan Privasi sedang dalam tahap pengembangan dan akan segera kami perbarui. Terima kasih atas pengertiannya." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-terms'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Syarat & Ketentuan</span>
                                    <ContextPopover id="footer-terms" title="Syarat & Ketentuan" content="Halaman Syarat & Ketentuan layanan EatSistent sedang dirancang untuk memberikan kenyamanan dan keamanan terbaik bagi pengguna." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-nutrition'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Dasar Nutrisi</span>
                                    <ContextPopover id="footer-nutrition" title="Dasar Nutrisi" content="Panduan lengkap mengenai literatur dan Dasar Nutrisi akan segera hadir untuk menambah wawasan kesehatan Anda." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-[13px] font-bold text-gray-400 border-t border-gray-200 pt-8">
                        © 2026 EatSistent. All rights reserved.
                    </div>
                </div>
            </footer>
            
        </div>
    );
};

export default FoodSearchScreen;
