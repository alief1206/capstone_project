import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getFoodLogsInLastDays, getMacroTotals, getTotalCalories } from '../../utils/foodLogStorage';
import { calculateNutritionTargets, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { getWeightLogs, getWeightLogsInRange, mergeWeightLogs, summarizeWeightLogs, upsertWeightLog } from '../../utils/weightLogStorage';
import { createWeightLog, fetchWeightTrend } from '../../services/auth';

const ProgressScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const userProfile = getUserProfile(userEmail);
    const currentGoal = normalizeGoal(location.state?.goal || userProfile.goal || 'turunkan');
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

    const [showTimeRange, setShowTimeRange] = useState(false);
    const [timeRange, setTimeRange] = useState('7 Hari Terakhir');
    const timeRanges = ['7 Hari Terakhir', '14 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini'];
    const [dailyWeight, setDailyWeight] = useState('');
    const [weightLogs, setWeightLogs] = useState(() => getWeightLogs(userEmail));

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
        fetchWeightTrend('monthly')
            .then((response) => setWeightLogs(mergeWeightLogs(userEmail, response.data || [])))
            .catch((error) => console.warn('Gagal sinkron berat badan:', error.message));
    }, [userEmail]);

    const selectedDays = daysByRange[timeRange] || 7;
    const foodLogs = getFoodLogsInLastDays(userEmail, selectedDays);
    const totalCalories = getTotalCalories(foodLogs);
    const macroTotals = getMacroTotals(foodLogs);
    const averageCalories = foodLogs.length > 0 ? Math.round(totalCalories / selectedDays) : 0;
    const highestCalories = foodLogs.length > 0 ? Math.max(...foodLogs.map((food) => Number(food.calories || 0))) : 0;
    const lowestCalories = foodLogs.length > 0 ? Math.min(...foodLogs.map((food) => Number(food.calories || 0))) : 0;
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const targetCalories = targets.calories;
    const averageProtein = foodLogs.length > 0 ? Math.round(macroTotals.protein / selectedDays) : 0;
    const activeDateKeys = new Set(getFoodLogsInLastDays(userEmail, 7).map((food) => new Date(food.createdAt).toDateString()));
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
        ? 'stabil dari catatan sebelumnya'
        : `${Math.abs(selectedWeightSummary.delta).toLocaleString('id-ID')} kg ${selectedWeightSummary.delta > 0 ? 'naik' : 'turun'} dari catatan sebelumnya`;
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
        } catch (error) {
            console.warn('Berat tersimpan lokal, tapi gagal sinkron server:', error.message);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-[#F8FAFC] shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-14 px-6 pb-4 flex justify-between items-center z-10 flex-shrink-0">
                    <h2 className="text-[24px] font-bold text-black tracking-wide">Progress</h2>
                    <button onClick={() => setShowCalendar(true)} className="text-2xl text-black hover:text-[#14AE5C] transition-colors">
                        <Icon icon="mdi:calendar-month-outline" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-[120px] hide-scrollbar px-5 pt-2">
                    
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 mb-5 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[11px] font-bold text-gray-500 tracking-wider">TREND BERAT BADAN</h3>
                            
                            <div className="relative">
                                <div 
                                    className="flex items-center gap-1 text-[#14AE5C] cursor-pointer hover:opacity-80"
                                    onClick={() => setShowTimeRange(!showTimeRange)}
                                >
                                    <span className="text-[11px] font-semibold">{timeRange}</span>
                                    <Icon icon="mdi:chevron-down" className={`text-lg transition-transform ${showTimeRange ? 'rotate-180' : ''}`} />
                                </div>

                                {showTimeRange && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowTimeRange(false)}></div>
                                        <div className="absolute right-0 top-6 w-[140px] bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden flex flex-col animate-scaleIn origin-top-right">
                                            {timeRanges.map((range) => (
                                                <div
                                                    key={range}
                                                    onClick={() => {
                                                        setTimeRange(range);
                                                        setShowTimeRange(false);
                                                    }}
                                                    className="w-full py-2.5 px-4 border-b border-gray-50 last:border-0 hover:bg-[#F0FDF4] cursor-pointer text-[11px] font-bold text-gray-700 hover:text-[#14AE5C] transition-colors"
                                                >
                                                    {range}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[28px] font-bold text-black leading-none">{latestWeight ? latestWeight.toLocaleString('id-ID') : '-'}</span>
                                <span className="text-[14px] font-bold text-black">kg</span>
                            </div>
                            <div className={`flex items-center gap-1 ${selectedWeightSummary.delta > 0 ? 'text-[#F97316]' : 'text-[#14AE5C]'}`}>
                                <Icon icon={selectedWeightSummary.delta > 0 ? 'mdi:menu-up' : 'mdi:menu-down'} className="text-xl" />
                                <span className="text-[12px] font-bold">{weightDeltaText}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex-1 h-11 bg-gray-50 rounded-xl px-3 flex items-center border border-gray-100 focus-within:border-[#14AE5C]">
                                <input
                                    type="number"
                                    value={dailyWeight}
                                    onChange={(e) => setDailyWeight(e.target.value)}
                                    placeholder="Catat berat hari ini"
                                    className="w-full bg-transparent outline-none text-[12px] font-semibold"
                                />
                                <span className="text-[11px] font-bold text-gray-400">kg</span>
                            </div>
                            <button
                                onClick={handleSaveWeight}
                                className="w-11 h-11 rounded-xl bg-[#14AE5C] text-white flex items-center justify-center text-xl active:scale-95 transition-all"
                            >
                                <Icon icon="mdi:check" />
                            </button>
                        </div>

                        <div className="w-full h-[160px] relative mt-6">
                            <div className="absolute inset-0 flex flex-col justify-between pb-6">
                                {[chartMax, Math.round((chartMax + chartMin) / 2), chartMin].map((val) => (
                                    <div key={val} className="flex items-center w-full">
                                        <span className="text-[10px] text-gray-400 w-5">{val}</span>
                                        <div className="flex-1 h-[1px] bg-gray-100 ml-2"></div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="absolute inset-0 pl-7 pb-6">
                                <svg viewBox="0 0 280 110" preserveAspectRatio="none" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="progress-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#14AE5C" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#14AE5C" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {areaPath && <path d={areaPath} fill="url(#progress-grad)" />}
                                    {linePath && <path d={linePath} fill="none" stroke="#14AE5C" strokeWidth="2.5" />}
                                    {lastPoint && <line x1={lastPoint.x} y1={lastPoint.y} x2={lastPoint.x} y2="110" stroke="#14AE5C" strokeWidth="1" strokeDasharray="3 3" />}
                                </svg>
                                {lastPoint && (
                                    <div
                                        className="absolute bg-[#14AE5C] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm"
                                        style={{ left: `calc(${(lastPoint.x / 280) * 100}% + 14px)`, top: `${Math.max(0, Math.min(lastPoint.y - 12, 120))}px` }}
                                    >
                                        {Number(lastPoint.weight).toLocaleString('id-ID')}
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-7 right-0 flex justify-between text-[9px] font-semibold text-gray-400">
                                {chartLabelLogs.map((log) => (
                                    <span key={log.logDate}>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'numeric' }).format(new Date(log.logDate))}</span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <div className="bg-[#F4FBF7] rounded-[16px] p-3 border border-[#E8F5EE]">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Mingguan</p>
                                <p className="text-[15px] font-bold text-black mt-1">{weeklyWeightSummary.averageWeight || '-'} kg</p>
                                <p className="text-[10px] font-medium text-gray-500">{weeklyWeightSummary.entries} catatan</p>
                            </div>
                            <div className="bg-[#F4FBF7] rounded-[16px] p-3 border border-[#E8F5EE]">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Bulanan</p>
                                <p className="text-[15px] font-bold text-black mt-1">{monthlyWeightSummary.averageWeight || '-'} kg</p>
                                <p className="text-[10px] font-medium text-gray-500">{monthlyWeightSummary.entries} catatan</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 mb-6">
                        <h3 className="text-[12px] font-bold text-black tracking-wider mb-3">KONSISTENSI</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Icon icon="twemoji:fire" className="text-2xl" />
                            <span className="text-[20px] font-bold text-black">{activeDateKeys.size}</span>
                            <span className="text-[12px] font-medium text-gray-500">hari aktif dalam 7 hari terakhir</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                            {lastSevenDays.map((day) => (
                                <div key={day.date.toISOString()} className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">{day.label}</span>
                                    <div className={`w-[30px] h-[30px] rounded-full flex justify-center items-center ${day.active ? 'bg-[#E8F5EE] text-[#14AE5C]' : 'bg-gray-100 text-gray-300'}`}>
                                        <Icon icon={day.active ? 'mdi:check-bold' : 'mdi:minus'} className="text-[16px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h3 className="text-[13px] font-bold text-black tracking-wider mb-4 px-1">RINGKASAN {timeRange.toUpperCase()}</h3>

                    <div className="grid grid-cols-2 gap-3 pb-4">
                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Rata-rata Kalori</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">{averageCalories}</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">dari target {targetCalories.toLocaleString('id-ID')}</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Kalori Tertinggi</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">{highestCalories}</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">Dari Diary</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Kalori Terendah</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">{lowestCalories}</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">Dari Diary</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Rata-rata Protein</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">{averageProtein}</span>
                                <span className="text-[11px] font-semibold text-gray-600">g</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">dari Diary</p>
                        </div>
                    </div>
                </div>

                {showCalendar && (
                    <div className="absolute inset-0 bg-white/40  z-[70] flex justify-center items-center px-4" onClick={() => setShowCalendar(false)}>
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
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
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

export default ProgressScreen;
