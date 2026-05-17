import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react';
import Button from './components/ui/Button';

import mascotImage from './assets/images/mascot.png';
import logoIcon from './assets/icons/logo-icon.png';
import confettiImg from './assets/images/confetti.png';
import profileImg from './assets/images/profile.png';
import robotImg from './assets/images/robot.png';
import foodImg from './assets/images/makanan.png';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl relative flex flex-col items-center pt-12 pb-10 px-4 overflow-hidden'>
                <header className="flex items-center gap-1 mt-2">
                    <img src={logoIcon} alt="Logo" className="w-[80px] h-[70px] object-contain" />
                    <h1 className="-ml-3 text-[32px] font-bold text-[#14AE5C]">EatSistent</h1>
                </header>
                <img src={mascotImage} alt="Mascot EatSistent" className="w-[350px] h-[250px] object-contain mt-10 mb-8" />
                <div className="text-center mt-2">
                    <h2 className="text-[24px] font-bold text-black">Selamat Datang!</h2>
                    <p className="text-[16px] font-medium text-black mt-3 px-6 leading-relaxed">Mari kita sesuaikan EatSistent <br/> dengan sasaranmu.</p>
                </div>
                <footer className="mt-auto w-full flex flex-col items-center">
                    <Button onClick={() => navigate('/sasaran')}>Lanjutkan</Button>
                    <div className="w-[358px] flex items-center gap-4 my-5 text-black font-semibold">
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                        <span className="text-[12px] tracking-wide">ATAU</span>
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/login')}>Masuk</Button>
                </footer>
            </div>
        </div>
    );
};

const GoalSelection = () => {
    const navigate = useNavigate();
    const [selectedGoal, setSelectedGoal] = useState(null);
    const goals = [
        { id: 'turunkan', title: 'Turunkan Berat Badan', icon: 'mdi:scale-bathroom', color: '#14AE5C' },
        { id: 'jaga', title: 'Jaga Berat Badan', icon: 'ph:person-simple-walk-bold', color: '#14AE5C' },
        { id: 'tambah', title: 'Tambah Berat Badan', icon: 'mdi:dumbbell', color: '#14AE5C' },
        { id: 'otot', title: 'Membentuk Otot', icon: 'mdi:arm-flex', color: '#14AE5C' },
    ];
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/welcome')} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedGoal ? '20%' : '0%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{selectedGoal ? '20 %' : '0 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[24px] font-bold text-black">Halo, Sobat Sehat</h2>
                    <p className="text-[15px] font-medium text-gray-500 mt-2">Mari mulai dari sasaranmu.</p>
                </div>
                <div className="flex flex-col gap-3">
                    {goals.map((goal) => (
                        <div key={goal.id} onClick={() => setSelectedGoal(goal.id)} className={`w-full h-[76px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer ${selectedGoal === goal.id ? 'border-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className="w-[44px] h-[44px] flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm mr-4">
                                <Icon icon={goal.icon} className="w-6 h-6" style={{ color: goal.color }} />
                            </div>
                            <span className={`text-[15px] font-semibold ${selectedGoal === goal.id ? 'text-black' : 'text-gray-700'}`}>{goal.title}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex justify-center w-full">
                    <Button onClick={() => selectedGoal && navigate('/motivasi', { state: { goal: selectedGoal } })} className={!selectedGoal ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

const GoalChart = ({ goal }) => {
    const configs = {
        turunkan: { path: "M 0 20 Q 50 40, 100 60 T 200 100 T 300 140 T 350 160", area: "M 0 20 Q 50 40, 100 60 T 200 100 T 300 140 T 350 160 V 200 H 0 Z", label: "Proyeksi Penurunan" },
        jaga: { path: "M 0 100 Q 50 90, 100 105 T 200 95 T 300 102 T 350 100", area: "M 0 100 Q 50 90, 100 105 T 200 95 T 300 102 T 350 100 V 200 H 0 Z", label: "Proyeksi Kestabilan" },
        tambah: { path: "M 0 160 Q 50 140, 100 130 T 200 90 T 300 50 T 350 30", area: "M 0 160 Q 50 140, 100 130 T 200 90 T 300 50 T 350 30 V 200 H 0 Z", label: "Proyeksi Kenaikan" },
        otot: { path: "M 0 150 L 50 140 L 100 135 L 150 110 L 200 105 L 250 80 L 300 75 L 350 50", area: "M 0 150 L 50 140 L 100 135 L 150 110 L 200 105 L 250 80 L 300 75 L 350 50 V 200 H 0 Z", label: "Proyeksi Massa Otot" }
    };
    const config = configs[goal] || configs.jaga;
    return (
        <div className="w-full h-[220px] bg-[#F0FDF4]/50 rounded-2xl border border-gray-100 p-4 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[12px] font-bold text-[#14AE5C] uppercase tracking-wider">{config.label}</span>
                <span className="text-[10px] font-semibold text-gray-400">Target 3-6 Bulan</span>
            </div>
            <svg viewBox="0 0 350 200" className="w-full h-[140px] drop-shadow-lg">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14AE5C" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#14AE5C" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={config.area} fill="url(#chartGradient)" />
                <path d={config.path} fill="none" stroke="#14AE5C" strokeWidth="4" strokeLinecap="round" className="animate-dash" style={{ strokeDasharray: 1000, strokeDashoffset: 0 }} />
                {[0, 100, 200, 300, 350].map((x, i) => (
                    <circle key={i} cx={x} cy={configs[goal]?.path.split(' ')[(i*2)+2] || 100} r="4" fill="white" stroke="#14AE5C" strokeWidth="2" />
                ))}
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between">
                <span className="text-[10px] font-bold text-gray-400">Mulai</span>
                <span className="text-[10px] font-bold text-gray-400">Target</span>
            </div>
        </div>
    );
};

const MotivationScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan'; 
    const contentData = {
        turunkan: { title: 'Menurunkan Berat Badan Tidak Selalu Mudah', desc: 'Tetapi kami akan memotivasi Anda melewati segala kesulitannya.' },
        jaga: { title: 'Menjaga berat badan ideal adalah bentuk konsistensi.', desc: 'Pertahankan pola sehatmu untuk hidup berkualitas setiap hari.' },
        tambah: { title: 'Menambah berat badan sehat butuh strategi.', desc: 'Kami akan membantu Anda mencapai berat ideal dengan cara yang sehat.' },
        otot: { title: 'Otot dibangun dari nutrisi dan disiplin tinggi.', desc: 'Kami akan memandu setiap langkah mu menuju tubuh yang lebih kuat.' }
    };
    const currentContent = contentData[selectedGoal];
    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/sasaran')} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">35 %</span>
                    </div>
                </div>
                <div className="mt-8 mb-6 overflow-y-auto hide-scrollbar flex-1 pb-4">
                    <h2 className="text-[26px] font-bold text-black leading-snug mb-6">{currentContent.title}</h2>
                    <div className="flex justify-center mb-8"><GoalChart goal={selectedGoal} /></div>
                    <p className="text-[18px] font-medium text-gray-700 leading-relaxed">{currentContent.desc}</p>
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button onClick={() => navigate('/datadiri', { state: { goal: selectedGoal } })}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

const PersonalDataScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const needsTarget = selectedGoal === 'turunkan' || selectedGoal === 'tambah';
    const isComplete = gender && age && height && weight && (!needsTarget || targetWeight);
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '50%' : '35%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '50 %' : '35 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Beri tahu kami sedikit tentang diri Anda.</h2>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pb-4 hide-scrollbar">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Jenis Kelamin</label>
                        <div className="flex gap-4">
                            <button onClick={() => setGender('pria')} className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'pria' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}><Icon icon="mdi:gender-male" className="text-xl" /> Pria</button>
                            <button onClick={() => setGender('wanita')} className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'wanita' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}><Icon icon="mdi:gender-female" className="text-xl" /> Wanita</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Usia</label>
                        <div className="relative">
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tahun</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Tinggi Badan</label>
                        <div className="relative">
                            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Cm</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Berat Badan Sekarang</label>
                        <div className="relative">
                            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Kg</span>
                        </div>
                    </div>
                    {needsTarget && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] font-medium text-gray-700">Target Berat Badan</label>
                            <div className="relative">
                                <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Kg</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Lokasi</label>
                        <div className="w-full h-[50px] border-[1.5px] border-gray-200 bg-gray-50 rounded-[12px] px-4 flex items-center gap-2 font-semibold text-gray-500">
                            <Icon icon="twemoji:flag-indonesia" /> Indonesia
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button onClick={() => isComplete && navigate('/aktivitas', { state: { goal: selectedGoal } })} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

const ActivityScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [selectedActivity, setSelectedActivity] = useState(null);
    const activities = [
        { id: 'rendah', title: 'Tidak Terlalu Aktif', desc: 'Duduk hampir sepanjang hari', icon: 'mdi:seat-recline-normal' },
        { id: 'sedang', title: 'Agak Aktif', desc: 'Banyak berdiri / berjalan sedikit.', icon: 'mdi:walk' },
        { id: 'aktif', title: 'Aktif', desc: 'Banyak bergerak secara fisik.', icon: 'mdi:run' },
        { id: 'sangat', title: 'Sangat Aktif', desc: 'Aktivitas fisik yang berat.', icon: 'mdi:weight-lifter' }
    ];
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedActivity ? '70%' : '50%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{selectedActivity ? '70 %' : '50 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Seberapa aktif Anda setiap hari?</h2>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-4">
                    {activities.map((act) => (
                        <div key={act.id} onClick={() => setSelectedActivity(act.id)} className={`w-full h-[80px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer flex-shrink-0 ${selectedActivity === act.id ? 'border-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className="w-[50px] flex items-center justify-center mr-2">
                                <Icon icon={act.icon} className={`text-4xl ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[15px] font-bold ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`}>{act.title}</span>
                                <span className="text-[12px] font-medium text-gray-500">{act.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button onClick={() => selectedActivity && navigate('/kebiasaan', { state: { goal: selectedGoal } })} className={!selectedActivity ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

const HabitsScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [selectedHabits, setSelectedHabits] = useState([]);
    const isComplete = selectedHabits.length >= 3;
    const habitsList = ['Lacak Kalori', 'Konsumsi Protein', 'Makan Gizi Seimbang', 'Minum Cukup Air', 'Tidur Cukup', 'Olahraga Teratur', 'Kurangi Gula', 'Makan Sayur & Buah', 'Hindari Makan Malam', 'Kontrol Porsi', 'Jangan Lupa Sarapan', 'Kurangi Makanan Olahan', 'Rutin Olah Raga', 'Makan dengan Porsi Kecil', 'Mengurangi Konsumsi Alkohol', 'Meminimalisir Stres'];
    const toggleHabit = (habit) => {
        if (selectedHabits.includes(habit)) setSelectedHabits(selectedHabits.filter(h => h !== habit));
        else setSelectedHabits([...selectedHabits, habit]);
    };
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6 flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '90%' : '70%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '90 %' : '70 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-4 flex-shrink-0">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Kebiasaan mana yang paling penting bagi Anda?</h2>
                    <p className="text-[14px] font-medium text-gray-500 mt-2">Pilih minimal 3 kebiasaan.</p>
                </div>
                <div className="flex-1 overflow-y-auto hide-scrollbar mt-2 pb-4">
                    <div className="flex flex-wrap content-start gap-3">
                        {habitsList.map((habit) => (
                            <button key={habit} onClick={() => toggleHabit(habit)} className={`px-5 py-3 rounded-full border-[1.5px] font-semibold text-[14px] transition-all ${selectedHabits.includes(habit) ? 'border-[#14AE5C] text-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 text-gray-600 bg-white'}`}>{habit}</button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 mb-6 w-full bg-[#F0FDF4] rounded-[16px] p-4 flex items-start gap-4 border border-[#E8F5EE] flex-shrink-0">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center flex-shrink-0 shadow-sm">
                        <Icon icon="mdi:lightbulb-on-outline" className="text-xl text-[#14AE5C]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-black">Tahukah Anda?</span>
                        <span className="text-[12px] font-medium text-gray-600 leading-relaxed mt-1">Anda bisa menginput makanan melalui Teks atau Barcode nanti di Dashboard.</span>
                    </div>
                </div>
                <div className="flex justify-center w-full flex-shrink-0">
                    <Button onClick={() => isComplete && navigate('/daftar', { state: { goal: selectedGoal } })} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

const RegisterScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isComplete = email && password;
    const messageData = {
        turunkan: 'Kamu baru saja mengambil langkah besar untuk mencapai target berat badan idealmu.',
        tambah: 'Kamu baru saja mengambil langkah besar untuk mencapai target berat badan impianmu.',
        jaga: 'Kamu baru saja mengambil langkah besar untuk menjaga konsistensi berat badanmu.',
        otot: 'Kamu baru saja mengambil langkah besar untuk membentuk massa otot yang lebih kuat.'
    };
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '100%' : '90%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-[#14AE5C]">{isComplete ? '100 %' : '90 %'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center mt-10">
                    <img src={confettiImg} alt="Sukses" className="w-[180px] h-[180px] object-contain" />
                    <h2 className="text-[28px] font-bold text-black mt-4">Hebat!</h2>
                    <p className="text-[15px] font-medium text-black text-center mt-2 px-4 leading-relaxed">{messageData[selectedGoal]}</p>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="nama@gmail.com" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] pl-4 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="Minimal 8 karakter" />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex flex-col items-center w-full gap-4 pt-6">
                    <Button onClick={() => isComplete && navigate('/login', { state: { goal: selectedGoal } })} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>Daftar</Button>
                    <p className="text-[14px] font-semibold text-gray-600">Sudah punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/login', { state: { goal: selectedGoal } })}>Masuk</span></p>
                </div>
            </div>
        </div>
    );
};

const LoginScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isComplete = email && password;
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-16 pb-10 px-6 overflow-hidden'>
                <h2 className="text-[32px] font-bold text-center text-black mb-12">LogIn</h2>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="nama@gmail.com" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-4 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="Minimal 8 karakter" />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                    <Button onClick={() => navigate('/dashboard', { state: { goal: selectedGoal } })} className={`w-full h-[54px] text-[16px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Masuk</Button>
                    <p className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer mt-2" onClick={() => navigate('/lupa-sandi')}>Lupa kata sandi?</p>
                </div>
                <div className="mt-auto flex justify-center">
                    <p className="text-[14px] font-semibold text-gray-600">Belum punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/welcome')}>Daftar Baru</span></p>
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordScreen = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8"><Icon icon="mdi:arrow-left" /></button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-8">
                        <img src={logoIcon} alt="Logo" className="w-[60px] h-[55px] object-contain" />
                        <h1 className="text-[30px] font-bold text-[#14AE5C]">EatSistent</h1>
                    </div>
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:email-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center"><Icon icon="mdi:check" className="text-white text-md" /></div>
                    </div>
                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Lupa Kata Sandi?</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center px-4 leading-relaxed mb-8">Masukkan email yang terdaftar untuk menerima kode verifikasi.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Email</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon="mdi:email-outline" /></div>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-12 pr-4 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="nama@email.com" />
                    </div>
                </div>
                <div className="flex flex-col gap-6 mt-auto">
                    <Button onClick={() => email && navigate('/otp')} className={`w-full h-[54px] ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}>Kirim Kode</Button>
                    <p className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/login')}>Kembali ke Masuk</p>
                </div>
            </div>
        </div>
    );
};

const OtpScreen = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef([]);
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) inputs.current[index + 1].focus();
    };
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1].focus();
    };
    const isComplete = otp.every(digit => digit !== '');
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8"><Icon icon="mdi:arrow-left" /></button>
                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">1</div><span className="text-xs font-semibold text-gray-500">Email</span></div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">2</div><span className="text-xs font-semibold text-[#14AE5C]">Verifikasi</span></div>
                    <div className="h-[2px] w-12 bg-gray-200"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex justify-center items-center font-bold text-sm">3</div><span className="text-xs font-semibold text-gray-400">Sandi Baru</span></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:shield-lock-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center"><Icon icon="mdi:check" className="text-white text-md" /></div>
                    </div>
                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Masukkan Kode Verifikasi</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed mb-8">Kami telah mengirimkan kode 4 digit ke <br/> <span className="font-bold text-[#14AE5C]">wulan@email.com</span></p>
                </div>
                <div className="flex justify-center gap-4 mb-8">
                    {otp.map((digit, index) => (
                        <input key={index} type="text" maxLength="1" value={digit} onChange={(e) => handleChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} ref={(el) => (inputs.current[index] = el)} className={`w-[60px] h-[60px] rounded-xl border-2 text-center text-[24px] font-bold outline-none transition-all ${digit ? 'border-[#14AE5C] text-black' : 'border-gray-200 text-gray-400 focus:border-[#14AE5C]'}`} />
                    ))}
                </div>
                <p className="text-center text-[14px] font-medium text-gray-500">Tidak menerima kode? <br/> <span className="font-semibold text-[#14AE5C] cursor-pointer mt-1 block">Kirim Ulang (00:45)</span></p>
                <div className="flex flex-col gap-6 mt-auto">
                    <Button onClick={() => isComplete && navigate('/reset-sandi')} className={`w-full h-[54px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Verifikasi</Button>
                    <p className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/lupa-sandi')}>Ubah Email</p>
                </div>
            </div>
        </div>
    );
};

const ResetPasswordScreen = () => {
    const navigate = useNavigate();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const isComplete = pass1 && pass2 && pass1 === pass2;
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8"><Icon icon="mdi:arrow-left" /></button>
                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div><span className="text-xs font-semibold text-gray-500">Email</span></div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div><span className="text-xs font-semibold text-gray-500">Verifikasi</span></div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">3</div><span className="text-xs font-semibold text-[#14AE5C]">Sandi Baru</span></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:lock-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center"><Icon icon="mdi:check" className="text-white text-md" /></div>
                    </div>
                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Buat Kata Sandi Baru</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed mb-8">Gunakan kata sandi yang kuat untuk menjaga akunmu tetap aman.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Kata Sandi Baru</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl"><Icon icon="mdi:lock-outline" /></div>
                            <input type={showPassword1 ? "text" : "password"} value={pass1} onChange={(e) => setPass1(e.target.value)} className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-12 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="••••••••" />
                            <button onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword1 ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Ulangi Kata Sandi</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl"><Icon icon="mdi:lock-outline" /></div>
                            <input type={showPassword2 ? "text" : "password"} value={pass2} onChange={(e) => setPass2(e.target.value)} className={`w-full h-[54px] border-[1.5px] rounded-[12px] pl-12 pr-12 font-semibold outline-none transition-all text-[14px] ${pass2 && pass1 !== pass2 ? 'border-red-400' : 'border-gray-200 focus:border-[#14AE5C]'}`} placeholder="••••••••" />
                            <button onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword2 ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 mt-auto pt-6">
                    <Button onClick={() => isComplete && navigate('/login')} className={`w-full h-[54px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Simpan & Masuk</Button>
                </div>
            </div>
        </div>
    );
};

const DashboardScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const dashboardData = {
        turunkan: { calorieTitle: 'KALORI HARI INI', calorieCount: '750', calorieTarget: 'dari 1.500 kkal target', caloriePercent: 50, barWidth: '50%', protein: { value: '85', max: '120', percent: '70%' }, karbo: { value: '160', max: '250', percent: '64%' }, lemak: { value: '70', max: '70', percent: '100%' }, aiInsight: 'Kalori kamu masih aman. Tambahkan sayur di makan malam untuk hasil lebih optimal.', foods: [{ name: 'Nasi Merah', qty: '100g', cals: '110 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Dada Ayam Rebus', qty: '100g', cals: '150 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Brokoli Rebus', qty: '100g', cals: '55 kkal', icon: 'mdi:leaf', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Buah Apel', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] },
        jaga: { calorieTitle: 'SISA KALORI HARI INI', calorieCount: '120', calorieTarget: 'dari 1.450 kkal', caloriePercent: 90, barWidth: '90%', protein: { value: '90', max: '110', percent: '81%' }, karbo: { value: '105', max: '220', percent: '47%' }, lemak: { value: '60', max: '65', percent: '92%' }, aiInsight: 'Asupan kamu sudah seimbang hari ini. Pertahankan kebiasaan baik ini!', foods: [{ name: 'Nasi Putih', qty: '150g', cals: '220 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Telur Rebus', qty: '2 butir', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Dada Ayam Panggang', qty: '100g', cals: '165 kkal', icon: 'mdi:food-drumstick', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Apel Segar', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] },
        tambah: { calorieTitle: 'SISA KALORI HARI INI', calorieCount: '780', calorieTarget: 'dari 2.400 kkal', caloriePercent: 110, barWidth: '100%', protein: { value: '85', max: '110', percent: '77%' }, karbo: { value: '270', max: '320', percent: '84%' }, lemak: { value: '70', max: '60', percent: '100%' }, aiInsight: 'Kamu butuh sekitar 700 kkal lagi. Coba tambahkan camilan tinggi kalori di sore hari.', foods: [{ name: 'Nasi Putih Besar', qty: '200g', cals: '260 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Daging Sapi Panggang', qty: '150g', cals: '350 kkal', icon: 'mdi:food-steak', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Jus Alpukat', qty: '1 gelas', cals: '250 kkal', icon: 'mdi:cup-water', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Kacang Kacangan', qty: '50g', cals: '280 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] },
        otot: { calorieTitle: 'SISA KALORI HARI INI', calorieCount: '560', calorieTarget: 'dari 2.100 kkal', caloriePercent: 105, barWidth: '100%', protein: { value: '112', max: '150', percent: '74%' }, karbo: { value: '210', max: '250', percent: '84%' }, lemak: { value: '65', max: '70', percent: '92%' }, aiInsight: 'Protein kamu kurang 38g lagi. Tambahkan sumber protein setelah workout!', foods: [{ name: 'Dada Ayam Panggang', qty: '150g', cals: '248 kkal', icon: 'mdi:food-drumstick', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Putih Telur Rebus', qty: '4 butir', cals: '68 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Protein Shake', qty: '1 porsi', cals: '120 kkal', icon: 'mdi:shaker-outline', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Ikan Salmon', qty: '100g', cals: '208 kkal', icon: 'mdi:fish', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }] }
    };
    const data = dashboardData[currentGoal];
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const boundedPercent = Math.min(data.caloriePercent, 100);
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
                                onClick={() => navigate('/profile', { state: { goal: currentGoal } })}
                                className="w-[36px] h-[36px] rounded-full bg-gray-100 flex justify-center items-center overflow-hidden border-2 border-transparent hover:border-[#14AE5C] cursor-pointer transition-all shadow-sm"
                            >
                                <img src={profileImg} alt="Profile" className="w-full h-full object-cover object-center" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-black leading-tight">Hi, Sobat Sehat!</h2>
                        <p className="text-[13px] font-medium text-gray-500 mt-1">Semangat jaga pola makan sehat hari ini!</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-[100px] hide-scrollbar">
                    <div className="w-full bg-[#14AE5C] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden mb-6 flex-shrink-0">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[12px] font-bold opacity-90 tracking-wide">{data.calorieTitle}</h3>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-[48px] font-bold leading-none">{data.calorieCount}</span>
                                    <span className="text-[14px] font-semibold opacity-90 flex items-center gap-1"><Icon icon="mdi:fire" className="text-lg" /> kkal</span>
                                </div>
                            </div>
                            <div className="relative w-[60px] h-[60px] flex justify-center items-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="30" cy="30" r={radius} stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="transparent" />
                                    <circle cx="30" cy="30" r={radius} stroke="#ffffff" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <span className="absolute text-[14px] font-bold">{data.caloriePercent}%</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full h-[8px] bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: data.barWidth }}></div></div>
                            <p className="text-[11px] font-medium mt-2 opacity-90">{data.calorieTarget}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-[15px] font-bold text-black">ASUPAN MAKRO</h3>
                        <span className="text-[12px] font-bold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/insight', { state: { goal: currentGoal } })}>Lihat Detail {'>'}</span>
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

                    <div className="w-full bg-[#F0FDF4] rounded-[20px] p-4 flex items-center gap-3 border border-[#DCFCE7] mb-6 flex-shrink-0">
                        <img src={robotImg} alt="AI Bot" className="w-[70px] h-[58px] object-contain flex-shrink-0 drop-shadow-sm" />
                        <div className="flex flex-col flex-1">
                            <h4 className="text-[13px] font-bold text-[#14AE5C] mb-1 tracking-wide">AI NUTRITION INSIGHT</h4>
                            <p className="text-[12px] font-medium text-gray-700 leading-snug">{data.aiInsight}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-[15px] font-bold text-black">MAKANAN TERAKHIR</h3>
                        <span className="text-[12px] font-bold text-[#14AE5C] cursor-pointer" onClick={() => navigate('/diary', { state: { goal: currentGoal } })}>Lihat Semua {'>'}</span>
                    </div>

                    <div className="flex flex-col gap-3 pb-6">
                        {data.foods.map((food, index) => (
                            <div key={index} className="w-full bg-white rounded-[16px] p-4 flex items-center shadow-sm border border-gray-100 flex-shrink-0">
                                <div className={`w-[40px] h-[40px] ${food.bg} rounded-full flex justify-center items-center mr-3`}><Icon icon={food.icon} className={`text-[22px] ${food.color}`} /></div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{food.name}</span>
                                    <span className="text-[12px] font-medium text-gray-500">{food.qty}</span>
                                </div>
                                <span className="text-[12px] font-bold text-gray-600">{food.cals}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {isActionMenuOpen && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex flex-col justify-end items-center pb-[120px]" onClick={() => setIsActionMenuOpen(false)}>
                        <button onClick={() => setIsActionMenuOpen(false)} className="absolute top-10 left-6 text-white text-3xl hover:scale-110 transition-transform"><Icon icon="mdi:close" /></button>
                        <div className="w-[350px] flex justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
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
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FoodSearchScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeMealMenu, setActiveMealMenu] = useState(null);

    const goalData = {
        jaga: {
            riwayat: [
                { name: 'Telur Rebus', qty: '100g', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Nasi Putih', qty: '150g', cals: '220 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }
            ],
            saran: [
                { name: 'Dada Ayam Panggang', qty: '100g', cals: '165 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Tumis Terong', qty: '100g', cals: '111 kkal', icon: 'mdi:bowl-mix', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
                { name: 'Brokoli', qty: '80g', cals: '60 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Buah Alpukat', qty: '100g', cals: '111 kkal', icon: 'mdi:seed', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' },
                { name: 'Tumis Wortel', qty: '100g', cals: '111 kkal', icon: 'mdi:carrot', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Pisang Ambon', qty: '1 buah', cals: '78 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }
            ],
            rekomendasi: [
                { name: 'Brokoli', cals: '60 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' },
                { name: 'Wortel', cals: '40 kkal', icon: 'mdi:carrot', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' },
                { name: 'Alpukat', cals: '111 kkal', icon: 'mdi:seed', color: 'text-[#3B82F6]', border: 'border-[#Dbeafe]', bg: 'bg-[#F0F5FF]' }
            ]
        },
        turunkan: {
            riwayat: [
                { name: 'Oatmeal', qty: '50g', cals: '190 kkal', icon: 'mdi:bowl-mix', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Telur Rebus', qty: '100g', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }
            ],
            saran: [
                { name: 'Dada Ayam Rebus', qty: '100g', cals: '150 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Tumis Bayam', qty: '100g', cals: '45 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Apel Hijau', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Tahu Kukus', qty: '100g', cals: '76 kkal', icon: 'mdi:square-rounded', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Salad Sayur', qty: '150g', cals: '120 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Kacang Almond', qty: '30g', cals: '170 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }
            ],
            rekomendasi: [
                { name: 'Apel', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' },
                { name: 'Bayam', cals: '45 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' },
                { name: 'Tahu', cals: '76 kkal', icon: 'mdi:square-rounded', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' }
            ]
        },
        tambah: {
            riwayat: [
                { name: 'Nasi Goreng', qty: '200g', cals: '350 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Daging Sapi', qty: '150g', cals: '350 kkal', icon: 'mdi:food-steak', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }
            ],
            saran: [
                { name: 'Jus Alpukat', qty: '1 gelas', cals: '250 kkal', icon: 'mdi:cup-water', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' },
                { name: 'Roti Gandum', qty: '2 lembar', cals: '150 kkal', icon: 'mdi:bread-slice', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Selai Kacang', qty: '2 sdm', cals: '190 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
                { name: 'Susu Full Cream', qty: '1 gelas', cals: '150 kkal', icon: 'mdi:cup', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' },
                { name: 'Pisang', qty: '1 buah', cals: '105 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
                { name: 'Telur Dadar', qty: '2 butir', cals: '180 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }
            ],
            rekomendasi: [
                { name: 'Susu', cals: '150 kkal', icon: 'mdi:cup', color: 'text-[#3B82F6]', border: 'border-[#Dbeafe]', bg: 'bg-[#F0F5FF]' },
                { name: 'Kacang', cals: '190 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', border: 'border-[#ede9fe]', bg: 'bg-[#F5F3FF]' },
                { name: 'Pisang', cals: '105 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' }
            ]
        },
        otot: {
            riwayat: [
                { name: 'Dada Ayam', qty: '150g', cals: '248 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Putih Telur', qty: '4 butir', cals: '68 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }
            ],
            saran: [
                { name: 'Ikan Salmon', qty: '100g', cals: '208 kkal', icon: 'mdi:fish', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
                { name: 'Dada Ayam Bakar', qty: '150g', cals: '248 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Protein Shake', qty: '1 porsi', cals: '120 kkal', icon: 'mdi:shaker-outline', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' },
                { name: 'Daging Sapi Lemak', qty: '100g', cals: '250 kkal', icon: 'mdi:food-steak', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Tempe Mendoan', qty: '100g', cals: '200 kkal', icon: 'mdi:square-rounded', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
                { name: 'Yoghurt', qty: '1 cup', cals: '100 kkal', icon: 'mdi:cup', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }
            ],
            rekomendasi: [
                { name: 'Salmon', cals: '208 kkal', icon: 'mdi:fish', color: 'text-[#8B5CF6]', border: 'border-[#ede9fe]', bg: 'bg-[#F5F3FF]' },
                { name: 'Telur', cals: '68 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' },
                { name: 'Ayam', cals: '248 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' }
            ]
        }
    };

    const currentData = goalData[selectedGoal] || goalData.jaga;

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const shuffledSaran = useMemo(() => {
        return [...currentData.saran].sort(() => Math.random() - 0.5);
    }, [currentData.saran, refreshKey]);

    const shuffledRekomendasi = useMemo(() => {
        return [...currentData.rekomendasi].sort(() => Math.random() - 0.5);
    }, [currentData.rekomendasi, refreshKey]);

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
                            placeholder="Cari makanan" 
                            className="w-full h-full border-[1.5px] border-gray-200 rounded-[16px] pl-12 pr-14 font-medium outline-none focus:border-[#14AE5C] transition-all text-[14px]"
                        />
                        <button 
                            onClick={() => navigate('/scan-barcode', { state: { goal: selectedGoal } })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-[#14AE5C] rounded-[10px] flex justify-center items-center text-white text-lg hover:bg-[#0f8b48] transition-colors"
                        >
                            <Icon icon="mdi:barcode-scan" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 hide-scrollbar">
                    
                    <h3 className="text-[15px] font-bold text-black mb-3">Riwayat</h3>
                    <div className="flex flex-col gap-3 mb-6">
                        {currentData.riwayat.map((item, index) => (
                            <div key={`riwayat-${index}`} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3`}>
                                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{item.name}</span>
                                    <span className="text-[11px] font-medium text-gray-500">{item.qty}, {item.cals}</span>
                                </div>
                                <button 
                                    onClick={() => setActiveMealMenu(activeMealMenu === `riwayat-${index}` ? null : `riwayat-${index}`)} 
                                    className="w-[28px] h-[28px] rounded-full flex justify-center items-center border-2 border-[#14AE5C] text-[#14AE5C] text-lg hover:bg-[#F0FDF4] transition-colors relative z-10"
                                >
                                    <Icon icon="mdi:plus" />
                                </button>

                                {activeMealMenu === `riwayat-${index}` && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMealMenu(null)}></div>
                                        <div className="absolute right-0 top-12 w-[160px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden flex flex-col">
                                            {['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM', 'CAMILAN'].map((meal) => (
                                                <div
                                                    key={meal}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMealMenu(null);
                                                        navigate('/diary', { state: { goal: selectedGoal } });
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
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[15px] font-bold text-black">Saran</h3>
                        <button onClick={handleRefresh} className="text-[#14AE5C] text-lg hover:rotate-180 transition-transform duration-300">
                            <Icon icon="mdi:refresh" />
                        </button>
                    </div>

                    <div className="w-full bg-[#F0FDF4]/50 rounded-[20px] p-4 shadow-sm border border-[#DCFCE7] mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <img src={robotImg} alt="AI Rekomendasi" className="w-[70px] h-[58px] object-contain flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                                <h4 className="text-[12px] font-bold text-[#14AE5C] mb-2">Rekomendasi Untuk Kamu</h4>
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    {shuffledRekomendasi.map((rek, index) => (
                                        <div key={`rek-${index}`} className={`flex items-center gap-1 px-3 py-1.5 ${rek.bg} rounded-lg border ${rek.border} flex-shrink-0`}>
                                            <Icon icon={rek.icon} className={`${rek.color} text-lg`} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-black leading-none">{rek.name}</span>
                                                <span className="text-[9px] font-medium text-gray-500">{rek.cals}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pb-6">
                        {shuffledSaran.map((item, index) => (
                            <div key={`saran-${index}`} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3`}>
                                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{item.name}</span>
                                    <span className="text-[11px] font-medium text-gray-500">{item.qty}, {item.cals}</span>
                                </div>
                                <button 
                                    onClick={() => setActiveMealMenu(activeMealMenu === `saran-${index}` ? null : `saran-${index}`)} 
                                    className="w-[28px] h-[28px] rounded-full flex justify-center items-center border-2 border-[#14AE5C] text-[#14AE5C] text-lg hover:bg-[#F0FDF4] transition-colors relative z-10"
                                >
                                    <Icon icon="mdi:plus" />
                                </button>

                                {activeMealMenu === `saran-${index}` && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMealMenu(null)}></div>
                                        <div className="absolute right-0 top-12 w-[160px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden flex flex-col">
                                            {['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM', 'CAMILAN'].map((meal) => (
                                                <div
                                                    key={meal}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMealMenu(null);
                                                        navigate('/diary', { state: { goal: selectedGoal } });
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BarcodeScannerScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-black relative flex flex-col items-center overflow-hidden pb-8'>
                
                <div className="w-full pt-12 px-6 flex justify-between items-center z-10 text-white flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="w-[40px] h-[40px] bg-white/20 rounded-full flex justify-center items-center text-xl backdrop-blur-sm">
                        <Icon icon="mdi:close" />
                    </button>
                    <button className="w-[40px] h-[40px] bg-white/20 rounded-full flex justify-center items-center text-xl backdrop-blur-sm">
                        <Icon icon="mdi:flash" />
                    </button>
                </div>

                <div className="mt-10 text-center z-10 flex-shrink-0">
                    <p className="text-white text-[15px] font-bold tracking-wide">Arahkan kamera ke Barcode produk</p>
                </div>

                <div className="flex-1 w-full flex flex-col justify-center items-center gap-8 z-10 -mt-10">
                    <div className="relative w-[280px] h-[200px] flex justify-center items-center">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#14AE5C] rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#14AE5C] rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#14AE5C] rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#14AE5C] rounded-br-xl"></div>
                        
                        <div className="w-full h-full bg-white/5 backdrop-blur-[1px] flex justify-center items-center">
                            <Icon icon="mdi:barcode" className="text-white/40 text-8xl" />
                        </div>
                    </div>

                    <div className="bg-[#14AE5C] px-6 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(20,174,92,0.4)]">
                        <Icon icon="mdi:barcode-scan" className="text-white text-lg" />
                        <span className="text-white text-[14px] font-bold">Siap memindai...</span>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center gap-10 z-10 flex-shrink-0">
                    <div 
                        onClick={() => {
                            alert("Fitur pemindaian belum tersedia. Kamu akan diarahkan ke halaman penambahan makanan secara manual.");
                            navigate('/diary', { state: { goal: currentGoal } });
                        }}
                        className="w-[72px] h-[72px] rounded-full border-4 border-white flex justify-center items-center p-1 cursor-pointer"
                    >
                        <div className="w-full h-full bg-gray-500 rounded-full hover:bg-gray-400 transition-colors"></div>
                    </div>

                    <p className="text-white text-[13px] font-medium flex items-center gap-2">
                        Tidak terbaca ? 
                        <span 
                            onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} 
                            className="px-4 py-1.5 border border-[#14AE5C] rounded-full text-[#14AE5C] font-bold cursor-pointer hover:bg-[#14AE5C]/20 transition-colors"
                        >
                            Ketik Manual
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
};
const DiaryScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

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

    const diarySummary = {
        kalori: '750',
        protein: '80g',
        karbo: '160g',
        lemak: '70g'
    };

    const meals = [
        { id: 'sarapan', title: 'SARAPAN', totalCals: '360 kkal', foods: [{ name: 'Telur Rebus', qty: '100g, 140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Nasi Putih', qty: '150g, 220 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }] },
        { id: 'makansiang', title: 'MAKAN SIANG', totalCals: '265 kkal', foods: [{ name: 'Dada Ayam Panggang', qty: '100g, 165 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Nasi Putih', qty: '100g, 100 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }] },
        { id: 'makanmalam', title: 'MAKAN MALAM', totalCals: '', foods: [] },
        { id: 'camilan', title: 'CAMILAN', totalCals: '', foods: [] }
    ];

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-gray-50 shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-12 px-6 flex justify-between items-center pb-4 z-10 flex-shrink-0">
                    <button onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="text-2xl text-black font-bold">
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
                                <span className="text-[16px] font-bold text-black leading-tight">{diarySummary.kalori}</span>
                                <span className="text-[10px] font-bold text-black mt-1">Total Kalori</span>
                            </div>
                            <div className="flex-1 bg-[#FFF5EB] rounded-xl py-3 flex flex-col items-center justify-center border border-[#FFE4C4] shadow-sm">
                                <span className="text-[16px] font-bold text-[#F97316] leading-tight">{diarySummary.protein}</span>
                                <span className="text-[10px] font-bold text-[#F97316] mt-1">Protein</span>
                            </div>
                            <div className="flex-1 bg-[#F0F5FF] rounded-xl py-3 flex flex-col items-center justify-center border border-[#Dbeafe] shadow-sm">
                                <span className="text-[16px] font-bold text-[#3B82F6] leading-tight">{diarySummary.karbo}</span>
                                <span className="text-[10px] font-bold text-[#3B82F6] mt-1">Karbohidrat</span>
                            </div>
                            <div className="flex-1 bg-[#F5F3FF] rounded-xl py-3 flex flex-col items-center justify-center border border-[#ede9fe] shadow-sm">
                                <span className="text-[16px] font-bold text-[#8B5CF6] leading-tight">{diarySummary.lemak}</span>
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
                                                {meal.foods.map((food, idx) => (
                                                    <div key={idx} className="flex items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                        <div className={`w-[40px] h-[40px] ${food.bg} rounded-full flex justify-center items-center mr-4`}>
                                                            <Icon icon={food.icon} className={`text-[22px] ${food.color}`} />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-[14px] font-bold text-black">{food.name}</span>
                                                            <span className="text-[12px] font-medium text-gray-500">{food.qty}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-4 flex justify-center items-center">
                                                <span className="text-[13px] font-medium text-gray-500">Belum ada makanan</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} 
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
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50">
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
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProgressScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

    const [showTimeRange, setShowTimeRange] = useState(false);
    const [timeRange, setTimeRange] = useState('7 Hari Terakhir');
    const timeRanges = ['7 Hari Terakhir', '14 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini'];

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const calendarGrid = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

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
                                <span className="text-[28px] font-bold text-black leading-none">62.4</span>
                                <span className="text-[14px] font-bold text-black">kg</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#14AE5C]">
                                <Icon icon="mdi:menu-down" className="text-xl" />
                                <span className="text-[12px] font-bold">0,6 kg dari minggu lalu</span>
                            </div>
                        </div>

                        <div className="w-full h-[160px] relative mt-6">
                            <div className="absolute inset-0 flex flex-col justify-between pb-6">
                                {[64, 63, 62, 61].map((val) => (
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
                                    <path d="M 0 10 Q 50 20, 100 50 T 200 80 T 280 85 V 110 H 0 Z" fill="url(#progress-grad)" />
                                    <path d="M 0 10 Q 50 20, 100 50 T 200 80 T 280 85" fill="none" stroke="#14AE5C" strokeWidth="2.5" />
                                    <line x1="280" y1="85" x2="280" y2="110" stroke="#14AE5C" strokeWidth="1" strokeDasharray="3 3" />
                                </svg>
                                <div className="absolute top-[64%] right-[-10px] bg-[#14AE5C] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                                    62,4
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-7 right-0 flex justify-between text-[9px] font-semibold text-gray-400">
                                <span>21/5</span><span>22/5</span><span>23/5</span><span>24/5</span><span>25/5</span><span>26/5</span><span>27/5</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 mb-6">
                        <h3 className="text-[12px] font-bold text-black tracking-wider mb-3">KONSISTENSI</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Icon icon="twemoji:fire" className="text-2xl" />
                            <span className="text-[20px] font-bold text-black">7</span>
                            <span className="text-[12px] font-medium text-gray-500">hari berturut-turut</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                    <div className="w-[30px] h-[30px] rounded-full bg-[#E8F5EE] flex justify-center items-center text-[#14AE5C]">
                                        <Icon icon="mdi:check-bold" className="text-[16px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h3 className="text-[13px] font-bold text-black tracking-wider mb-4 px-1">RINGKASAN MINGGU INI</h3>

                    <div className="grid grid-cols-2 gap-3 pb-4">
                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Rata-rata Kalori</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">1.450</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">dari target 1.500</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Kalori Tertinggi</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">1.780</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">Sabtu</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Kalori Terendah</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">1.220</span>
                                <span className="text-[11px] font-semibold text-gray-600">kkal</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">Rabu</p>
                        </div>

                        <div className="bg-[#F4FBF7] rounded-[20px] p-4 border border-[#E8F5EE]">
                            <p className="text-[12px] font-medium text-black mb-1">Rata-rata Protein</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-bold text-black">82</span>
                                <span className="text-[11px] font-semibold text-gray-600">g</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">dari target 100g</p>
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
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
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
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' || currentPath === '/' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InsightScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [expandedNutrient, setExpandedNutrient] = useState(null);

    const [displayedEval, setDisplayedEval] = useState("");
    const [foodOptionIndex, setFoodOptionIndex] = useState(0);

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
        let i = 0;
        setDisplayedEval("");
        const typingInterval = setInterval(() => {
            if (i < currentData.fullEvalDesc.length) {
                setDisplayedEval((prev) => prev + currentData.fullEvalDesc.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30);
        return () => clearInterval(typingInterval);
    }, [currentGoal, currentDate]);

    const handleRefreshFood = () => {
        setFoodOptionIndex((prev) => (prev + 1) % currentData.aiRecommendations.length);
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

                    <div className="bg-[#E8F5EE] rounded-[24px] p-5 mb-6 flex items-center gap-4 relative border border-[#DCFCE7]">
                        <img src={robotImg} className="w-[80px] h-[80px] object-contain" alt="AI" />
                        <div>
                            <h3 className="text-[14px] font-bold text-black">{currentData.evalTitle}</h3>
                            <p className="text-[11px] font-medium text-gray-600 mt-1 leading-relaxed min-h-[32px]">
                                {displayedEval}
                                <span className="animate-pulse">|</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 mb-6">
                        <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-2">RINGKASAN</h3>
                        <div className="flex flex-col">
                            {currentData.nutrients.map((item, idx) => (
                                <div key={item.id} className={`flex flex-col py-3 ${idx !== currentData.nutrients.length - 1 ? 'border-b border-gray-100' : ''}`}>
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
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-[#14AE5C] leading-relaxed">
                                    {currentData.aiRecommendations[foodOptionIndex].title}
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 mt-1 leading-relaxed pr-2">
                                    {currentData.aiRecommendations[foodOptionIndex].desc}
                                </p>
                            </div>
                            <div className="w-[80px] h-[60px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img 
                                    src={currentData.aiRecommendations[foodOptionIndex].img} 
                                    className="w-full h-full object-cover" 
                                    alt="food" 
                                />
                            </div>
                        </div>
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
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
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
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);

    const handleEditClick = () => {
        alert("Fitur Edit Profil akan segera tersedia pada pembaruan berikutnya!");
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-[#F8FAFC] shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-14 px-6 pb-2 flex items-center z-10 flex-shrink-0">
                    <h2 className="text-[24px] font-bold text-black tracking-wide">Profil</h2>
                </div>

                <div className="flex-1 overflow-y-auto pb-[120px] hide-scrollbar px-6 pt-2">
                    
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-8 flex items-center gap-4">
                        <div className="relative w-[64px] h-[64px] flex-shrink-0">
                            <img src={profileImg} className="w-full h-full object-cover rounded-full" alt="Profile" />
                            <div 
                                onClick={handleEditClick}
                                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 flex justify-center items-center text-gray-500 hover:text-[#14AE5C] transition-colors"
                            >
                                <Icon icon="mdi:camera-outline" className="text-[14px]" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[16px] font-bold text-black">Wulan Permata</h3>
                            <p className="text-[12px] font-medium text-gray-500 mt-0.5">wulan.permata@email.com</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">GOAL & TARGET</h3>
                        <span onClick={handleEditClick} className="text-[11px] font-bold text-[#14AE5C] cursor-pointer hover:opacity-70">Edit</span>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex justify-center items-center text-[#14AE5C]">
                                <Icon icon="mdi:target" className="text-2xl" />
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-black">Lose Weight</p>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Defisit 500 kkal/hari</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="border-r border-gray-100 pr-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Berat</p>
                                <p className="text-[15px] font-bold text-black">55.0 kg</p>
                                <p className="text-[9px] font-bold text-[#14AE5C] mt-0.5">(-7.4 kg lagi)</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Tanggal</p>
                                <p className="text-[15px] font-bold text-black">30 Agustus 2025</p>
                            </div>
                            <div className="col-span-2 border-t border-gray-100 my-0.5"></div>
                            <div className="border-r border-gray-100 pr-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">TDEE (Perkiraan)</p>
                                <p className="text-[15px] font-bold text-black">2.000 kkal</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Harian</p>
                                <p className="text-[15px] font-bold text-black">1.500 kkal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">DATA TUBUH</h3>
                        <span onClick={handleEditClick} className="text-[11px] font-bold text-[#14AE5C] cursor-pointer hover:opacity-70">Edit</span>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Tanggal Lahir</span>
                            <span className="text-[12px] font-bold text-black">12 Jan 2001</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Tinggi Badan</span>
                            <span className="text-[12px] font-bold text-black">160 cm</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Berat Badan Saat Ini</span>
                            <span className="text-[12px] font-bold text-black">62.4 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Aktivitas</span>
                            <span className="text-[12px] font-bold text-black">Sedang (2-3x/minggu)</span>
                        </div>
                    </div>

                    <div className="mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">PREFERENSI</h3>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 flex flex-col gap-6">
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:bell-outline" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Notifikasi</span>
                            </div>
                            <div 
                                onClick={() => setIsNotifEnabled(!isNotifEnabled)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isNotifEnabled ? 'bg-[#14AE5C]' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isNotifEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:weight" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Satuan</span>
                            </div>
                            <span className="text-[12px] font-bold text-gray-400">kg, cm, kkal</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:earth" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Bahasa</span>
                            </div>
                            <span className="text-[12px] font-bold text-gray-400">Indonesia</span>
                        </div>

                    </div>

                    <button 
                        onClick={() => navigate('/welcome')}
                        className="w-full py-4 text-[#F43F5E] font-bold text-[14px] bg-red-50 rounded-2xl mb-8"
                    >
                        Keluar Akun
                    </button>
                </div>

                {isActionMenuOpen && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex flex-col justify-end items-center pb-[120px]" onClick={() => setIsActionMenuOpen(false)}>
                        <button onClick={() => setIsActionMenuOpen(false)} className="absolute top-10 left-6 text-white text-3xl hover:scale-110 transition-transform"><Icon icon="mdi:close" /></button>
                        <div className="w-[350px] flex justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
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
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/sasaran" element={<GoalSelection />} />
                <Route path="/motivasi" element={<MotivationScreen />} />
                <Route path="/datadiri" element={<PersonalDataScreen />} />
                <Route path="/aktivitas" element={<ActivityScreen />} />
                <Route path="/kebiasaan" element={<HabitsScreen />} />
                <Route path="/daftar" element={<RegisterScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/lupa-sandi" element={<ForgotPasswordScreen />} />
                <Route path="/otp" element={<OtpScreen />} />
                <Route path="/reset-sandi" element={<ResetPasswordScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/cari-makanan" element={<FoodSearchScreen />} />
                <Route path="/scan-barcode" element={<BarcodeScannerScreen />} />
                <Route path="/diary" element={<DiaryScreen />} />
                <Route path="/progress" element={<ProgressScreen />} />
                <Route path="/insight" element={<InsightScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
        </Router>
    );
}

export default App;