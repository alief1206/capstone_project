import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatTwoDecimals, getFoodLogsByDate, getNutritionSummary, getTotalCalories, removeFoodLog } from '../../utils/foodLogStorage';
import { deleteFoodLog, syncFoodLogs } from '../../services/meals';

const DiaryScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(() => location.state?.selectedDate ? new Date(location.state.selectedDate) : new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [foodLogs, setFoodLogs] = useState(() => getFoodLogsByDate(userEmail, currentDate));

    const [expandedMeals, setExpandedMeals] = useState({
        sarapan: true,
        makansiang: true,
        makanmalam: true,
        camilan: true
    });

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
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + days);
        setCurrentDate(newDate);
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

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-gray-50 shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-12 px-6 flex justify-between items-center pb-4 z-10 flex-shrink-0">
                    <button onClick={() => navigate('/dashboard', { state: { goal: currentGoal, email: userEmail } })} className="text-2xl text-black font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm flex-1 mx-4 justify-between">
                        <Icon icon="mdi:chevron-left" className="text-xl text-gray-400 cursor-pointer hover:text-[#14AE5C]" onClick={() => changeDate(-1)} />
                        <span className="text-[11px] font-bold text-black text-center truncate">{formatDateDisplay(currentDate)}</span>
                        <Icon icon="mdi:chevron-right" className="text-xl text-gray-400 cursor-pointer hover:text-[#14AE5C]" onClick={() => changeDate(1)} />
                    </div>
                    <button onClick={() => setShowCalendar(true)} className="text-2xl text-black hover:text-[#14AE5C]">
                        <Icon icon="mdi:calendar-month-outline" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-[100px] hide-scrollbar">
                    <div className="px-6 mt-2">
                        <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-3">RINGKASAN HARI INI</h3>
                        <div className="flex justify-between gap-2">
                            <div className="flex-1 bg-[#E8F5EE] rounded-xl py-3 flex flex-col items-center justify-center border border-[#DCFCE7] shadow-sm">
                                <span className="text-[16px] font-bold text-black leading-tight">{formatTwoDecimals(totalCalories)}</span>
                                <span className="text-[10px] font-bold text-black mt-1">Total Kalori</span>
                            </div>
                            <div className="flex-1 bg-[#FFF5EB] rounded-xl py-3 flex flex-col items-center justify-center border border-[#FFE4C4] shadow-sm">
                                <span className="text-[16px] font-bold text-[#F97316] leading-tight">{formatTwoDecimals(summary.protein)}g</span>
                                <span className="text-[10px] font-bold text-[#F97316] mt-1">Protein</span>
                            </div>
                            <div className="flex-1 bg-[#F0F5FF] rounded-xl py-3 flex flex-col items-center justify-center border border-[#Dbeafe] shadow-sm">
                                <span className="text-[16px] font-bold text-[#3B82F6] leading-tight">{formatTwoDecimals(summary.carbs)}g</span>
                                <span className="text-[10px] font-bold text-[#3B82F6] mt-1">Karbohidrat</span>
                            </div>
                            <div className="flex-1 bg-[#F5F3FF] rounded-xl py-3 flex flex-col items-center justify-center border border-[#ede9fe] shadow-sm">
                                <span className="text-[16px] font-bold text-[#8B5CF6] leading-tight">{formatTwoDecimals(summary.fat)}g</span>
                                <span className="text-[10px] font-bold text-[#8B5CF6] mt-1">Lemak</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 mt-6 flex flex-col gap-4">
                        {meals.map(meal => (
                            <div key={meal.id} className="w-full bg-white rounded-[20px] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100">
                                <div 
                                    className="flex justify-between items-center mb-1 cursor-pointer"
                                    onClick={() => toggleMeal(meal.id)}
                                >
                                    <h4 className="text-[14px] font-bold text-black tracking-wider">{meal.title}</h4>
                                    <div className="flex items-center gap-1">
                                        {meal.totalCals && <span className="text-[13px] font-semibold text-gray-600">{meal.totalCals}</span>}
                                        <Icon 
                                            icon="mdi:chevron-down" 
                                            className={`text-xl text-gray-400 ${expandedMeals[meal.id] ? 'rotate-180' : ''}`} 
                                        />
                                    </div>
                                </div>

                                {expandedMeals[meal.id] && (
                                    <div className="mt-4">
                                        {meal.foods.length > 0 ? (
                                            <div className="flex flex-col gap-4 mb-4">
                                                {meal.foods.map((food) => (
                                                    <div key={`${food.id}-${food.createdAt}`} className="flex items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                        <div className={`w-[40px] h-[40px] ${food.bg} rounded-full flex justify-center items-center mr-4`}>
                                                            <Icon icon={food.icon} className={`text-[22px] ${food.color}`} />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-[14px] font-bold text-black">{food.name}</span>
                                                            <span className="text-[12px] font-medium text-gray-500">{food.qty}, {food.calories} kkal</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteFood(food)}
                                                            className="w-9 h-9 rounded-full bg-red-50 text-[#F43F5E] flex justify-center items-center hover:bg-red-100 active:scale-95 transition-all"
                                                            aria-label={`Hapus ${food.name}`}
                                                            title="Hapus makanan"
                                                        >
                                                            <Icon icon="mdi:trash-can-outline" className="text-[19px]" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-4 flex justify-center items-center">
                                                <span className="text-[13px] font-medium text-gray-500">Belum ada makanan</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: currentDate.toISOString() } })} 
                                            className="w-full h-[46px] rounded-xl border border-[#14AE5C] flex justify-center items-center gap-2 text-[#14AE5C] font-bold text-[14px] hover:bg-[#F0FDF4] mt-2"
                                        >
                                            <Icon icon="mdi:plus" className="text-lg" /> Tambah Makanan
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {showCalendar && (
                    <div className="absolute inset-0 bg-white/20 z-[70] flex justify-center items-center px-4" onClick={() => setShowCalendar(false)}>
                        <div className="bg-white w-full max-w-[320px] rounded-[24px] p-5 shadow-2xl -mt-[350px]" onClick={(e) => e.stopPropagation()}>
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
                                            className={`w-9 h-9 mx-auto flex justify-center items-center rounded-full text-[13px] font-bold cursor-pointer ${
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
                        <button onClick={() => setIsActionMenuOpen(false)} className="absolute top-10 left-6 text-white text-3xl hover:scale-110"><Icon icon="mdi:close" /></button>
                        <div className="w-[350px] flex justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: currentDate.toISOString() } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail, logDate: currentDate.toISOString() } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:barcode-scan" /></div>
                                <span className="text-[13px] font-bold text-black text-center leading-tight">Pemindai Kode Batang</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-50">
                    <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="w-[56px] h-[56px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-3xl shadow-[0_4px_12px_rgba(20,174,92,0.5)] hover:scale-105"><Icon icon="mdi:plus" /></button>
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

export default DiaryScreen;
