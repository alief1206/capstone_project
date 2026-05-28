import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import robotImg from '../../assets/images/robot.png';
import { addFoodLog, parseCalories } from '../../utils/foodLogStorage';
import { createFoodLog } from '../../services/meals';
import { fetchFoodCatalog } from '../../services/foods';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeMealMenu, setActiveMealMenu] = useState(null);
    const [recentFoods, setRecentFoods] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [foodOptions, setFoodOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const recommendationScrollRef = useRef(null);

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
        if (meal === 'CAMILAN' && isHeavyFood(item.name)) {
            alert(`Validasi Gagal: ${item.name} termasuk makanan berat, tidak boleh dimasukkan ke Camilan.`);
            return;
        }

        const calories = Number(item.calories || parseCalories(item.cals));
        const foodPayload = {
            foodName: item.name,
            calories,
            mealType: meal
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
            bg: item.bg
        });
        navigate('/diary', { state: { goal: selectedGoal, email: userEmail } });
    };

    const renderFoodRow = (item, keyPrefix) => {
        const menuKey = `${keyPrefix}-${item.id || item.name}`;

        return (
            <div key={menuKey} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3`}>
                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[14px] font-bold text-black truncate">{item.name}</span>
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
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-12 px-4 pb-4 flex items-center gap-4 bg-white z-10 flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="text-2xl text-black font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <h2 className="text-[18px] font-bold text-black flex-1 text-center pr-8">Pilih Santapan</h2>
                </div>

                <div className="px-4 mb-4 flex-shrink-0">
                    <div className="relative w-full h-[50px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                            <Icon icon="mdi:magnify" />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari makanan dari data TKPI" 
                            className="w-full h-full border-[1.5px] border-gray-200 rounded-[16px] pl-12 pr-14 font-medium outline-none focus:border-[#14AE5C] transition-all text-[14px]"
                        />
                        <button 
                            onClick={() => navigate('/scan-barcode', { state: { goal: selectedGoal, email: userEmail } })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-[#14AE5C] rounded-[10px] flex justify-center items-center text-white text-lg hover:bg-[#0f8b48] transition-colors"
                        >
                            <Icon icon="mdi:barcode-scan" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 hide-scrollbar">
                    {errorMessage && (
                        <div className="mb-4 rounded-[16px] border border-red-100 bg-red-50 p-3 text-[12px] font-semibold text-[#F43F5E]">
                            {errorMessage}
                        </div>
                    )}

                    <h3 className="text-[15px] font-bold text-black mb-3">Riwayat</h3>
                    <div className="flex flex-col gap-3 mb-6">
                        {recentFoods.length > 0 ? recentFoods.map((item) => renderFoodRow(item, 'riwayat')) : (
                            <div className="w-full bg-white rounded-[16px] p-4 text-center border border-gray-100">
                                <span className="text-[13px] font-medium text-gray-500">Belum ada riwayat makanan</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[15px] font-bold text-black">{searchQuery.trim() ? 'Hasil Pencarian' : 'Saran Data-Science'}</h3>
                        <button onClick={handleRefresh} className="text-[#14AE5C] text-lg hover:rotate-180 transition-transform duration-300">
                            <Icon icon="mdi:refresh" />
                        </button>
                    </div>

                    {!searchQuery.trim() && (
                        <div className="w-full bg-[#F0FDF4]/50 rounded-[20px] p-4 shadow-sm border border-[#DCFCE7] mb-4 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <img src={robotImg} alt="AI Rekomendasi" className="w-[70px] h-[58px] object-contain flex-shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <h4 className="text-[12px] font-bold text-[#14AE5C]">Rekomendasi dari Data TKPI</h4>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => scrollRecommendations(-1)}
                                                className="w-7 h-7 rounded-full bg-white border border-[#DCFCE7] text-[#14AE5C] flex items-center justify-center shadow-sm active:scale-95 transition-all"
                                                aria-label="Geser rekomendasi ke kiri"
                                            >
                                                <Icon icon="mdi:chevron-left" className="text-lg" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => scrollRecommendations(1)}
                                                className="w-7 h-7 rounded-full bg-white border border-[#DCFCE7] text-[#14AE5C] flex items-center justify-center shadow-sm active:scale-95 transition-all"
                                                aria-label="Geser rekomendasi ke kanan"
                                            >
                                                <Icon icon="mdi:chevron-right" className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                    <div ref={recommendationScrollRef} className="food-recommendation-scroll flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-2 -mx-1 px-1">
                                        {recommendations.map((rek) => (
                                            <button
                                                key={`rek-${rek.id || rek.name}`}
                                                onClick={() => setSearchQuery(rek.name)}
                                                className={`min-w-[140px] max-w-[150px] flex items-center gap-2 px-3 py-2 ${rek.bg} rounded-lg border ${rek.border} flex-shrink-0 snap-start active:scale-[0.98] transition-transform`}
                                            >
                                                <Icon icon={rek.icon} className={`${rek.color} text-lg flex-shrink-0`} />
                                                <div className="flex flex-col items-start min-w-0">
                                                    <span className="text-[10px] font-bold text-black leading-tight w-full truncate">{rek.name}</span>
                                                    <span className="text-[9px] font-medium text-gray-500">{rek.cals}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3 pb-6">
                        {isLoading ? (
                            <div className="w-full bg-white rounded-[16px] p-4 text-center border border-gray-100">
                                <span className="text-[13px] font-medium text-gray-500">Memuat data makanan...</span>
                            </div>
                        ) : foodOptions.length > 0 ? (
                            foodOptions.map((item) => renderFoodRow(item, 'saran'))
                        ) : (
                            <div className="w-full bg-white rounded-[16px] p-4 text-center border border-gray-100">
                                <span className="text-[13px] font-medium text-gray-500">Tidak ada makanan yang cocok di data TKPI</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodSearchScreen;
