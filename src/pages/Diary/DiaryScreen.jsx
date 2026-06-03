import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatTwoDecimals, getFoodLogsByDate, getNutritionSummary, getTotalCalories, removeFoodLog } from '../../utils/foodLogStorage';
import { deleteFoodLog, syncFoodLogs } from '../../services/meals';
import { isFutureLocalDate, parseLocalDate, toLocalDateKey } from '../../utils/dateUtils.js';
import { getProfilePhoto } from '../../utils/userProfileStorage';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';

const DiaryScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const currentPath = location.pathname;
    const profilePhoto = getProfilePhoto(userEmail) || profileImg;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    
    const [activePopover, setActivePopover] = useState(null);
    const [currentDate, setCurrentDate] = useState(() => parseLocalDate(location.state?.selectedDate || new Date()));
    const [showCalendar, setShowCalendar] = useState(false);
    const [foodLogs, setFoodLogs] = useState(() => getFoodLogsByDate(userEmail, currentDate));

    const [expandedMeals, setExpandedMeals] = useState({
        sarapan: true,
        makansiang: true,
        makanmalam: true,
        camilan: true
    });

    const togglePopover = (id) => {
        setActivePopover(prev => prev === id ? null : id);
    };

    const toggleMeal = (mealId) => {
        setExpandedMeals(prev => ({
            ...prev,
            [mealId]: !prev[mealId]
        }));
    };

    const refreshSelectedDateLogs = () => {
        setFoodLogs(getFoodLogsByDate(userEmail, currentDate));
    };

    const handleDeleteFood = async (food) => {
        const foodName = food.name || food.foodName || 'makanan ini';
        const confirmed = window.confirm(`Hapus ${foodName} dari diary?`);
        if (!confirmed) return;

        removeFoodLog(userEmail, food.id);
        refreshSelectedDateLogs();

        const serverFoodId = food.serverId || food.id;
        if (!localStorage.getItem('authToken') || !serverFoodId) return;

        try {
            await deleteFoodLog(serverFoodId);
        } catch (error) {
            if (error.status !== 404) {
                alert('Makanan sudah dihapus dari tampilan, tapi gagal menghapus data di server. Pastikan backend berjalan.');
            }
        }
    };

    const formatDateDisplay = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return `Hari Ini, ${formatted.split(',')[1]}`;
        if (date.toDateString() === tomorrow.toDateString()) return `Besok, ${formatted.split(',')[1]}`;
        if (date.toDateString() === yesterday.toDateString()) return `Kemarin, ${formatted.split(',')[1]}`;
        return formatted;
    };

    const changeDate = (days) => {
        const newDate = parseLocalDate(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const handleMonthChange = (offset) => {
        const newDate = parseLocalDate(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const navigateToFoodEntry = (path) => {
        const selectedLogDate = toLocalDateKey(currentDate);
        if (isFutureLocalDate(selectedLogDate)) {
            alert('Tidak bisa menambahkan makanan untuk tanggal besok atau tanggal setelah hari ini.');
            return;
        }

        navigate(path, { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } });
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const calendarGrid = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

    useEffect(() => {
        setFoodLogs(getFoodLogsByDate(userEmail, currentDate));
    }, [currentDate, userEmail]);

    useEffect(() => {
        if (!localStorage.getItem('authToken')) return;
        syncFoodLogs(userEmail)
            .then(() => setFoodLogs(getFoodLogsByDate(userEmail, currentDate)))
            .catch((error) => console.warn('Gagal sinkron diary:', error.message));
    }, [currentDate, userEmail]);

    const summary = getNutritionSummary(foodLogs);
    const totalCalories = getTotalCalories(foodLogs);

    const meals = useMemo(() => {
        const mealTemplates = [
            { id: 'sarapan', title: 'SARAPAN' },
            { id: 'makansiang', title: 'MAKAN SIANG' },
            { id: 'makanmalam', title: 'MAKAN MALAM' },
            { id: 'camilan', title: 'CAMILAN' }
        ];

        return mealTemplates.map((meal) => {
            const foods = foodLogs.filter((food) => food.mealId === meal.id);
            const total = getTotalCalories(foods);

            return {
                ...meal,
                totalCals: total > 0 ? `${total} kkal` : '',
                foods
            };
        });
    }, [foodLogs]);

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
                                <Icon icon="mdi:plus-circle-outline" className="text-[18px] lg:text-[20px]" /> Catat Makanan
                            </button>
                            {activePopover === 'nav-catat' && (
                                <div className="absolute right-0 top-full mt-3 w-[220px] lg:w-[240px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 animate-scaleIn origin-top-right text-left" onClick={(e) => e.stopPropagation()}>
                                    <div onClick={() => navigateToFoodEntry('/cari-makanan')} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-[#14AE5C] border border-gray-100"><Icon icon="mdi:magnify" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Cari Manual</span>
                                    </div>
                                    <div onClick={() => navigateToFoodEntry('/scan-barcode')} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group mt-1">
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
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="md:hidden fixed top-0 w-full h-[75px] bg-white shadow-sm border-b border-gray-100 z-50 flex justify-between items-center px-4">
                <button onClick={() => navigate('/dashboard', { state: { goal: currentGoal, email: userEmail } })} className="p-2 text-gray-800 hover:text-[#14AE5C] transition-colors rounded-full hover:bg-gray-50 active:scale-95">
                    <Icon icon="mdi:arrow-left" className="text-2xl font-bold" />
                </button>
                
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 shadow-sm flex-1 mx-2 justify-between">
                    <Icon icon="mdi:chevron-left" className="text-xl text-gray-500 cursor-pointer hover:text-[#14AE5C]" onClick={() => changeDate(-1)} />
                    <span className="text-[12px] font-bold text-gray-800 text-center truncate cursor-pointer hover:text-[#14AE5C]" onClick={(e) => { e.stopPropagation(); togglePopover('mobile-calendar-nav'); }}>
                        {formatDateDisplay(currentDate)}
                    </span>
                    <Icon icon="mdi:chevron-right" className="text-xl text-gray-500 cursor-pointer hover:text-[#14AE5C]" onClick={() => changeDate(1)} />
                </div>

                <div className="relative z-50">
                    <button onClick={(e) => { e.stopPropagation(); togglePopover('mobile-calendar-nav'); }} className="p-2 text-gray-800 hover:text-[#14AE5C] transition-colors rounded-full hover:bg-gray-50 active:scale-95">
                        <Icon icon="mdi:calendar-month-outline" className="text-2xl" />
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

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pt-[100px] md:pt-[120px] pb-[120px] md:pb-16 flex flex-col items-center">
                
                <div className={`hidden md:flex justify-between items-center w-full mb-8 relative ${activePopover === 'desktop-calendar' ? 'z-[60]' : 'z-30'}`}>
                    <h2 className="text-[28px] lg:text-[32px] font-extrabold text-gray-800">Diary Makanan</h2>
                    
                    <div className="relative">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[100px] px-3 py-2 shadow-sm">
                            <button onClick={() => changeDate(-1)} className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-[#F0FDF4] transition-colors">
                                <Icon icon="mdi:chevron-left" className="text-2xl text-gray-500 hover:text-[#14AE5C]" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); togglePopover('desktop-calendar'); }} className="flex items-center gap-2 text-[14px] lg:text-[15px] font-extrabold text-gray-800 min-w-[150px] justify-center cursor-pointer hover:text-[#14AE5C] transition-colors">
                                <Icon icon="mdi:calendar-month-outline" className="text-xl" />
                                {formatDateDisplay(currentDate)}
                            </button>
                            <button onClick={() => changeDate(1)} className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-[#F0FDF4] transition-colors">
                                <Icon icon="mdi:chevron-right" className="text-2xl text-gray-500 hover:text-[#14AE5C]" />
                            </button>
                        </div>
                        
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

                <div className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-6 flex flex-col">
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-wider uppercase mb-3">RINGKASAN HARI INI</h3>
                    
                    <div className="flex flex-row justify-between gap-2 lg:gap-4 w-full">
                        <div className="flex-1 bg-[#E8F5EE] rounded-[16px] py-3 lg:py-3.5 flex flex-col items-center justify-center border border-[#DCFCE7] shadow-sm text-center">
                            <span className="text-[16px] lg:text-[22px] font-black text-gray-800 leading-none mb-1">{formatTwoDecimals(totalCalories)}</span>
                            <span className="text-[10px] lg:text-[12px] font-bold text-gray-500 mt-1">Total Kalori</span>
                        </div>
                        <div className="flex-1 bg-[#FFF5EB] rounded-[16px] py-3 lg:py-3.5 flex flex-col items-center justify-center border border-[#FFE4C4] shadow-sm text-center">
                            <span className="text-[16px] lg:text-[22px] font-black text-[#F97316] leading-none mb-1">{formatTwoDecimals(summary.protein)}g</span>
                            <span className="text-[10px] lg:text-[12px] font-bold text-[#F97316]/80 mt-1">Protein</span>
                        </div>
                        <div className="flex-1 bg-[#F0F5FF] rounded-[16px] py-3 lg:py-3.5 flex flex-col items-center justify-center border border-[#dbeafe] shadow-sm text-center">
                            <span className="text-[16px] lg:text-[22px] font-black text-[#3B82F6] leading-none mb-1">{formatTwoDecimals(summary.carbs)}g</span>
                            <span className="text-[10px] lg:text-[12px] font-bold text-[#3B82F6]/80 mt-1">Karbohidrat</span>
                        </div>
                        <div className="flex-1 bg-[#F5F3FF] rounded-[16px] py-3 lg:py-3.5 flex flex-col items-center justify-center border border-[#ede9fe] shadow-sm text-center">
                            <span className="text-[16px] lg:text-[22px] font-black text-[#8B5CF6] leading-none mb-1">{formatTwoDecimals(summary.fat)}g</span>
                            <span className="text-[10px] lg:text-[12px] font-bold text-[#8B5CF6]/80 mt-1">Lemak</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {meals.map(meal => (
                        <div key={meal.id} className="w-full bg-white rounded-[20px] lg:rounded-[24px] p-5 lg:p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] lg:shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-fit">
                            <div 
                                className="flex justify-between items-center cursor-pointer mb-1 lg:mb-2"
                                onClick={() => toggleMeal(meal.id)}
                            >
                                <h4 className="text-[14px] lg:text-[15px] font-extrabold text-gray-800 tracking-wider uppercase">{meal.title}</h4>
                                <div className="flex items-center gap-2 lg:gap-3">
                                    {meal.totalCals && <span className="text-[13px] font-bold text-[#14AE5C] bg-[#F0FDF4] px-3 py-1 rounded-full">{meal.totalCals}</span>}
                                    <div className={`w-8 h-8 rounded-full flex justify-center items-center transition-colors ${expandedMeals[meal.id] ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-400'}`}>
                                        <Icon icon="mdi:chevron-down" className={`text-xl transition-transform ${expandedMeals[meal.id] ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {expandedMeals[meal.id] && (
                                <div className="mt-4 animate-scaleIn origin-top flex flex-col">
                                    {meal.foods.length > 0 ? (
                                        <div className="flex flex-col gap-3 mb-4">
                                            {meal.foods.map((food) => (
                                                <div key={`${food.id}-${food.createdAt}`} className="flex items-center bg-[#F8FAFC] border border-gray-100 rounded-[16px] lg:rounded-[20px] p-4 hover:border-[#14AE5C] transition-colors group">
                                                    <div className={`w-[40px] h-[40px] lg:w-[48px] lg:h-[48px] ${food.bg} rounded-full flex justify-center items-center mr-3 lg:mr-4 flex-shrink-0 shadow-sm`}>
                                                        <Icon icon={food.icon} className={`text-[20px] lg:text-[24px] ${food.color}`} />
                                                    </div>
                                                    <div className="flex flex-col flex-1 overflow-hidden pr-2">
                                                        <span className="text-[14px] lg:text-[15px] font-extrabold text-gray-800 truncate">{food.name}</span>
                                                        <span className="text-[12px] font-medium text-gray-500 mt-0.5">{food.qty} • {food.calories} kkal</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteFood(food); }}
                                                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white lg:bg-red-50 text-gray-400 lg:text-[#F43F5E] flex justify-center items-center hover:bg-red-50 hover:text-[#F43F5E] border border-gray-200 lg:border-transparent active:scale-95 transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                        title="Hapus makanan"
                                                    >
                                                        <Icon icon="mdi:trash-can-outline" className="text-[18px] lg:text-[20px]" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-5 lg:py-6 flex flex-col justify-center items-center border-2 border-dashed border-gray-100 rounded-[16px] lg:rounded-[20px] bg-gray-50/50 mb-4">
                                            <Icon icon="mdi:silverware-fork-knife" className="text-2xl text-gray-300 mb-2" />
                                            <span className="text-[12px] lg:text-[13px] font-bold text-gray-400">Belum ada makanan dicatat</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => navigateToFoodEntry('/cari-makanan')} 
                                        className="w-full h-[46px] rounded-xl border border-dashed border-[#14AE5C] flex justify-center items-center gap-2 text-[#14AE5C] font-bold text-[13px] lg:text-[14px] hover:bg-[#F0FDF4] hover:border-solid transition-all mt-auto"
                                    >
                                        <Icon icon="mdi:plus" className="text-lg" /> Tambah Makanan
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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
                            <div onClick={() => navigateToFoodEntry('/cari-makanan')} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100">
                                    <Icon icon="mdi:magnify" />
                                </div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center">Cari<br/>Manual</span>
                            </div>
                            <div onClick={() => navigateToFoodEntry('/scan-barcode')} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
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

export default DiaryScreen;
