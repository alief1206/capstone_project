import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import confettiImg from '../../assets/images/confetti.png';

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
        jaga: 'Kamu baru saja mengambil langkah besar untuk menjaga konsistensi berat badanmu.'
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Validasi Front-End untuk Email Google
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            alert("Peringatan: Silakan gunakan akun @gmail.com untuk mendaftar.");
            return; // Menghentikan proses pengiriman ke Back-End
        }

        try {
            navigate('/login', { state: { goal: selectedGoal } });
        } catch (error) {
            console.error(error);
        }
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
                    <Button onClick={(e) => isComplete && handleRegisterSubmit(e)} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>Daftar</Button>
                    <p className="text-[14px] font-semibold text-gray-600">Sudah punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/login', { state: { goal: selectedGoal } })}>Masuk</span></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
