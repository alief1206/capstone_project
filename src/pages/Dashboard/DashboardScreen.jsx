import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';
import robotImg from '../../assets/images/robot.png';
import { getFoodLogsByDate, getMacroTotals, getTotalCalories } from '../../utils/foodLogStorage';
import { calculateNutritionTargets, getUserProfile, normalizeGoal } from '../../utils/userProfileStorage';
import { syncFoodLogs } from '../../services/meals';
import { fetchCurrentUser } from '../../services/auth';

const DashboardScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail) || {});
    const currentGoal = normalizeGoal(location.state?.goal || userProfile.goal || 'turunkan');
    const userName = userEmail ? userEmail.split('@')[0] : 'Sobat Sehat';
    const currentPath = location.pathname;
    
    const [activePopover, setActivePopover] = useState(null);
    const [foodLogs, setFoodLogs] = useState(() => getFoodLogsByDate(userEmail));
    const [toast, setToast] = useState({ show: false, title: '', message: '', icon: '' });

    const showToast = (title, message, icon = 'mdi:information-variant') => {
        setToast({ show: true, title, message, icon });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    const togglePopover = (id) => setActivePopover(prev => prev === id ? null : id);

    useEffect(() => {
        if (location.state?.email) localStorage.setItem('userEmail', location.state.email);
    }, [location.state?.email]);

    useEffect(() => {
        setFoodLogs(getFoodLogsByDate(userEmail));
        if (!localStorage.getItem('authToken')) return;

        syncFoodLogs(userEmail)
            .then(() => setFoodLogs(getFoodLogsByDate(userEmail)))
            .catch(() => {});

        fetchCurrentUser()
            .then((profile) => setUserProfile(profile || {}))
            .catch(() => setUserProfile({}));
    }, [userEmail]);

    const totalCalories = getTotalCalories(foodLogs);
    const macroTotals = getMacroTotals(foodLogs);
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const calorieTarget = targets.calories;
    const caloriePercent = calorieTarget ? Math.round((totalCalories / calorieTarget) * 100) : 0;
    const recentFoods = foodLogs.slice(0, 4);
    const getMacroPercent = (value, max) => `${Math.min(Math.round((value / Math.max(max, 1)) * 100), 100)}%`;
    
    const insightText = foodLogs.length === 0
        ? 'Belum ada makanan di diary hari ini. Tambahkan makanan agar AI bisa mulai menganalisis ringkasanmu.'
        : totalCalories > calorieTarget
            ? `Kalori dari diary sudah melewati batas ${calorieTarget.toLocaleString('id-ID')} kkal. Minta AI mengevaluasi sisa harimu.`
            : calorieTarget
                ? `Kalori dari diary masih tersisa ${(calorieTarget - totalCalories).toLocaleString('id-ID')} kkal dari target harianmu.`
                : 'Lengkapi profilmu agar AI bisa menghitung target harian dan memberikan insight.';
                
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const boundedPercent = Math.min(caloriePercent, 100);
    const strokeDashoffset = circumference - (boundedPercent / 100) * circumference;

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

            <div className={`fixed z-[999] transition-all duration-500 transform ${toast.show ? 'top-10 opacity-100 translate-y-0' : '-top-20 opacity-0 -translate-y-full'} left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-10 flex items-start gap-4 bg-white px-5 md:px-6 py-4 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 w-[90%] max-w-[360px]`}>
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

                    <div className="flex items-center bg-gray-50 rounded-[100px] p-1 border border-gray-100 shadow-inner flex-shrink-0 overflow-x-auto">
                        {[
                            { path: '/dashboard', label: 'Beranda' },
                            { path: '/diary', label: 'Diary' },
                            { path: '/progress', label: 'Progress' },
                            { path: '/insight', label: 'Insight' }
                        ].map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })}
                                className={`px-5 lg:px-7 py-2 lg:py-2.5 rounded-[100px] text-[13px] lg:text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${currentPath === item.path || (item.path === '/dashboard' && currentPath === '/') ? 'bg-white text-[#14AE5C] shadow-md' : 'text-gray-500 hover:text-[#14AE5C]'}`}
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
                            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
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
                        <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pt-[100px] md:pt-[130px] pb-24 md:pb-16 flex flex-col">
                
                <div className="mb-8">
                    <h2 className="text-[24px] md:text-[32px] font-extrabold text-gray-800 leading-tight">Hi, {userName}!</h2>
                    <p className="text-[14px] md:text-[16px] font-medium text-gray-500 mt-2">Semangat jaga pola makan sehat hari ini!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
                    
                    <div className="w-full md:col-span-7 order-1 flex flex-col h-full">
                        <div className="w-full bg-[#14AE5C] rounded-[28px] p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="text-[12px] md:text-[14px] font-bold opacity-90 tracking-widest uppercase">Kalori Hari Ini</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-[48px] md:text-[64px] font-black leading-none">{totalCalories}</span>
                                        <span className="text-[14px] md:text-[18px] font-semibold opacity-90 flex items-center gap-1 ml-1"><Icon icon="mdi:fire" /> kkal</span>
                                    </div>
                                </div>
                                <div className="relative w-[80px] h-[80px] md:w-[110px] md:h-[110px] flex justify-center items-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="5" fill="transparent" />
                                        <circle cx="50%" cy="50%" r={radius} stroke="#ffffff" strokeWidth="5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-[15px] md:text-[20px] font-bold">{caloriePercent}%</span>
                                </div>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="w-full h-[8px] md:h-[12px] bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${boundedPercent}%` }}></div>
                                </div>
                                <p className="text-[12px] md:text-[14px] font-medium mt-3 opacity-90">dari {calorieTarget ? calorieTarget.toLocaleString('id-ID') : '-'} kkal target</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:col-span-5 order-2 flex flex-col h-full">
                        <div className="bg-white rounded-[28px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col w-full h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[14px] md:text-[16px] font-extrabold text-gray-800 tracking-widest uppercase">Asupan Makro</h3>
                                <button onClick={() => navigate('/insight', { state: { goal: currentGoal, email: userEmail } })} className="text-[13px] font-bold text-[#14AE5C] hover:underline flex items-center gap-1">Detail <Icon icon="mdi:chevron-right" /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-3 md:gap-5 flex-1">
                                {[
                                    { label: 'PROTEIN', icon: 'mdi:arm-flex-outline', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]', border: 'border-[#FFE4C4]', val: macroTotals.protein, max: targets.protein },
                                    { label: 'KARBOHIDRAT', icon: 'mdi:bread-slice-outline', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]', border: 'border-[#dbeafe]', val: macroTotals.carbs, max: targets.carbs },
                                    { label: 'LEMAK', icon: 'mdi:oil', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]', border: 'border-[#ede9fe]', val: macroTotals.fat, max: targets.fat }
                                ].map((macro, idx) => (
                                    <div key={idx} className={`${macro.bg} rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex flex-col items-center justify-between border ${macro.border} hover:shadow-md transition-all h-full min-h-[120px]`}>
                                        <span className={`text-[10px] md:text-[12px] font-extrabold ${macro.color} tracking-wider text-center`}>{macro.label}</span>
                                        <Icon icon={macro.icon} className={`text-[28px] md:text-[36px] ${macro.color} my-auto`} />
                                        <div className="w-[85%] h-[5px] md:h-[6px] bg-black/5 rounded-full overflow-hidden mt-2 mb-2 md:mb-3">
                                            <div className={`h-full ${macro.bg === 'bg-[#FFF5EB]' ? 'bg-[#F97316]' : macro.bg === 'bg-[#F0F5FF]' ? 'bg-[#3B82F6]' : 'bg-[#8B5CF6]'}`} style={{ width: getMacroPercent(macro.val, macro.max) }}></div>
                                        </div>
                                        <span className="text-[13px] md:text-[15px] font-extrabold text-gray-800">{macro.val}g <span className="text-[10px] md:text-[11px] font-semibold text-gray-500 block md:inline">/ {macro.max}g</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:col-span-7 order-3 flex flex-col h-full">
                        <div 
                            onClick={() => navigate('/chat-bot', { state: { goal: currentGoal, email: userEmail } })}
                            className="w-full bg-gradient-to-r from-[#E8F5EE] to-white rounded-[28px] p-6 md:p-8 flex items-center gap-5 border border-[#DCFCE7] shadow-sm hover:shadow-md hover:border-[#14AE5C] cursor-pointer transition-all active:scale-[0.99] group overflow-hidden h-full min-h-[120px]"
                        >
                            <div className="w-[60px] h-[60px] md:w-[75px] md:h-[75px] bg-white rounded-full flex justify-center items-center shadow-sm border border-gray-100 flex-shrink-0">
                                <img src={robotImg} className="w-[45px] h-[45px] md:w-[55px] md:h-[55px] object-contain drop-shadow-sm" alt="AI Bot" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <h4 className="text-[15px] md:text-[17px] font-extrabold text-gray-800 mb-1 group-hover:text-[#14AE5C] transition-colors">AI Insight</h4>
                                <p className="text-[13px] md:text-[14px] font-medium text-gray-500 leading-relaxed line-clamp-2">
                                    {insightText}
                                </p>
                            </div>
                            <div className="hidden md:flex w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm text-[#14AE5C] group-hover:bg-[#14AE5C] group-hover:text-white transition-colors flex-shrink-0">
                                <Icon icon="mdi:chevron-right" className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:col-span-5 order-4 flex flex-col h-full">
                        <div className="bg-white rounded-[28px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col w-full h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[14px] md:text-[16px] font-extrabold text-gray-800 tracking-widest uppercase">Makanan Terakhir</h3>
                                <button onClick={() => navigate('/diary', { state: { goal: currentGoal, email: userEmail } })} className="text-[13px] font-bold text-[#14AE5C] hover:underline flex items-center gap-1">Lihat Semua <Icon icon="mdi:chevron-right" /></button>
                            </div>
                            <div className="flex flex-col gap-4 flex-1">
                                {recentFoods.length > 0 ? recentFoods.map((food, index) => (
                                    <div key={index} className="w-full bg-[#F8FAFC] rounded-[20px] p-4 flex items-center border-[1.5px] border-transparent hover:border-[#14AE5C] hover:bg-white transition-all cursor-default shadow-sm">
                                        <div className={`w-[50px] h-[50px] md:w-[56px] md:h-[56px] ${food.bg} rounded-full flex justify-center items-center mr-4 flex-shrink-0`}>
                                            <Icon icon={food.icon} className={`text-[24px] md:text-[28px] ${food.color}`} />
                                        </div>
                                        <div className="flex flex-col flex-1 overflow-hidden">
                                            <span className="text-[14px] md:text-[15px] font-extrabold text-gray-800 truncate">{food.name}</span>
                                            <span className="text-[12px] md:text-[13px] font-medium text-gray-400 mt-0.5">{food.qty}</span>
                                        </div>
                                        <span className="text-[14px] md:text-[15px] font-extrabold text-[#14AE5C] ml-3 bg-[#E8F5EE] px-2.5 py-1 rounded-full">{food.calories} kkal</span>
                                    </div>
                                )) : (
                                    <div className="w-full h-full min-h-[150px] bg-gray-50 rounded-[20px] p-8 text-center border border-dashed border-gray-200 flex flex-col items-center justify-center flex-1">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                                            <Icon icon="mdi:food-off-outline" className="text-3xl text-gray-300" />
                                        </div>
                                        <span className="text-[13px] font-medium text-gray-400">Belum ada makanan yang dicatat hari ini</span>
                                    </div>
                                )}
                            </div>
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
                            <Icon icon={item.icon} className={`text-[26px] transition-colors ${currentPath === item.path || (item.path === '/dashboard' && currentPath === '/') ? 'text-[#14AE5C]' : 'text-gray-300'}`} />
                            <span className={`text-[11px] font-extrabold transition-colors ${currentPath === item.path || (item.path === '/dashboard' && currentPath === '/') ? 'text-[#14AE5C]' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default DashboardScreen;
