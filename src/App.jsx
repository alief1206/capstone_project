import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import Button from './components/ui/Button';

import mascotImage from './assets/images/mascot.png';
import logoIcon from './assets/icons/logo-icon.png';
import chartTurunkan from './assets/images/chart-turunkan.png';
import chartJaga from './assets/images/chart-jaga.png';
import chartTambah from './assets/images/chart-tambah.png';
import chartOtot from './assets/images/chart-otot.png';
import confettiImg from './assets/images/confetti.png';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] min-h-screen bg-white shadow-xl relative flex flex-col items-center pt-12 pb-10 px-4 overflow-hidden'>
                <header className="flex items-center gap-1 mt-2">
                    <img src={logoIcon} alt="Logo" className="w-[80px] h-[70px] object-contain" />
                    <h1 className="-ml-3 text-[32px] font-bold text-[#14AE5C]">EatSistent</h1>
                </header>

                <img 
                    src={mascotImage} 
                    alt="Mascot EatSistent" 
                    className="w-[350px] h-[250px] object-contain mt-10 mb-8" 
                />

                <div className="text-center mt-2">
                    <h2 className="text-[24px] font-bold text-black">
                        Selamat Datang!
                    </h2>
                    <p className="text-[16px] font-medium text-black mt-3 px-6 leading-relaxed">
                        Mari kita sesuaikan EatSistent <br/> dengan sasaranmu.
                    </p>
                </div>

                <footer className="mt-auto w-full flex flex-col items-center">
                    <Button onClick={() => navigate('/sasaran')}>
                        Lanjutkan
                    </Button>

                    <div className="w-[358px] flex items-center gap-4 my-5 text-black font-semibold">
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                        <span className="text-[12px] tracking-wide">ATAU</span>
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                    </div>

                    <Button variant="outline" onClick={() => navigate('/login')}>
                        Masuk
                    </Button>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/welcome')} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out"
                                style={{ width: selectedGoal ? '20%' : '0%' }}
                            ></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">
                            {selectedGoal ? '20 %' : '0 %'}
                        </span>
                    </div>
                </div>

                <div className="mt-8 mb-6">
                    <h2 className="text-[24px] font-bold text-black">Halo, Sobat Sehat</h2>
                    <p className="text-[15px] font-medium text-gray-500 mt-2">Mari mulai dari sasaranmu.</p>
                </div>

                <div className="flex flex-col gap-3">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            onClick={() => setSelectedGoal(goal.id)}
                            className={`w-full h-[76px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer ${
                                selectedGoal === goal.id 
                                ? 'border-[#14AE5C] bg-[#F0FDF4]' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="w-[44px] h-[44px] flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm mr-4">
                                <Icon icon={goal.icon} className="w-6 h-6" style={{ color: goal.color }} />
                            </div>
                            <span className={`text-[15px] font-semibold ${selectedGoal === goal.id ? 'text-black' : 'text-gray-700'}`}>
                                {goal.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex justify-center w-full">
                    <Button 
                        onClick={() => selectedGoal && navigate('/motivasi', { state: { goal: selectedGoal } })}
                        className={!selectedGoal ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MotivationScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan'; 

    const contentData = {
        turunkan: {
            title: 'Menurunkan Berat Badan Tidak Selalu Mudah',
            desc: 'Tetapi kami akan memotivasi Anda melewati segala kesulitannya.',
            chart: chartTurunkan
        },
        jaga: {
            title: 'Menjaga berat badan ideal adalah bentuk konsistensi.',
            desc: 'Pertahankan pola sehatmu untuk hidup berkualitas setiap hari.',
            chart: chartJaga
        },
        tambah: {
            title: 'Menambah berat badan sehat butuh strategi dan konsistensi.',
            desc: 'Kami akan membantu Anda mencapai berat ideal dengan cara yang sehat.',
            chart: chartTambah
        },
        otot: {
            title: 'Otot dibangun dari latihan, nutrisi, dan disiplin.',
            desc: 'Kami akan memandu setiap langkah mu menuju tubuh yang lebih kuat.',
            chart: chartOtot
        }
    };

    const currentContent = contentData[selectedGoal];

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/sasaran')} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out"
                                style={{ width: '35%' }}
                            ></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">35 %</span>
                    </div>
                </div>

                <div className="mt-8 mb-6 opacity-0 animate-fadeSlideUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-[26px] font-bold text-black leading-snug">
                        {currentContent.title}
                    </h2>
                </div>

                <div className="flex justify-center mb-8 opacity-0 animate-fadeSlideUp" style={{ animationDelay: '0.3s' }}>
                    <img 
                        src={currentContent.chart} 
                        alt="Grafik Motivasi" 
                        className="w-full h-auto object-contain rounded-2xl shadow-sm border border-gray-100" 
                    />
                </div>

                <p className="text-[20px] font-medium text-gray-700 leading-relaxed px-1 opacity-0 animate-fadeSlideUp" style={{ animationDelay: '0.5s' }}>
                    {currentContent.desc}
                </p>

                <div className="mt-auto flex justify-center w-full">
                    <Button onClick={() => navigate('/datadiri', { state: { goal: selectedGoal } })}>
                        Berikutnya
                    </Button>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" 
                                 style={{ width: isComplete ? '50%' : '35%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '50 %' : '35 %'}</span>
                    </div>
                </div>

                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">
                        Beri tahu kami sedikit tentang diri Anda.
                    </h2>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto pb-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Jenis Kelamin</label>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setGender('pria')}
                                className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'pria' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}
                            >
                                <Icon icon="mdi:gender-male" className="text-xl" /> Pria
                            </button>
                            <button 
                                onClick={() => setGender('wanita')}
                                className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'wanita' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}
                            >
                                <Icon icon="mdi:gender-female" className="text-xl" /> Wanita
                            </button>
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
                    <Button onClick={() => isComplete && navigate('/aktivitas', { state: { goal: selectedGoal } })} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>
                        Berikutnya
                    </Button>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" 
                                 style={{ width: selectedActivity ? '70%' : '50%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{selectedActivity ? '70 %' : '50 %'}</span>
                    </div>
                </div>

                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">
                        Seberapa aktif Anda setiap hari?
                    </h2>
                </div>

                <div className="flex flex-col gap-3">
                    {activities.map((act) => (
                        <div
                            key={act.id}
                            onClick={() => setSelectedActivity(act.id)}
                            className={`w-full h-[80px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer ${
                                selectedActivity === act.id 
                                ? 'border-[#14AE5C] bg-[#F0FDF4]' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="w-[50px] flex items-center justify-center mr-2">
                                <Icon icon={act.icon} className={`text-4xl ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[15px] font-bold ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`}>
                                    {act.title}
                                </span>
                                <span className="text-[12px] font-medium text-gray-500">
                                    {act.desc}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex justify-center w-full">
                    <Button onClick={() => selectedActivity && navigate('/kebiasaan', { state: { goal: selectedGoal } })} className={!selectedActivity ? 'opacity-50 cursor-not-allowed' : ''}>
                        Berikutnya
                    </Button>
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
        if (selectedHabits.includes(habit)) {
            setSelectedHabits(selectedHabits.filter(h => h !== habit));
        } else {
            setSelectedHabits([...selectedHabits, habit]);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" 
                                 style={{ width: isComplete ? '90%' : '70%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '90 %' : '70 %'}</span>
                    </div>
                </div>

                <div className="mt-8 mb-4">
                    <h2 className="text-[26px] font-bold text-black leading-snug">
                        Kebiasaan mana yang paling penting bagi Anda?
                    </h2>
                    <p className="text-[14px] font-medium text-gray-500 mt-2">Pilih minimal 3 kebiasaan.</p>
                </div>

                <div className="flex flex-wrap content-start gap-3 mt-2 overflow-y-auto max-h-[350px] pb-4">
                    {habitsList.map((habit) => (
                        <button
                            key={habit}
                            onClick={() => toggleHabit(habit)}
                            className={`px-5 py-3 rounded-full border-[1.5px] font-semibold text-[14px] transition-all ${
                                selectedHabits.includes(habit)
                                ? 'border-[#14AE5C] text-[#14AE5C] bg-[#F0FDF4]'
                                : 'border-gray-200 text-gray-600 bg-white'
                            }`}
                        >
                            {habit}
                        </button>
                    ))}
                </div>

                <div className="mt-auto mb-6 w-full bg-[#F0FDF4] rounded-[16px] p-4 flex items-start gap-4 border border-[#E8F5EE]">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center flex-shrink-0 shadow-sm">
                        <Icon icon="mdi:lightbulb-on-outline" className="text-xl text-[#14AE5C]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-black">Tahukah Anda?</span>
                        <span className="text-[12px] font-medium text-gray-600 leading-relaxed mt-1">
                            Anda bisa menginput makanan melalui Teks atau Barcode nanti di Dashboard.
                        </span>
                    </div>
                </div>

                <div className="flex justify-center w-full">
                    <Button onClick={() => isComplete && navigate('/daftar', { state: { goal: selectedGoal } })} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>
                        Berikutnya
                    </Button>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-4'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" 
                                 style={{ width: isComplete ? '100%' : '90%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-[#14AE5C]">{isComplete ? '100 %' : '90 %'}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-10">
                    <img src={confettiImg} alt="Sukses" className="w-[180px] h-[180px] object-contain" />
                    <h2 className="text-[28px] font-bold text-black mt-4">Hebat!</h2>
                    <p className="text-[15px] font-medium text-black text-center mt-2 px-4 leading-relaxed">
                        {messageData[selectedGoal]}
                    </p>
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
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex flex-col items-center w-full gap-4 pt-6">
                    <Button onClick={() => isComplete && navigate('/login')} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>
                        Daftar
                    </Button>
                    <p className="text-[14px] font-semibold text-gray-600">
                        Sudah punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/login')}>Masuk</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const LoginScreen = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isComplete = email && password;

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-16 pb-10 px-6'>
                <h2 className="text-[32px] font-bold text-center text-black mb-12">LogIn</h2>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" 
                            placeholder="nama@gmail.com" 
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-4 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" 
                                placeholder="Minimal 8 karakter" 
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    <Button 
                        onClick={() => alert('Berhasil Masuk ke Dashboard!')} 
                        className={`w-full h-[54px] text-[16px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Masuk
                    </Button>
                    <p 
                        className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer mt-2"
                        onClick={() => navigate('/lupa-sandi')}
                    >
                        Lupa kata sandi?
                    </p>
                </div>
                
                <div className="mt-auto flex justify-center">
                    <p className="text-[14px] font-semibold text-gray-600">
                        Belum punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/welcome')}>Daftar Baru</span>
                    </p>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-6'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8">
                    <Icon icon="mdi:arrow-left" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-8">
                        <img src={logoIcon} alt="Logo" className="w-[60px] h-[55px] object-contain" />
                        <h1 className="text-[30px] font-bold text-[#14AE5C]">EatSistent</h1>
                    </div>
                    
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:email-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center">
                            <Icon icon="mdi:check" className="text-white text-md" />
                        </div>
                    </div>

                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Lupa Kata Sandi?</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center px-4 leading-relaxed mb-8">
                        Masukkan email yang terdaftar untuk menerima kode verifikasi.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-gray-700">Email</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                            <Icon icon="mdi:email-outline" />
                        </div>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-12 pr-4 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" 
                            placeholder="nama@email.com" 
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto">
                    <Button 
                        onClick={() => email && navigate('/otp')} 
                        className={`w-full h-[54px] ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Kirim Kode
                    </Button>
                    <p 
                        className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer"
                        onClick={() => navigate('/login')}
                    >
                        Kembali ke Masuk
                    </p>
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

        if (value && index < 3) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-6'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8">
                    <Icon icon="mdi:arrow-left" />
                </button>

                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">1</div>
                        <span className="text-xs font-semibold text-gray-500">Email</span>
                    </div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">2</div>
                        <span className="text-xs font-semibold text-[#14AE5C]">Verifikasi</span>
                    </div>
                    <div className="h-[2px] w-12 bg-gray-200"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex justify-center items-center font-bold text-sm">3</div>
                        <span className="text-xs font-semibold text-gray-400">Sandi Baru</span>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:shield-lock-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center">
                            <Icon icon="mdi:check" className="text-white text-md" />
                        </div>
                    </div>

                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Masukkan Kode Verifikasi</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed mb-8">
                        Kami telah mengirimkan kode 4 digit ke <br/> <span className="font-bold text-[#14AE5C]">wulan@email.com</span>
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputs.current[index] = el)}
                            className={`w-[60px] h-[60px] rounded-xl border-2 text-center text-[24px] font-bold outline-none transition-all ${digit ? 'border-[#14AE5C] text-black' : 'border-gray-200 text-gray-400 focus:border-[#14AE5C]'}`}
                        />
                    ))}
                </div>

                <p className="text-center text-[14px] font-medium text-gray-500">
                    Tidak menerima kode? <br/> <span className="font-semibold text-[#14AE5C] cursor-pointer mt-1 block">Kirim Ulang (00:45)</span>
                </p>

                <div className="flex flex-col gap-6 mt-auto">
                    <Button 
                        onClick={() => isComplete && navigate('/reset-sandi')} 
                        className={`w-full h-[54px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Verifikasi
                    </Button>
                    <p 
                        className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer"
                        onClick={() => navigate('/lupa-sandi')}
                    >
                        Ubah Email
                    </p>
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
            <div className='w-[390px] min-h-screen bg-white shadow-xl flex flex-col pt-12 pb-10 px-6'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8">
                    <Icon icon="mdi:arrow-left" />
                </button>

                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div>
                        <span className="text-xs font-semibold text-gray-500">Email</span>
                    </div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div>
                        <span className="text-xs font-semibold text-gray-500">Verifikasi</span>
                    </div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">3</div>
                        <span className="text-xs font-semibold text-[#14AE5C]">Sandi Baru</span>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:lock-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center">
                            <Icon icon="mdi:check" className="text-white text-md" />
                        </div>
                    </div>

                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Buat Kata Sandi Baru</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed mb-8">
                        Gunakan kata sandi yang kuat untuk menjaga akunmu tetap aman.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Kata Sandi Baru</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl">
                                <Icon icon="mdi:lock-outline" />
                            </div>
                            <input 
                                type={showPassword1 ? "text" : "password"} 
                                value={pass1} 
                                onChange={(e) => setPass1(e.target.value)} 
                                className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-12 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" 
                                placeholder="••••••••" 
                            />
                            <button onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                <Icon icon={showPassword1 ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Ulangi Kata Sandi</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl">
                                <Icon icon="mdi:lock-outline" />
                            </div>
                            <input 
                                type={showPassword2 ? "text" : "password"} 
                                value={pass2} 
                                onChange={(e) => setPass2(e.target.value)} 
                                className={`w-full h-[54px] border-[1.5px] rounded-[12px] pl-12 pr-12 font-semibold outline-none transition-all text-[14px] ${pass2 && pass1 !== pass2 ? 'border-red-400' : 'border-gray-200 focus:border-[#14AE5C]'}`} 
                                placeholder="••••••••" 
                            />
                            <button onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                <Icon icon={showPassword2 ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto pt-6">
                    <Button 
                        onClick={() => isComplete && navigate('/login')} 
                        className={`w-full h-[54px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Simpan & Masuk
                    </Button>
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
            </Routes>
        </Router>
    );
}

export default App;