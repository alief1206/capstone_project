import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import robotImg from '../../assets/images/robot.png';
import foodImg from '../../assets/images/makanan.png';
import { getFoodLogsByDate, getMacroSources, getMacroTotals, getTotalCalories } from '../../utils/foodLogStorage';
import { calculateNutritionTargets, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { fetchNutritionSummary, syncFoodLogs } from '../../services/meals';
import { fetchCurrentUser } from '../../services/auth';

const InsightScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail));
    const currentGoal = normalizeGoal(location.state?.goal || userProfile.goal || 'turunkan');
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [expandedNutrient, setExpandedNutrient] = useState(null);

    const [displayedEval, setDisplayedEval] = useState("");
    const [foodOptionIndex, setFoodOptionIndex] = useState(0);
    const [foodLogs, setFoodLogs] = useState(() => getFoodLogsByDate(userEmail, currentDate));
    const [serverSummary, setServerSummary] = useState(null);

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
        turunkan: {
            evalTitle: 'Evaluasi Hari Ini',
            fullEvalDesc: 'Hebat! Kamu sudah mendekati target harianmu.',
            aiRecommendations: [
                { title: 'Perbanyak Serat & Sayur', desc: 'Coba tambahkan telur atau dada ayam besok.', img: foodImg },
                { title: 'Opsi Camilan Sehat', desc: 'Pilih apel atau pir untuk camilan sore agar kalori tetap terjaga.', img: foodImg },
                { title: 'Protein Tanpa Lemak', desc: 'Coba ikan panggang untuk makan malam yang ringan tapi bergizi.', img: foodImg }
            ],
            nutrients: [
                { id: 'kalori', label: 'Total Kalori', icon: 'mdi:card-multiple', iconColor: 'text-[#14AE5C]', value: '750', target: '1.500 kkal', valueColor: 'text-gray-500', status: 'check', sources: [] },
                { id: 'protein', label: 'Protein', icon: 'mdi:arm-flex-outline', iconColor: 'text-[#F97316]', value: '80', target: '100 g', valueColor: 'text-[#F97316]', status: 'down', sources: [{ name: 'Dada Ayam', qty: '40g' }, { name: 'Susu', qty: '40g' }] },
                { id: 'karbo', label: 'Karbohidrat', icon: 'mdi:food-croissant', iconColor: 'text-[#3B82F6]', value: '160', target: '220 g', valueColor: 'text-[#3B82F6]', status: 'check', sources: [{ name: 'Nasi Putih', qty: '150g' }, { name: 'Roti', qty: '30g' }] },
                { id: 'lemak', label: 'Lemak', icon: 'mdi:egg-outline', iconColor: 'text-[#8B5CF6]', value: '45', target: '60 g', valueColor: 'text-[#8B5CF6]', status: 'check', sources: [{ name: 'Alpukat', qty: '45g' }] },
                { id: 'serat', label: 'Serat', icon: 'mdi:leaf', iconColor: 'text-[#14AE5C]', value: '12', target: '25 g', valueColor: 'text-[#14AE5C]', status: 'down', sources: [{ name: 'Sayur Bayam', qty: '12g' }] },
                { id: 'air', label: 'Air', icon: 'mdi:water', iconColor: 'text-[#0EA5E9]', value: '1,2', target: '2 L', valueColor: 'text-[#0EA5E9]', status: 'down', sources: [] }
            ]
        }
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
            .catch((error) => console.warn('Gagal sinkron insight:', error.message));

        fetchCurrentUser()
            .then((profile) => setUserProfile(profile || {}))
            .catch(() => setUserProfile({}));
    }, [currentDate, userEmail]);

    const totalCalories = serverSummary?.dailySummary?.totalCalories ?? getTotalCalories(foodLogs);
    const macroTotals = serverSummary?.dailySummary ? {
        protein: serverSummary.dailySummary.protein,
        carbs: serverSummary.dailySummary.carbs,
        fat: serverSummary.dailySummary.fat,
        fiber: serverSummary.dailySummary.fiber
    } : getMacroTotals(foodLogs);
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const calorieTarget = targets.calories;
    const dynamicNutrients = [
        {
            id: 'kalori',
            label: 'Total Kalori',
            icon: 'mdi:card-multiple',
            iconColor: 'text-[#14AE5C]',
            value: String(totalCalories),
            target: `${calorieTarget.toLocaleString('id-ID')} kkal`,
            valueColor: 'text-gray-500',
            status: totalCalories <= calorieTarget ? 'check' : 'down',
            sources: foodLogs.map((food) => ({ name: food.name, qty: `${food.calories} kkal` }))
        },
        {
            id: 'protein',
            label: 'Protein',
            icon: 'mdi:arm-flex-outline',
            iconColor: 'text-[#F97316]',
            value: String(macroTotals.protein),
            target: `${targets.protein} g`,
            valueColor: 'text-[#F97316]',
            status: macroTotals.protein >= targets.protein ? 'check' : 'down',
            sources: getMacroSources(foodLogs, 'protein')
        },
        {
            id: 'karbo',
            label: 'Karbohidrat',
            icon: 'mdi:food-croissant',
            iconColor: 'text-[#3B82F6]',
            value: String(macroTotals.carbs),
            target: `${targets.carbs} g`,
            valueColor: 'text-[#3B82F6]',
            status: macroTotals.carbs <= targets.carbs ? 'check' : 'down',
            sources: getMacroSources(foodLogs, 'carbs')
        },
        {
            id: 'lemak',
            label: 'Lemak',
            icon: 'mdi:egg-outline',
            iconColor: 'text-[#8B5CF6]',
            value: String(macroTotals.fat),
            target: `${targets.fat} g`,
            valueColor: 'text-[#8B5CF6]',
            status: macroTotals.fat <= targets.fat ? 'check' : 'down',
            sources: getMacroSources(foodLogs, 'fat')
        }
    ];
    const dynamicEvalDesc = totalCalories === 0
        ? 'Belum ada makanan yang dicatat hari ini. Tambahkan makanan dari Diary agar AI Insight bisa menganalisis asupanmu.'
        : `Hari ini kamu sudah mencatat ${totalCalories} kkal dari ${foodLogs.length} makanan.`;

    const insightContext = {
        sourceAction: 'insight',
        date: currentDate.toISOString().slice(0, 10),
        dailySummary: serverSummary?.dailySummary || { totalCalories, ...macroTotals },
        weeklySummary: serverSummary?.weeklySummary,
        nutrients: dynamicNutrients
    };

    const dynamicRecommendations = [
        macroTotals.protein < targets.protein && {
            title: 'Tambah Protein',
            desc: 'Pilih makanan tinggi protein agar target harian lebih dekat.',
            prompt: 'Rekomendasi tinggi protein dari ringkasan insight saya',
            img: foodImg
        },
        macroTotals.fiber < 25 && {
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
        let i = 0;
        setDisplayedEval("");
        const typingInterval = setInterval(() => {
            if (i < dynamicEvalDesc.length) {
                setDisplayedEval((prev) => prev + dynamicEvalDesc.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30);
        return () => clearInterval(typingInterval);
    }, [currentGoal, currentDate, dynamicEvalDesc]);

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
                    sourceAction: payload.sourceAction,
                    recommendationTitle: payload.title,
                    recommendationDesc: payload.desc
                }
            }
        });
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-[#F8FAFC] shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-14 px-6 pb-4 flex justify-between items-center z-10 flex-shrink-0">
                    <h2 className="text-[24px] font-bold text-black tracking-wide">AI Insight</h2>
                    <button onClick={() => setShowCalendar(true)} className="text-2xl text-black">
                        <Icon icon="mdi:calendar-month-outline" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-[120px] hide-scrollbar px-6 pt-2">
                    
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm mb-6 justify-between">
                        <Icon icon="mdi:chevron-left" className="text-xl text-gray-400 cursor-pointer hover:text-[#14AE5C]" onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(d);}} />
                        <span className="text-[12px] font-bold text-black">{formatDateDisplay(currentDate)}</span>
                        <Icon icon="mdi:chevron-right" className="text-xl text-gray-400 cursor-pointer hover:text-[#14AE5C]" onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(d);}} />
                    </div>

                    <button
                        type="button"
                        onClick={() => openChatWithContext({
                            title: 'Evaluasi Hari Ini',
                            desc: dynamicEvalDesc,
                            prompt: 'Evaluasi hari ini, nutrisi apa saja yang masih kurang?',
                            sourceAction: 'today_evaluation'
                        })}
                        className="w-full text-left bg-[#E8F5EE] rounded-[24px] p-5 mb-6 flex items-center gap-4 relative border border-[#DCFCE7] active:scale-[0.99] transition-transform"
                    >
                        <img src={robotImg} className="w-[80px] h-[80px] object-contain" alt="AI" />
                        <div>
                            <h3 className="text-[14px] font-bold text-black">{currentData.evalTitle}</h3>
                            <p className="text-[11px] font-medium text-gray-600 mt-1 leading-relaxed min-h-[32px]">
                                {displayedEval}
                                <span className="animate-pulse">|</span>
                            </p>
                        </div>
                    </button>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 mb-6">
                        <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-2">RINGKASAN</h3>
                        <div className="flex flex-col">
                            {dynamicNutrients.map((item, idx) => (
                                <div key={item.id} className={`flex flex-col py-3 ${idx !== dynamicNutrients.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div 
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => setExpandedNutrient(expandedNutrient === item.id ? null : item.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon icon={item.icon} className={`text-xl ${item.iconColor}`} />
                                            <span className="text-[13px] font-bold text-gray-800">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-[12px]">
                                                <span className={`font-bold ${item.valueColor}`}>{item.value}</span>
                                                <span className="font-medium text-gray-400"> / {item.target}</span>
                                            </div>
                                            <Icon 
                                                icon={item.status === 'check' ? "mdi:check-circle" : "mdi:arrow-down-circle"} 
                                                className={`text-[18px] ${item.status === 'check' ? 'text-[#14AE5C]' : 'text-[#F43F5E]'}`} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {expandedNutrient === item.id && item.sources.length > 0 && (
                                        <div className="mt-3 ml-8 p-3 bg-[#F8FAFC] rounded-xl flex flex-col gap-2">
                                            {item.sources.map((src, i) => (
                                                <div key={i} className="flex justify-between items-center text-[11px]">
                                                    <span className="text-gray-600 font-medium">{src.name}</span>
                                                    <span className="font-bold text-black">{src.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 mb-4 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[12px] font-bold text-black uppercase tracking-wider">REKOMENDASI AI</h3>
                            <button 
                                onClick={handleRefreshFood}
                                className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-50 text-gray-400 hover:text-[#14AE5C] hover:bg-[#F0FDF4] transition-colors"
                            >
                                <Icon icon="mdi:refresh" className="text-lg" />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => openChatWithContext({
                                ...dynamicRecommendations[foodOptionIndex],
                                sourceAction: 'insight_recommendation'
                            })}
                            className="w-full flex items-start gap-4 text-left active:scale-[0.99] transition-transform"
                        >
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-[#14AE5C] leading-relaxed">
                                    {dynamicRecommendations[foodOptionIndex].title}
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 mt-1 leading-relaxed pr-2">
                                    {dynamicRecommendations[foodOptionIndex].desc}
                                </p>
                            </div>
                            <div className="w-[80px] h-[60px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img 
                                    src={dynamicRecommendations[foodOptionIndex].img} 
                                    className="w-full h-full object-cover" 
                                    alt="food" 
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {showCalendar && (
                    <div className="absolute inset-0 bg-white/40 z-[70] flex justify-center items-center px-4" onClick={() => setShowCalendar(false)}>
                        <div className="bg-white w-full max-w-[320px] rounded-[24px] p-5 shadow-2xl animate-scaleIn -mt-[350px]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <Icon icon="mdi:chevron-left" className="text-2xl cursor-pointer text-gray-600 hover:text-[#14AE5C]" onClick={() => handleMonthChange(-1)} />
                                <span className="font-bold text-[16px] text-black">
                                    {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
                                </span>
                                <Icon icon="mdi:chevron-right" className="text-2xl cursor-pointer text-gray-600 hover:text-[#14AE5C]" onClick={() => handleMonthChange(1)} />
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                                    <div key={i} className="text-[11px] font-bold text-gray-400">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
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
                                                    setShowCalendar(false);
                                                }
                                            }}
                                            className={`w-9 h-9 mx-auto flex justify-center items-center rounded-full text-[13px] font-bold cursor-pointer transition-colors ${
                                                day ? (isSelected ? 'bg-[#14AE5C] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100') : 'text-transparent pointer-events-none'
                                            }`}
                                        >
                                            {day || ''}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {isActionMenuOpen && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex flex-col justify-end items-center pb-[120px]" onClick={() => setIsActionMenuOpen(false)}>
                        <button onClick={() => setIsActionMenuOpen(false)} className="absolute top-10 left-6 text-white text-3xl hover:scale-110 transition-transform"><Icon icon="mdi:close" /></button>
                        <div className="w-[350px] flex justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:barcode-scan" /></div>
                                <span className="text-[13px] font-bold text-black text-center leading-tight">Pemindai Kode Batang</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-50">
                    <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="w-[56px] h-[56px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-3xl shadow-[0_4px_12px_rgba(20,174,92,0.5)] hover:scale-105 transition-transform"><Icon icon="mdi:plus" /></button>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-20" style={{ filter: 'drop-shadow(0px -4px 10px rgba(0,0,0,0.05))' }}>
                    <div className="absolute bottom-[35px] left-1/2 -translate-x-1/2 w-[80px] h-[80px] bg-white rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[75px] bg-white flex justify-around items-end pb-3 px-2 rounded-t-[20px]">
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightScreen;
