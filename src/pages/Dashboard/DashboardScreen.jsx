import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';
import robotImg from '../../assets/images/robot.png';
import { getFoodLogs, getTotalCalories } from '../../utils/foodLogStorage';

const DashboardScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const userName = userEmail ? userEmail.split('@')[0] : 'Sobat Sehat';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            localStorage.setItem('userEmail', location.state.email);
        }
    }, [location.state?.email]);

    const dashboardData = {
        turunkan: { calorieTitle: 'KALORI HARI INI', calorieCount: '750', calorieTarget: 'dari 1.500 kkal target', caloriePercent: 50, barWidth: '50%', protein: { value: '85', max: '120', percent: '70%' }, karbo: { value: '160', max: '250', percent: '64%' }, lemak: { value: '70', max: '70', percent: '100%' }, aiInsight: 'Kalori kamu masih aman. Tambahkan sayur di makan malam untuk hasil lebih optimal.', foods: [{ name: 'Nasi Merah', qty: '100g', cals: '110 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Dada Ayam Rebus', qty: '100g', cals: '150 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Brokoli Rebus', qty: '100g', cals: '55 kkal', icon: 'mdi:leaf', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Buah Apel', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] },
        jaga: { calorieTitle: 'SISA KALORI HARI INI', calorieCount: '120', calorieTarget: 'dari 1.450 kkal', caloriePercent: 90, barWidth: '90%', protein: { value: '90', max: '110', percent: '81%' }, karbo: { value: '105', max: '220', percent: '47%' }, lemak: { value: '60', max: '65', percent: '92%' }, aiInsight: 'Asupan kamu sudah seimbang hari ini. Pertahankan kebiasaan baik ini!', foods: [{ name: 'Nasi Putih', qty: '150g', cals: '220 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Telur Rebus', qty: '2 butir', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Dada Ayam Panggang', qty: '100g', cals: '165 kkal', icon: 'mdi:food-drumstick', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Apel Segar', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] },
        tambah: { calorieTitle: 'SISA KALORI HARI INI', calorieCount: '780', calorieTarget: 'dari 2.400 kkal', caloriePercent: 110, barWidth: '100%', protein: { value: '85', max: '110', percent: '77%' }, karbo: { value: '270', max: '320', percent: '84%' }, lemak: { value: '70', max: '60', percent: '100%' }, aiInsight: 'Kamu butuh sekitar 700 kkal lagi. Coba tambahkan camilan tinggi kalori di sore hari.', foods: [{ name: 'Nasi Putih Besar', qty: '200g', cals: '260 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Daging Sapi Panggang', qty: '150g', cals: '350 kkal', icon: 'mdi:food-steak', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Jus Alpukat', qty: '1 gelas', cals: '250 kkal', icon: 'mdi:cup-water', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Kacang Kacangan', qty: '50g', cals: '280 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] }
    };
    const data = dashboardData[currentGoal];
    const foodLogs = getFoodLogs(userEmail);
    const totalCalories = getTotalCalories(foodLogs);
    const calorieTarget = currentGoal === 'tambah' ? 2400 : currentGoal === 'jaga' ? 1450 : 1500;
    const caloriePercent = Math.round((totalCalories / calorieTarget) * 100);
    const recentFoods = foodLogs.slice(0, 4);
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const boundedPercent = Math.min(caloriePercent, 100);
    const strokeDashoffset = circumference - (boundedPercent / 100) * circumference;

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col relative overflow-hidden'>
                <div className="pt-10 px-6 bg-white z-10 flex-shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <img src={logoIcon} alt="Logo" className="w-[40px] h-[40px] object-contain" />
                            <h1 className="-ml-[4px] text-[24px] font-bold text-[#14AE5C]">EatSistent</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => alert("Belum ada notifikasi baru hari ini.")}
                                className="text-gray-700 hover:text-[#14AE5C] transition-colors relative"
                            >
                                <Icon icon="mdi:bell-outline" className="text-2xl" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div 
                                onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })}
                                className="w-[36px] h-[36px] rounded-full bg-gray-100 flex justify-center items-center overflow-hidden border-2 border-transparent hover:border-[#14AE5C] cursor-pointer transition-all shadow-sm"
                            >
                                <img src={profileImg} alt="Profile" className="w-full h-full object-cover object-center" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-black leading-tight">Hi, {userName}!</h2>
                        <p className="text-[13px] font-medium text-gray-500 mt-1">Semangat jaga pola makan sehat hari ini!</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-[100px] hide-scrollbar">
                    <div className="w-full bg-[#14AE5C] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden mb-6 flex-shrink-0">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[12px] font-bold opacity-90 tracking-wide">KALORI HARI INI</h3>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-[48px] font-bold leading-none">{totalCalories}</span>
                                    <span className="text-[14px] font-semibold opacity-90 flex items-center gap-1"><Icon icon="mdi:fire" className="text-lg" /> kkal</span>
                                </div>
                            </div>
                            <div className="relative w-[60px] h-[60px] flex justify-center items-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="30" cy="30" r={radius} stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="transparent" />
                                    <circle cx="30" cy="30" r={radius} stroke="#ffffff" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <span className="absolute text-[14px] font-bold">{caloriePercent}%</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full h-[8px] bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${boundedPercent}%` }}></div></div>
                            <p className="text-[11px] font-medium mt-2 opacity-90">dari {calorieTarget.toLocaleString('id-ID')} kkal target</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-[15px] font-bold text-black">ASUPAN MAKRO</h3>
                        <span className="text-[12px] font-bold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/insight', { state: { goal: currentGoal, email: userEmail } })}>Lihat Detail {'>'}</span>
                    </div>

                    <div className="flex justify-center gap-[17px] mb-6 flex-shrink-0">
                        <div className="w-[90px] h-[93px] bg-[#FFF5EB] rounded-[16px] py-2 px-1 flex flex-col items-center justify-between border border-[#FFE4C4]">
                            <span className="text-[9px] font-bold text-[#F97316] tracking-wider">PROTEIN</span>
                            <Icon icon="mdi:arm-flex-outline" className="text-2xl text-[#F97316]" />
                            <div className="w-[80%] h-[4px] bg-[#F97316]/20 rounded-full overflow-hidden"><div className="h-full bg-[#F97316]" style={{ width: data.protein.percent }}></div></div>
                            <span className="text-[9px] font-semibold text-gray-500">{data.protein.value}g/{data.protein.max}g</span>
                            <span className="text-[12px] font-bold text-black leading-none">{data.protein.value}g</span>
                        </div>
                        <div className="w-[90px] h-[93px] bg-[#F0F5FF] rounded-[16px] py-2 px-1 flex flex-col items-center justify-between border border-[#Dbeafe]">
                            <span className="text-[9px] font-bold text-[#3B82F6] tracking-wider">KARBOHIDRAT</span>
                            <Icon icon="mdi:bread-slice-outline" className="text-2xl text-[#3B82F6]" />
                            <div className="w-[80%] h-[4px] bg-[#3B82F6]/20 rounded-full overflow-hidden"><div className="h-full bg-[#3B82F6]" style={{ width: data.karbo.percent }}></div></div>
                            <span className="text-[9px] font-semibold text-gray-500">{data.karbo.value}g/{data.karbo.max}g</span>
                            <span className="text-[12px] font-bold text-black leading-none">{data.karbo.value}g</span>
                        </div>
                        <div className="w-[90px] h-[93px] bg-[#F5F3FF] rounded-[16px] py-2 px-1 flex flex-col items-center justify-between border border-[#ede9fe]">
                            <span className="text-[9px] font-bold text-[#8B5CF6] tracking-wider">LEMAK</span>
                            <Icon icon="mdi:oil" className="text-2xl text-[#8B5CF6]" />
                            <div className="w-[80%] h-[4px] bg-[#8B5CF6]/20 rounded-full overflow-hidden"><div className="h-full bg-[#8B5CF6]" style={{ width: data.lemak.percent }}></div></div>
                            <span className="text-[9px] font-semibold text-gray-500">{data.lemak.value}g/{data.lemak.max}g</span>
                            <span className="text-[12px] font-bold text-black leading-none">{data.lemak.value}g</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/chat-bot', { state: { goal: currentGoal } })}
                        className="w-full bg-[#F0FDF4] rounded-[20px] p-4 flex items-center gap-3 border border-[#DCFCE7] mb-6 flex-shrink-0 cursor-pointer hover:shadow-md hover:border-[#14AE5C] transition-all active:scale-[0.98] relative"
                    >
                        <img src={robotImg} alt="AI Bot" className="w-[70px] h-[58px] object-contain flex-shrink-0 drop-shadow-sm" />
                        <div className="flex flex-col flex-1">
                            <h4 className="text-[13px] font-bold text-[#14AE5C] mb-1 tracking-wide">AI NUTRITION INSIGHT</h4>
                            <p className="text-[12px] font-medium text-gray-700 leading-snug">{data.aiInsight}</p>
                        </div>
                        <div className="absolute top-4 right-4 text-[#14AE5C] bg-[#E8F5EE] rounded-full p-1">
                            <Icon icon="mdi:chevron-right" className="text-xl" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-[15px] font-bold text-black">MAKANAN TERAKHIR</h3>
                        <span className="text-[12px] font-bold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/diary', { state: { goal: currentGoal, email: userEmail } })}>Lihat Semua {'>'}</span>
                    </div>

                    <div className="flex flex-col gap-3 pb-6">
                        {recentFoods.length > 0 ? recentFoods.map((food, index) => (
                            <div key={index} className="w-full bg-white rounded-[16px] p-4 flex items-center shadow-sm border border-gray-100 flex-shrink-0">
                                <div className={`w-[40px] h-[40px] ${food.bg} rounded-full flex justify-center items-center mr-3`}><Icon icon={food.icon} className={`text-[22px] ${food.color}`} /></div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{food.name}</span>
                                    <span className="text-[12px] font-medium text-gray-500">{food.qty}</span>
                                </div>
                                <span className="text-[12px] font-bold text-gray-600">{food.calories} kkal</span>
                            </div>
                        )) : (
                            <div className="w-full bg-white rounded-[16px] p-4 text-center shadow-sm border border-gray-100 flex-shrink-0">
                                <span className="text-[13px] font-medium text-gray-500">Belum ada makanan yang dicatat</span>
                            </div>
                        )}
                    </div>
                </div>

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

export default DashboardScreen;
