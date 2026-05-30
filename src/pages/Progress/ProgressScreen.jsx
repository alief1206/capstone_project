import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getFoodLogsInLastDays, getMacroTotals, getTotalCalories } from '../../utils/foodLogStorage';
import { calculateNutritionTargets, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { getWeightLogs, getWeightLogsInRange, mergeWeightLogs, summarizeWeightLogs, upsertWeightLog } from '../../utils/weightLogStorage';
import { createWeightLog, fetchCurrentUser, fetchWeightTrend } from '../../services/auth';
import { fetchNutritionSummary, syncFoodLogs } from '../../services/meals';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';

const ProgressScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail));
    const currentGoal = normalizeGoal(location.state?.goal || userProfile.goal || 'turunkan');
    const currentPath = location.pathname;
    
    const [activePopover, setActivePopover] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimeRange, setShowTimeRange] = useState(false);
    const [timeRange, setTimeRange] = useState('7 Hari Terakhir');
    const timeRanges = ['7 Hari Terakhir', '14 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini'];
    const [dailyWeight, setDailyWeight] = useState('');
    const [weightLogs, setWeightLogs] = useState(() => getWeightLogs(userEmail));
    const [serverSummary, setServerSummary] = useState(null);

    const [toast, setToast] = useState({ show: false, title: '', message: '', icon: '' });

    const showToast = (title, message, icon = 'mdi:information-variant') => {
        setToast({ show: true, title, message, icon });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    };

    const togglePopover = (id) => {
        setActivePopover(prev => prev === id ? null : id);
    };

    const daysByRange = {
        '7 Hari Terakhir': 7,
        '14 Hari Terakhir': 14,
        '30 Hari Terakhir': 30,
        'Bulan Ini': new Date().getDate()
    };

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const calendarGrid = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

    useEffect(() => {
        if (userProfile.currentWeight && getWeightLogs(userEmail).length === 0) {
            upsertWeightLog(userEmail, Number(userProfile.currentWeight));
        }
        setWeightLogs(getWeightLogs(userEmail));
    }, [userEmail, userProfile.currentWeight]);

    useEffect(() => {
        if (!localStorage.getItem('authToken')) return;
        Promise.all([fetchWeightTrend('monthly'), syncFoodLogs(userEmail), fetchNutritionSummary(currentDate)])
            .then(([weightResponse, , nutritionSummary]) => {
                setWeightLogs(mergeWeightLogs(userEmail, weightResponse.data || []));
                setServerSummary(nutritionSummary);
            })
            .catch(() => {});

        fetchCurrentUser()
            .then((profile) => setUserProfile(profile || {}))
            .catch(() => setUserProfile({}));
    }, [userEmail, currentDate]);

    const selectedDays = daysByRange[timeRange] || 7;
    const foodLogs = getFoodLogsInLastDays(userEmail, selectedDays);
    const useWeeklyServerSummary = selectedDays === 7 && serverSummary?.weeklySummary;
    const totalCalories = useWeeklyServerSummary ? serverSummary.weeklySummary.totalCalories : getTotalCalories(foodLogs);
    const macroTotals = useWeeklyServerSummary ? serverSummary.weeklySummary : getMacroTotals(foodLogs);
    const averageCalories = useWeeklyServerSummary ? Math.round(serverSummary.weeklySummary.averageCaloriesPerDay || 0) : (foodLogs.length > 0 ? Math.round(totalCalories / selectedDays) : 0);
    const dailyCalories = useWeeklyServerSummary ? (serverSummary.weeklySummary.chartData || []).map((day) => Number(day.totalCalories || 0)) : foodLogs.map((food) => Number(food.calories || 0));
    const highestCalories = dailyCalories.length > 0 ? Math.max(...dailyCalories) : 0;
    const lowestCalories = dailyCalories.length > 0 ? Math.min(...dailyCalories) : 0;
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const targetCalories = targets.calories;
    const averageProtein = (useWeeklyServerSummary || foodLogs.length > 0) ? Math.round(Number(macroTotals.protein || 0) / selectedDays) : 0;
    
    const activeDateKeys = new Set(
        useWeeklyServerSummary
            ? (serverSummary.weeklySummary.chartData || []).map((day) => new Date(day.date).toDateString())
            : getFoodLogsInLastDays(userEmail, 7).map((food) => new Date(food.logDate || food.createdAt).toDateString())
    );
    
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
            date,
            label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date).slice(0, 1).toUpperCase(),
            active: activeDateKeys.has(date.toDateString())
        };
    });

    const rangeWeightLogs = useMemo(() => getWeightLogsInRange(userEmail, selectedDays), [userEmail, selectedDays, weightLogs]);
    const weeklyWeightSummary = summarizeWeightLogs(getWeightLogsInRange(userEmail, 7));
    const monthlyWeightSummary = summarizeWeightLogs(getWeightLogsInRange(userEmail, 30));
    const selectedWeightSummary = summarizeWeightLogs(rangeWeightLogs);
    const latestWeight = selectedWeightSummary.latestWeight || Number(userProfile.currentWeight || 0);
    
    const weightDeltaText = selectedWeightSummary.delta === 0
        ? 'stabil'
        : `${Math.abs(selectedWeightSummary.delta).toLocaleString('id-ID')} kg ${selectedWeightSummary.delta > 0 ? 'naik' : 'turun'}`;
        
    const chartLogs = rangeWeightLogs.length ? rangeWeightLogs : (latestWeight ? [{ logDate: new Date().toISOString(), weight: latestWeight }] : []);
    const chartWeights = chartLogs.map((log) => Number(log.weight || 0));
    const chartMin = chartWeights.length ? Math.floor(Math.min(...chartWeights) - 1) : 0;
    const chartMax = chartWeights.length ? Math.ceil(Math.max(...chartWeights) + 1) : 1;
    const chartSpan = Math.max(chartMax - chartMin, 1);
    
    const chartPoints = chartLogs.map((log, index) => {
        const x = chartLogs.length === 1 ? 270 : (index / (chartLogs.length - 1)) * 270;
        const y = 100 - (((Number(log.weight || 0) - chartMin) / chartSpan) * 90);
        return { ...log, x, y };
    });
    
    const chartLabelStep = Math.max(1, Math.ceil(chartLogs.length / 4));
    const chartLabelLogs = chartLogs.filter((_, index) => index === 0 || index === chartLogs.length - 1 || index % chartLabelStep === 0);
    
    const linePath = chartPoints.length
        ? chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
        : '';
    const areaPath = chartPoints.length ? `${linePath} V 110 H ${chartPoints[0].x} Z` : '';
    const lastPoint = chartPoints[chartPoints.length - 1];

    const handleSaveWeight = async () => {
        if (!dailyWeight || Number(dailyWeight) <= 0) return;
        const saved = upsertWeightLog(userEmail, Number(dailyWeight), currentDate);
        setWeightLogs(getWeightLogs(userEmail));
        setDailyWeight('');

        if (!localStorage.getItem('authToken')) return;
        try {
            await createWeightLog({ weight: saved.weight, logDate: saved.logDate });
        } catch (error) {}
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

            <div className={`fixed z-[999] transition-all duration-500 transform ${toast.show ? 'top-10 opacity-100 translate-y-0' : '-top-20 opacity-0 -translate-y-full'} left-1/2 -translate-x-1/2 lg:left-auto lg:-translate-x-0 lg:right-10 flex items-start gap-4 bg-white px-5 md:px-6 py-4 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 w-[90%] max-w-[360px]`}>
                <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center border border-[#DCFCE7] flex-shrink-0 mt-0.5">
                    <Icon icon={toast.icon} className="text-xl text-[#14AE5C]" />
                </div>
                <div className="flex flex-col text-left">
                    <h4 className="text-[14px] font-extrabold text-gray-800">{toast.title}</h4>
                    <p className="text-[12px] font-medium text-gray-500 mt-1 leading-relaxed">{toast.message}</p>
                </div>
            </div>

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
                                className={`px-5 lg:px-7 py-2 lg:py-2.5 rounded-[100px] text-[13px] lg:text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${
                                    currentPath === item.path
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
                                <Icon icon="mdi:plus-circle-outline" className="text-[18px] lg:text-[20px]" />
                                Catat Makanan
                            </button>
                            {activePopover === 'nav-catat' && (
                                <div className="absolute right-0 top-full mt-3 w-[220px] lg:w-[240px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 animate-scaleIn origin-top-right text-left" onClick={(e) => e.stopPropagation()}>
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

                        <div className="relative cursor-pointer z-50">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm" onClick={(e) => { e.stopPropagation(); togglePopover('nav-notif'); }}>
                                <Icon icon="mdi:bell-outline" className="text-[20px] lg:text-[22px] text-gray-600" />
                            </div>
                            <span className="absolute top-[0px] right-[2px] w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] bg-red-500 rounded-full border-[2px] lg:border-[2.5px] border-white"></span>
                            <ContextPopover id="nav-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                        </div>

                        <div 
                            onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })}
                            className={`w-[40px] h-[40px] lg:w-[44px] lg:h-[44px] rounded-full border-[2.5px] cursor-pointer transition-all overflow-hidden shadow-sm flex-shrink-0 ${currentPath === '/profile' ? 'border-[#14AE5C]' : 'border-gray-100 hover:border-[#14AE5C]'}`}
                        >
                            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="md:hidden fixed top-0 w-full h-[75px] bg-white shadow-sm border-b border-gray-100 z-50 flex justify-between items-center px-6">
                <h1 className="text-[20px] font-extrabold text-gray-800">Progress</h1>
                <div className="relative z-50">
                    <button onClick={(e) => { e.stopPropagation(); togglePopover('mobile-calendar-nav'); }} className="text-2xl text-gray-800 hover:text-[#14AE5C] transition-colors mt-2">
                        <Icon icon="mdi:calendar-month-outline" />
                    </button>
                    {activePopover === 'mobile-calendar-nav' && (
                        <div className="absolute right-0 top-full mt-3 bg-white w-[300px] rounded-[24px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-[60] animate-scaleIn origin-top-right cursor-default text-left" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-5">
                                <Icon icon="mdi:chevron-left" className="text-xl cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => handleMonthChange(-1)} />
                                <span className="font-extrabold text-[14px] text-gray-800">
                                    {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
                                </span>
                                <Icon icon="mdi:chevron-right" className="text-xl cursor-pointer hover:text-[#14AE5C] transition-colors" onClick={() => handleMonthChange(1)} />
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                                    <div key={i} className="text-[11px] font-bold text-gray-400">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
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
                                            className={`w-8 h-8 mx-auto flex justify-center items-center rounded-full text-[13px] font-bold cursor-pointer transition-all ${
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

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pt-[100px] md:pt-[130px] pb-[120px] md:pb-16 flex flex-col">
                
                {/* Dynamically adjust Z-Index to prevent backdrop overlap on desktop */}
                <div className={`hidden md:flex justify-between items-center mb-8 relative ${activePopover === 'desktop-calendar' ? 'z-[60]' : 'z-20'}`}>
                    <h2 className="text-[32px] font-extrabold text-gray-800">Progress Tracker</h2>
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); togglePopover('desktop-calendar'); }} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-[100px] shadow-sm hover:border-[#14AE5C] hover:text-[#14AE5C] transition-colors font-bold text-gray-700 text-[14px]">
                            <Icon icon="mdi:calendar-month-outline" className="text-xl" /> Pilih Tanggal
                        </button>
                        
                        {activePopover === 'desktop-calendar' && (
                            <div className="absolute right-0 top-full mt-3 bg-white w-[320px] rounded-[24px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-[60] animate-scaleIn origin-top-right cursor-default text-left" onClick={(e) => e.stopPropagation()}>
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

                {/* Dynamically adjust Z-Index to prevent backdrop overlap on dropdown click */}
                <div className={`bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 mb-6 md:mb-8 relative hover:shadow-md transition-shadow w-full ${activePopover === 'time-range' ? 'z-[60]' : 'z-20'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[12px] md:text-[14px] font-bold text-gray-500 tracking-wider uppercase">TREND BERAT BADAN</h3>
                        <div className="relative">
                            <div 
                                className="flex items-center gap-2 text-[#14AE5C] cursor-pointer hover:opacity-80 transition-opacity bg-[#F0FDF4] px-4 py-2 rounded-full border border-[#DCFCE7]"
                                onClick={(e) => { e.stopPropagation(); togglePopover('time-range'); }}
                            >
                                <span className="text-[12px] md:text-[14px] font-bold">{timeRange}</span>
                                <Icon icon="mdi:chevron-down" className={`text-lg md:text-xl transition-transform ${activePopover === 'time-range' ? 'rotate-180' : ''}`} />
                            </div>

                            {activePopover === 'time-range' && (
                                <div className="absolute right-0 top-full mt-2 w-[160px] md:w-[180px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-[100] overflow-hidden flex flex-col animate-scaleIn origin-top-right text-left">
                                    {timeRanges.map((range) => (
                                        <div
                                            key={range}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeRange(range);
                                                setActivePopover(null);
                                            }}
                                            className="w-full py-3 px-5 border-b border-gray-50 last:border-0 hover:bg-[#F0FDF4] cursor-pointer text-[12px] md:text-[14px] font-bold text-gray-700 hover:text-[#14AE5C] transition-colors"
                                        >
                                            {range}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 md:gap-0">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[36px] md:text-[48px] font-black text-gray-800 leading-none">{latestWeight ? latestWeight.toLocaleString('id-ID') : '-'}</span>
                                <span className="text-[16px] md:text-[20px] font-bold text-gray-500">kg</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit ${selectedWeightSummary.delta > 0 ? 'bg-orange-50 text-[#F97316]' : 'bg-[#F0FDF4] text-[#14AE5C]'}`}>
                                <Icon icon={selectedWeightSummary.delta > 0 ? 'mdi:trending-up' : 'mdi:trend-down'} className="text-xl" />
                                <span className="text-[13px] md:text-[14px] font-bold">{weightDeltaText}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-[320px]">
                            <div className="flex-1 h-[52px] bg-gray-50 rounded-[20px] px-5 flex items-center border-[1.5px] border-gray-100 focus-within:border-[#14AE5C] focus-within:bg-white transition-all">
                                <input
                                    type="number"
                                    value={dailyWeight}
                                    onChange={(e) => setDailyWeight(e.target.value)}
                                    placeholder="Catat berat hari ini"
                                    className="w-full bg-transparent outline-none text-[14px] font-bold text-gray-800"
                                />
                                <span className="text-[13px] font-extrabold text-gray-400">kg</span>
                            </div>
                            <button
                                onClick={handleSaveWeight}
                                className={`w-[52px] h-[52px] rounded-[20px] bg-[#14AE5C] text-white flex items-center justify-center text-2xl shadow-md transition-all ${dailyWeight ? 'hover:bg-[#108e4b] active:scale-95' : 'opacity-50 cursor-not-allowed bg-gray-300'}`}
                            >
                                <Icon icon="mdi:check" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-[180px] md:h-[240px] relative mt-8 mb-6">
                        <div className="absolute inset-0 flex flex-col justify-between pb-6 md:pb-8">
                            {[chartMax, Math.round((chartMax + chartMin) / 2), chartMin].map((val) => (
                                <div key={val} className="flex items-center w-full">
                                    <span className="text-[11px] md:text-[13px] font-bold text-gray-400 w-6 md:w-8 text-left">{val}</span>
                                    <div className="flex-1 h-[1.5px] bg-gray-100 ml-3"></div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute inset-0 pl-9 md:pl-11 pb-6 md:pb-8">
                            <svg viewBox="0 0 280 110" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="progress-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#14AE5C" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#14AE5C" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {areaPath && <path d={areaPath} fill="url(#progress-grad)" className="transition-all duration-700 ease-in-out" />}
                                {linePath && <path d={linePath} fill="none" stroke="#14AE5C" strokeWidth="3" className="transition-all duration-700 ease-in-out" strokeLinecap="round" strokeLinejoin="round" />}
                                {chartPoints.map((point, i) => (
                                    <circle key={i} cx={point.x} cy={point.y} r="3" fill="#white" stroke="#14AE5C" strokeWidth="2" className="transition-all duration-700" />
                                ))}
                                {lastPoint && <line x1={lastPoint.x} y1={lastPoint.y} x2={lastPoint.x} y2="110" stroke="#14AE5C" strokeWidth="1.5" strokeDasharray="4 4" className="transition-all duration-700" />}
                            </svg>
                            {lastPoint && (
                                <div
                                    className="absolute bg-[#14AE5C] text-white text-[12px] font-extrabold px-3 py-1 rounded-lg shadow-md transition-all duration-700 text-center"
                                    style={{ left: `calc(${(lastPoint.x / 280) * 100}% + 20px)`, top: `${Math.max(0, Math.min(lastPoint.y - 15, 200))}px`, transform: 'translateX(-50%)' }}
                                >
                                    {Number(lastPoint.weight).toLocaleString('id-ID')}
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-9 md:left-11 right-0 flex justify-between text-[10px] md:text-[12px] font-bold text-gray-400">
                            {chartLabelLogs.map((log) => (
                                <span key={log.logDate} className="text-center">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'numeric' }).format(new Date(log.logDate))}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-8">
                        <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-gray-100 flex flex-col justify-between text-left">
                            <p className="text-[11px] md:text-[12px] font-bold text-gray-400 uppercase tracking-wider">Rata-rata Mingguan</p>
                            <div>
                                <p className="text-[20px] md:text-[24px] font-extrabold text-gray-800 mt-2">{weeklyWeightSummary.averageWeight || '-'} <span className="text-[14px] md:text-[16px] text-gray-500 font-bold">kg</span></p>
                                <p className="text-[11px] md:text-[13px] font-medium text-gray-500 mt-1">{weeklyWeightSummary.entries} entri dicatat</p>
                            </div>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-gray-100 flex flex-col justify-between text-left">
                            <p className="text-[11px] md:text-[12px] font-bold text-gray-400 uppercase tracking-wider">Rata-rata Bulanan</p>
                            <div>
                                <p className="text-[20px] md:text-[24px] font-extrabold text-gray-800 mt-2">{monthlyWeightSummary.averageWeight || '-'} <span className="text-[14px] md:text-[16px] text-gray-500 font-bold">kg</span></p>
                                <p className="text-[11px] md:text-[13px] font-medium text-gray-500 mt-1">{monthlyWeightSummary.entries} entri dicatat</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch w-full">
                    
                    <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-5 flex flex-col h-full overflow-hidden text-left w-full">
                        <h3 className="text-[12px] lg:text-[14px] font-bold text-gray-500 tracking-wider uppercase mb-5">KONSISTENSI DIARY</h3>
                        
                        <div className="flex items-center gap-4 bg-[#FFF5EB] border border-[#FFE4C4] rounded-2xl p-5 mb-6">
                            <Icon icon="twemoji:fire" className="text-4xl drop-shadow-sm" />
                            <div className="flex flex-col">
                                <span className="text-[28px] font-black text-gray-800 leading-none">{activeDateKeys.size} <span className="text-[15px] font-bold text-gray-600">Hari</span></span>
                                <span className="text-[13px] font-bold text-[#F97316] mt-1">aktif minggu ini</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 mt-auto bg-gray-50 p-3 lg:p-4 rounded-2xl border border-gray-100 w-full">
                            {lastSevenDays.map((day) => (
                                <div key={day.date.toISOString()} className="flex flex-col items-center gap-2">
                                    <span className={`text-[10px] lg:text-[11px] font-black uppercase ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>{day.label}</span>
                                    <div className={`w-[24px] h-[24px] lg:w-[30px] lg:h-[30px] mx-auto rounded-full flex justify-center items-center shadow-sm transition-colors ${day.active ? 'bg-[#14AE5C] text-white' : 'bg-white text-gray-300 border border-gray-200'}`}>
                                        <Icon icon={day.active ? 'mdi:check-bold' : 'mdi:minus'} className="text-[12px] lg:text-[14px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-7 flex flex-col h-full text-left w-full">
                        <h3 className="text-[12px] lg:text-[14px] font-bold text-gray-500 tracking-wider uppercase mb-5">RINGKASAN {timeRange}</h3>

                        <div className="grid grid-cols-2 gap-4 lg:gap-5 flex-1">
                            {[
                                { label: 'Rata-rata Kalori', icon: 'mdi:calculator-variant-outline', value: averageCalories, unit: 'kkal', sub: `dari target ${targetCalories ? targetCalories.toLocaleString('id-ID') : '-'}` },
                                { label: 'Kalori Tertinggi', icon: 'mdi:arrow-up-circle-outline', value: highestCalories, unit: 'kkal', sub: 'Dari Diary' },
                                { label: 'Kalori Terendah', icon: 'mdi:arrow-down-circle-outline', value: lowestCalories, unit: 'kkal', sub: 'Dari Diary' },
                                { label: 'Rata-rata Protein', icon: 'mdi:arm-flex-outline', value: averageProtein, unit: 'g', sub: 'dari Diary' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#F8FAFC] rounded-[24px] p-5 lg:p-6 border border-gray-100 flex flex-col justify-between hover:bg-white hover:border-[#14AE5C]/30 transition-all shadow-sm h-full group text-left">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-[13px] font-bold text-gray-600 group-hover:text-gray-800 transition-colors">{item.label}</p>
                                        <Icon icon={item.icon} className="text-xl text-gray-400 group-hover:text-[#14AE5C] transition-colors" />
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-1.5 mb-0.5">
                                            <span className="text-[22px] lg:text-[26px] font-black text-gray-800">{item.value}</span>
                                            <span className="text-[13px] font-bold text-gray-500">{item.unit}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
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
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100">
                                    <Icon icon="mdi:magnify" />
                                </div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center">Cari<br/>Manual</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100">
                                    <Icon icon="mdi:barcode-scan" />
                                </div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center leading-tight">Scan<br/>Barcode</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="md:hidden fixed bottom-0 left-0 w-full z-40">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); togglePopover('mobile-catat'); }} 
                        className="w-[72px] h-[72px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-4xl shadow-[0_8px_20px_rgba(20,174,92,0.4)] hover:scale-105 active:scale-95 transition-transform border-[6px] border-white"
                    >
                        <Icon icon={activePopover === 'mobile-catat' ? 'mdi:close' : 'mdi:plus'} className={`transition-transform duration-300 ${activePopover === 'mobile-catat' ? 'rotate-90' : ''}`} />
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
                        item.spacer ? (
                            <div key="spacer" className="w-[60px]"></div>
                        ) : (
                            <div 
                                key={idx} 
                                onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })} 
                                className="flex flex-col items-center gap-1.5 cursor-pointer w-[50px] pt-2"
                            >
                                <Icon 
                                    icon={item.icon} 
                                    className={`text-[26px] transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-300'}`} 
                                />
                                <span className={`text-[11px] font-extrabold transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-400'}`}>
                                    {item.label}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default ProgressScreen;
