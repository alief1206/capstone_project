import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';
import robotImg from '../../assets/images/robot.png';
import foodImg from '../../assets/images/makanan.png';
import { getFoodLogsByDate, getMacroTotals, getTotalCalories } from '../../utils/foodLogStorage';
import { calculateNutritionTargets, getProfilePhoto, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { fetchNutritionSummary, syncFoodLogs } from '../../services/meals';
import { fetchCurrentUser } from '../../services/auth';
import { toLocalDateKey } from '../../utils/dateUtils.js';

const InsightScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail) || {});
    const currentGoal = normalizeGoal(location.state?.goal || userProfile?.goal || 'turunkan');
    const currentPath = location.pathname;
    const profilePhoto = getProfilePhoto(userEmail, userProfile) || profileImg;
    
    const [activePopover, setActivePopover] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [displayedEval, setDisplayedEval] = useState("");
    const [foodOptionIndex, setFoodOptionIndex] = useState(0);
    const [foodLogs, setFoodLogs] = useState(() => getFoodLogsByDate(userEmail, currentDate));
    const [serverSummary, setServerSummary] = useState(null);

    const togglePopover = (id) => {
        setActivePopover(prev => prev === id ? null : id);
    };

    const formatDateDisplay = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    };

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const calendarGrid = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

    const insightContent = {
        turunkan: { evalTitle: 'Evaluasi Hari Ini' },
        tambah: { evalTitle: 'Evaluasi Hari Ini' },
        jaga: { evalTitle: 'Evaluasi Hari Ini' }
    };

    const currentData = insightContent[currentGoal] || insightContent.turunkan;

    useEffect(() => {
        setFoodLogs(getFoodLogsByDate(userEmail, currentDate));
    }, [currentDate, userEmail]);

    useEffect(() => {
        if (!localStorage.getItem('authToken')) return;
        Promise.all([syncFoodLogs(userEmail), fetchNutritionSummary(currentDate)])
            .then(([, summary]) => {
                setServerSummary(summary);
                setFoodLogs(getFoodLogsByDate(userEmail, currentDate));
            })
            .catch(() => {});

        fetchCurrentUser()
            .then((profile) => setUserProfile(profile || {}))
            .catch(() => setUserProfile({}));
    }, [currentDate, userEmail]);

    const totalCalories = serverSummary?.dailySummary?.totalCalories ?? getTotalCalories(foodLogs);
    const macroTotals = serverSummary?.dailySummary ? {
        protein: serverSummary.dailySummary.protein,
        carbs: serverSummary.dailySummary.carbs,
        fat: serverSummary.dailySummary.fat,
        fiber: serverSummary.dailySummary.fiber || getMacroTotals(foodLogs).fiber
    } : getMacroTotals(foodLogs);
    
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const calorieTarget = targets.calories;
    
    const dynamicNutrients = [
        {
            id: 'kalori', label: 'Total Kalori', icon: 'mdi:card-multiple-outline', iconColor: 'text-[#14AE5C]',
            value: String(Math.round(totalCalories * 100) / 100), target: `${calorieTarget ? calorieTarget.toLocaleString('id-ID') : '-'} kkal`,
            valueColor: 'text-gray-800', status: totalCalories >= calorieTarget ? 'check' : 'down'
        },
        {
            id: 'protein', label: 'Protein', icon: 'mdi:arm-flex-outline', iconColor: 'text-[#F97316]',
            value: (macroTotals.protein).toFixed(2), target: `${targets.protein} g`, valueColor: 'text-gray-800',
            status: macroTotals.protein >= targets.protein ? 'check' : 'down'
        },
        {
            id: 'karbo', label: 'Karbohidrat', icon: 'mdi:food-croissant', iconColor: 'text-[#3B82F6]',
            value: (macroTotals.carbs).toFixed(2), target: `${targets.carbs} g`, valueColor: 'text-gray-800',
            status: macroTotals.carbs >= targets.carbs ? 'check' : 'down'
        },
        {
            id: 'lemak', label: 'Lemak', icon: 'mdi:egg-outline', iconColor: 'text-[#8B5CF6]',
            value: (macroTotals.fat).toFixed(2), target: `${targets.fat} g`, valueColor: 'text-gray-800',
            status: macroTotals.fat >= targets.fat ? 'check' : 'down'
        },
        {
            id: 'serat', label: 'Serat', icon: 'mdi:carrot', iconColor: 'text-[#14AE5C]',
            value: (macroTotals.fiber || 0).toFixed(2), target: '25 g', valueColor: 'text-gray-800',
            status: (macroTotals.fiber || 0) >= 25 ? 'check' : 'down'
        }
    ];

    const dynamicEvalDesc = totalCalories === 0
        ? 'Belum ada makanan yang dicatat hari ini. Tambahkan makanan dari Diary agar AI Insight bisa menganalisis asupanmu.'
        : `Hari ini kamu sudah mencatat ${totalCalories} kkal dari ${foodLogs.length} makanan.`;

    const insightContext = {
        sourceAction: 'insight',
        date: toLocalDateKey(currentDate),
        dailySummary: serverSummary?.dailySummary || { totalCalories, ...macroTotals },
        weeklySummary: serverSummary?.weeklySummary,
        nutrients: dynamicNutrients,
        lackingNutrients: {
            protein: Math.max(0, targets.protein - macroTotals.protein),
            carbs: Math.max(0, targets.carbs - macroTotals.carbs),
            fat: Math.max(0, targets.fat - macroTotals.fat),
            fiber: Math.max(0, 25 - (macroTotals.fiber || 0)),
            calories: Math.max(0, calorieTarget - totalCalories)
        }
    };

    const dynamicRecommendations = [
        macroTotals.protein < targets.protein && {
            title: 'Tambah Protein',
            desc: 'Pilih makanan tinggi protein agar target harian lebih dekat.',
            prompt: 'Rekomendasi tinggi protein dari ringkasan insight saya',
            img: foodImg
        },
        (macroTotals.fiber || 0) < 25 && {
            title: 'Tambah Serat',
            desc: 'Tambahkan sayur atau buah berserat untuk melengkapi asupan hari ini.',
            prompt: 'Rekomendasi kaya serat dari ringkasan insight saya',
            img: foodImg
        },
        totalCalories > calorieTarget && {
            title: 'Jaga Kalori',
            desc: 'Cari opsi rendah kalori untuk sisa hari ini.',
            prompt: 'Rekomendasi rendah kalori dari ringkasan insight saya',
            img: foodImg
        },
        {
            title: 'Menu Sesuai Target',
            desc: 'Minta AI menyusun saran berdasarkan ringkasan hari ini.',
            prompt: 'Berikan rekomendasi berdasarkan ringkasan insight saya',
            img: foodImg
        }
    ].filter(Boolean);

    useEffect(() => {
        setDisplayedEval(dynamicEvalDesc);
    }, [dynamicEvalDesc]);

    const handleRefreshFood = () => {
        setFoodOptionIndex((prev) => (prev + 1) % dynamicRecommendations.length);
    };

    const openChatWithContext = (payload) => {
        navigate('/chat-bot', {
            state: {
                goal: currentGoal,
                email: userEmail,
                initialPrompt: payload.prompt,
                initialContext: {
                    ...insightContext,
                    sourceAction: 'insight_recommendation',
                    recommendationTitle: payload.title,
                    recommendationDesc: payload.desc
                }
            }
        });
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

    return (
        <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative' onClick={() => setActivePopover(null)}>
            
            {activePopover && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActivePopover(null)}></div>
            )}

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
                                onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })}
                                className={`px-5 lg:px-7 py-2 lg:py-2.5 rounded-[100px] text-[13px] lg:text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${currentPath === item.path ? 'bg-white text-[#14AE5C] shadow-md' : 'text-gray-500 hover:text-[#14AE5C]'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                        <div className="relative z-50">
                            <button onClick={(e) => { e.stopPropagation(); togglePopover('nav-catat'); }} className="bg-[#14AE5C] text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-[100px] text-[13px] lg:text-[14px] font-bold flex items-center gap-2 hover:bg-[#108e4b] transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap">
                                <Icon icon="mdi:plus-circle-outline" className="text-[18px] lg:text-[20px]" /> Catat Makanan
                            </button>
                            {activePopover === 'nav-catat' && (
                                <div className="absolute right-0 top-full mt-3 w-[220px] lg:w-[240px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-50 animate-scaleIn origin-top-right text-left" onClick={(e) => e.stopPropagation()}>
                                    <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-[#14AE5C] border border-gray-100"><Icon icon="mdi:magnify" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Cari Manual</span>
                                    </div>
                                    <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group mt-1">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-[#14AE5C] border border-gray-100"><Icon icon="mdi:barcode-scan" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Scan Barcode</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="w-[1px] h-[30px] bg-gray-200"></div>

                        <div className="relative cursor-pointer z-50" onClick={(e) => { e.stopPropagation(); togglePopover('nav-notif'); }}>
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"><Icon icon="mdi:bell-outline" className="text-[20px] lg:text-[22px] text-gray-600" /></div>
                            <span className="absolute top-[0px] right-[2px] w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] bg-red-500 rounded-full border-[2px] lg:border-[2.5px] border-white"></span>
                            <ContextPopover id="nav-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                        </div>

                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })} className="w-[40px] h-[40px] lg:w-[44px] lg:h-[44px] rounded-full border-[2.5px] border-gray-100 cursor-pointer overflow-hidden shadow-sm">
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="md:hidden fixed top-0 w-full h-[75px] bg-white shadow-sm border-b border-gray-100 z-50 flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <img src={logoIcon} alt="Logo" className="w-[34px] h-[34px] object-contain" />
                    <h1 className="text-[22px] font-extrabold text-[#14AE5C]">EatSistent</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer z-50" onClick={(e) => { e.stopPropagation(); togglePopover('mobile-notif'); }}>
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100"><Icon icon="mdi:bell-outline" className="text-xl text-gray-600" /></div>
                        <span className="absolute top-[0px] right-[2px] w-[12px] h-[12px] bg-red-500 rounded-full border-[2.5px] border-white"></span>
                        <ContextPopover id="mobile-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                    </div>
                    <div onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })} className="w-[40px] h-[40px] rounded-full bg-gray-100 flex justify-center items-center overflow-hidden border-2 border-gray-100 cursor-pointer">
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pt-[100px] md:pt-[130px] pb-[120px] md:pb-16 flex flex-col">
                
                <div className="hidden md:flex justify-between items-center mb-6 md:mb-8 relative">
                    <h2 className="text-[24px] md:text-[32px] font-extrabold text-gray-800">AI Insight</h2>
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); togglePopover('desktop-calendar'); }} className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 rounded-[100px] shadow-sm hover:border-[#14AE5C] hover:text-[#14AE5C] transition-colors font-bold text-gray-700 text-[13px] md:text-[15px]">
                            <Icon icon="mdi:calendar-month-outline" className="text-xl" /> Pilih Tanggal
                        </button>
                        
                        {activePopover === 'desktop-calendar' && (
                            <div className="absolute right-0 top-full mt-3 bg-white w-[320px] rounded-[24px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 animate-scaleIn origin-top-right cursor-default" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <Icon icon="mdi:chevron-left" className="text-xl cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => handleMonthChange(-1)} />
                                    <span className="font-extrabold text-[15px] text-gray-800">
                                        {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
                                    </span>
                                    <Icon icon="mdi:chevron-right" className="text-xl cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => handleMonthChange(1)} />
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                                        <div key={i} className="text-[12px] font-bold text-gray-400">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                                    {calendarGrid.map((day, i) => {
                                        const isSelected = day === currentDate.getDate();
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    if (day) {
                                                        const newDate = new Date(currentDate);
                                                        newDate.setDate(day);
                                                        setCurrentDate(newDate);
                                                        setActivePopover(null);
                                                    }
                                                }}
                                                className={`w-9 h-9 mx-auto flex justify-center items-center rounded-full text-[13px] font-bold cursor-pointer transition-all ${
                                                    day ? (isSelected ? 'bg-[#14AE5C] text-white shadow-md' : 'text-gray-700 hover:bg-[#F0FDF4] hover:text-[#14AE5C]') : 'text-transparent pointer-events-none'
                                                }`}
                                            >
                                                {day || ''}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex md:hidden items-center justify-between bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm mb-6 hover:shadow-md transition-shadow">
                    <Icon icon="mdi:chevron-left" className="text-2xl text-gray-400 cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(d);}} />
                    <span className="text-[14px] font-bold text-gray-800 tracking-wide">{formatDateDisplay(currentDate)}</span>
                    <Icon icon="mdi:chevron-right" className="text-2xl text-gray-400 cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(d);}} />
                </div>

                <button
                    type="button"
                    onClick={() => openChatWithContext({
                        title: 'Evaluasi Hari Ini',
                        desc: dynamicEvalDesc,
                        prompt: 'Evaluasi hari ini, nutrisi apa saja yang masih kurang?',
                        sourceAction: 'today_evaluation'
                    })}
                    className="w-full text-left bg-gradient-to-r from-[#E8F5EE] to-[#F0FDF4] rounded-[28px] p-6 md:p-8 mb-8 flex items-center gap-5 md:gap-6 border border-[#DCFCE7] shadow-sm hover:shadow-md hover:border-[#14AE5C] transition-all active:scale-[0.99] group"
                >
                    <div className="w-[70px] h-[70px] md:w-[85px] md:h-[85px] bg-white rounded-full flex justify-center items-center shadow-sm border border-gray-100 flex-shrink-0">
                        <img src={robotImg} className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] object-contain drop-shadow-sm" alt="AI" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[16px] md:text-[18px] font-extrabold text-gray-800 mb-1 group-hover:text-[#14AE5C] transition-colors">{currentData.evalTitle}</h3>
                        <p className="text-[13px] md:text-[14px] font-medium text-gray-600 leading-relaxed min-h-[40px]">
                            {displayedEval}
                            <span className="animate-pulse text-[#14AE5C] font-bold ml-1">|</span>
                        </p>
                    </div>
                    <div className="hidden md:flex w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm text-[#14AE5C] group-hover:bg-[#14AE5C] group-hover:text-white transition-colors">
                        <Icon icon="mdi:chevron-right" className="text-2xl" />
                    </div>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                    <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                        <h3 className="text-[14px] font-extrabold text-gray-800 tracking-widest uppercase mb-6">Ringkasan</h3>
                        <div className="flex flex-col flex-1">
                            {dynamicNutrients.map((item, idx) => (
                                <div key={item.id} className={`flex justify-between items-center py-4 ${idx !== dynamicNutrients.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconColor}`}>
                                            <Icon icon={item.icon} className="text-[26px]" />
                                        </div>
                                        <span className="text-[15px] font-extrabold text-gray-800">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-[14px] text-right">
                                            <span className="font-medium text-gray-600">{item.value}</span>
                                            <span className="font-medium text-gray-400"> / {item.target}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'check' ? 'bg-[#E8F5EE] text-[#14AE5C]' : 'bg-[#FFE4E6] text-[#F43F5E]'}`}>
                                            <Icon 
                                                icon={item.status === 'check' ? "mdi:check" : "mdi:arrow-down"} 
                                                className="text-[16px] font-bold" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
    
                    <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[14px] font-extrabold text-gray-800 tracking-widest uppercase">Rekomendasi AI</h3>
                            <button 
                                onClick={handleRefreshFood}
                                className="w-9 h-9 flex justify-center items-center rounded-full bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#14AE5C] hover:bg-[#F0FDF4] hover:border-[#14AE5C] transition-all"
                            >
                                <Icon icon="mdi:refresh" className="text-xl" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4 flex-1">
                            {dynamicRecommendations.slice(0, 3).length > 0 ? (
                                dynamicRecommendations.slice(0, 3).map((rec, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => openChatWithContext({
                                            ...rec,
                                            sourceAction: 'insight_recommendation'
                                        })}
                                        className="w-full flex items-center gap-4 text-left active:scale-[0.99] transition-transform p-3 md:p-4 rounded-[20px] border-[1.5px] border-gray-100 hover:border-[#14AE5C] hover:bg-[#F0FDF4] group"
                                    >
                                        <div className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] rounded-[16px] overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                            <img src={rec.img} className="w-full h-full object-cover" alt="food recommendation" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[14px] md:text-[15px] font-extrabold text-[#14AE5C] leading-relaxed mb-1">
                                                {rec.title}
                                            </p>
                                            <p className="text-[12px] md:text-[13px] font-medium text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">
                                                {rec.desc}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="w-full flex items-center justify-center p-6 border-[1.5px] border-dashed border-gray-200 rounded-[20px] bg-gray-50 flex-1">
                                    <p className="text-[13px] font-medium text-gray-400 italic text-center">Kamu sudah memenuhi semua target hari ini dengan sangat baik.</p>
                                </div>
                            )}
                        </div>
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
                            <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">Membangun masa depan yang lebih sehat melalui teknologi kecerdasan buatan. Kami hadir untuk membantu kamu mencapai target nutrisi harian secara cerdas dan efisien.</p>
                            <div className="relative w-fit cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePopover('footer-email'); }}>
                                <span className="flex items-center gap-2 text-[14px] font-bold text-gray-500 hover:text-[#14AE5C] transition-colors"><Icon icon="mdi:email-outline" className="text-xl" /> eatsistent@gmail.com</span>
                                <ContextPopover id="footer-email" title="Hubungi Kami" content="Punya pertanyaan atau masukan? Jangan ragu untuk menghubungi tim dukungan kami melalui email eatsistent@gmail.com." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                            </div>
                        </div>
                        <div className="flex-1 max-w-xs text-left">
                            <h4 className="text-[14px] font-extrabold text-gray-800 tracking-widest mb-6 uppercase">Bantuan</h4>
                            <div className="flex flex-col gap-4 text-[14px] font-semibold text-gray-500 items-start">
                                <div className="relative w-fit">
                                    <span className="cursor-pointer hover:text-[#14AE5C]" onClick={(e) => { e.stopPropagation(); togglePopover('footer-privacy'); }}>Kebijakan Privasi</span>
                                    <ContextPopover id="footer-privacy" title="Kebijakan Privasi" content="Informasi selengkapnya terkait Kebijakan Privasi sedang dalam tahap pengembangan dan akan segera kami perbarui. Terima kasih atas pengertiannya." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span className="cursor-pointer hover:text-[#14AE5C]" onClick={(e) => { e.stopPropagation(); togglePopover('footer-terms'); }}>Syarat & Ketentuan</span>
                                    <ContextPopover id="footer-terms" title="Syarat & Ketentuan" content="Halaman Syarat & Ketentuan layanan EatSistent sedang dirancang untuk memberikan kenyamanan dan keamanan terbaik bagi pengguna." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span className="cursor-pointer hover:text-[#14AE5C]" onClick={(e) => { e.stopPropagation(); togglePopover('footer-nutrition'); }}>Dasar Nutrisi</span>
                                    <ContextPopover id="footer-nutrition" title="Dasar Nutrisi" content="Panduan lengkap mengenai literatur dan Dasar Nutrisi akan segera hadir untuk menambah wawasan kesehatan Anda." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-[13px] font-bold text-gray-400 border-t border-gray-200 pt-8">© 2026 EatSistent. All rights reserved.</div>
                </div>
            </footer>

            {activePopover === 'mobile-catat' && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] md:hidden" onClick={() => setActivePopover(null)}></div>
                    <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white rounded-[28px] p-6 shadow-2xl z-[101] md:hidden animate-scaleIn origin-bottom text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[18px] font-extrabold text-gray-800">Pilih Mode Pencatatan</h3>
                            <button onClick={() => setActivePopover(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors border border-gray-100">
                                <Icon icon="mdi:close" className="text-xl" />
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center">Cari<br/>Manual</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100"><Icon icon="mdi:barcode-scan" /></div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center leading-tight">Scan<br/>Barcode</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="md:hidden fixed bottom-0 left-0 w-full z-40">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
                    <button onClick={(e) => { e.stopPropagation(); togglePopover('mobile-catat'); }} className="w-[72px] h-[72px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-4xl shadow-[0_8px_20px_rgba(20,174,92,0.4)] hover:scale-105 active:scale-95 transition-transform border-[6px] border-white">
                        <Icon icon="mdi:plus" />
                    </button>
                </div>
                <div className="w-full h-[80px] bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.06)] rounded-t-[28px] flex justify-between items-center px-6 z-40 relative">
                    {[
                        { path: '/dashboard', icon: 'mdi:home', label: 'Beranda' },
                        { path: '/diary', icon: 'mdi:notebook', label: 'Diary' },
                        { spacer: true },
                        { path: '/progress', icon: 'mdi:chart-bar', label: 'Progress' },
                        { path: '/insight', icon: 'mdi:chart-line', label: 'Insight' }
                    ].map((item, idx) => (
                        item.spacer ? <div key="spacer" className="w-[60px]"></div> :
                        <div key={idx} onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1.5 cursor-pointer w-[50px] pt-2">
                            <Icon icon={item.icon} className={`text-[26px] transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-300'}`} />
                            <span className={`text-[11px] font-extrabold transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default InsightScreen;
