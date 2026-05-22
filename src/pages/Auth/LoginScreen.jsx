import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { clearFoodLogs } from '../../utils/foodLogStorage';

const LoginScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isComplete = email && password;

    const handleLogin = async () => {
        if (!isComplete) return;

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login gagal.");
                return;
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            clearFoodLogs(data.user.email);
            navigate('/dashboard', { state: { goal: selectedGoal, email: data.user.email } });
        } catch (error) {
            alert("Gagal terhubung ke server. Pastikan backend berjalan di port 5000.");
            console.error(error);
        }
    };

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
                    <Button onClick={handleLogin} className={`w-full h-[54px] text-[16px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Masuk</Button>
                    <p className="text-center text-[14px] font-semibold text-[#14AE5C] cursor-pointer mt-2" onClick={() => navigate('/lupa-sandi')}>Lupa kata sandi?</p>
                </div>
                <div className="mt-auto flex justify-center">
                    <p className="text-[14px] font-semibold text-gray-600">Belum punya akun? <span className="text-[#14AE5C] cursor-pointer" onClick={() => navigate('/welcome')}>Daftar Baru</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
