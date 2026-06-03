import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../../components/ui/Button';
import { normalizeGoal, saveUserProfile } from '../../utils/userProfileStorage';
import { mergeWeightLogs, upsertWeightLog } from '../../utils/weightLogStorage';
import { fetchWeightTrend, loginWithEmail, loginWithGoogle } from '../../services/auth';
import { syncFoodLogs } from '../../services/meals';
import mascotImage from '../../assets/images/mascot.png';

const LoginScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isComplete = email && password;

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const data = await loginWithGoogle(credentialResponse.credential);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            saveUserProfile(data.user.email, {
                goal: normalizeGoal(data.user.goal || selectedGoal),
                age: data.user.age,
                gender: data.user.gender,
                height: data.user.height,
                currentWeight: data.user.currentWeight,
                targetWeight: data.user.targetWeight,
                activity: data.user.activity,
                habits: data.user.habits || []
            });
            if (data.user.currentWeight) upsertWeightLog(data.user.email, Number(data.user.currentWeight));
            try {
                await syncFoodLogs(data.user.email);
                const weightTrend = await fetchWeightTrend('monthly');
                mergeWeightLogs(data.user.email, weightTrend.data || []);
            } catch (error) {
                console.warn('Sinkronisasi data login gagal:', error.message);
            }
            navigate('/dashboard', { state: { goal: normalizeGoal(data.user.goal || selectedGoal), email: data.user.email } });
        } catch (error) {
            alert(error.message || "Google Login gagal. Pastikan backend berjalan dan GOOGLE_CLIENT_ID sudah benar.");
            console.error(error);
        }
    };

    const handleLogin = async () => {
        if (!isComplete) return;

        try {
            const data = await loginWithEmail({ email, password });

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            saveUserProfile(data.user.email, {
                goal: normalizeGoal(data.user.goal || selectedGoal),
                age: data.user.age,
                gender: data.user.gender,
                height: data.user.height,
                currentWeight: data.user.currentWeight,
                targetWeight: data.user.targetWeight,
                activity: data.user.activity,
                habits: data.user.habits || []
            });
            if (data.user.currentWeight) upsertWeightLog(data.user.email, Number(data.user.currentWeight));
            try {
                await syncFoodLogs(data.user.email);
                const weightTrend = await fetchWeightTrend('monthly');
                mergeWeightLogs(data.user.email, weightTrend.data || []);
            } catch (error) {
                console.warn('Sinkronisasi data login gagal:', error.message);
            }
            navigate('/dashboard', { state: { goal: normalizeGoal(data.user.goal || selectedGoal), email: data.user.email } });
        } catch (error) {
            alert(error.message || "Login gagal. Pastikan backend berjalan di port 5000.");
            console.error(error);
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Selamat Datang<br/>Kembali!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Lanjutkan perjalanan sehatmu dan pantau terus perkembangan target harian bersama EatSistent.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-12 md:pt-16 pb-10 px-6 md:px-14 max-h-[100dvh] md:max-h-[680px]">
                    
                    <div className="flex-shrink-0 mb-8 md:mb-10 flex flex-col items-center md:items-start">
                        <h2 className="text-[32px] md:text-[36px] font-extrabold text-gray-800 text-center md:text-left">Log In</h2>
                        <p className="text-[14px] md:text-[15px] font-medium text-gray-500 text-center md:text-left mt-2">Masuk untuk mengakses akun EatSistent kamu.</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" 
                                placeholder="nama@gmail.com" 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] pl-5 pr-12 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" 
                                    placeholder="Masukkan kata sandi" 
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl hover:text-gray-600 transition-colors"
                                >
                                    <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <p 
                                    className="text-[13px] font-bold text-[#14AE5C] cursor-pointer hover:underline transition-all" 
                                    onClick={() => navigate('/lupa-sandi')}
                                >
                                    Lupa kata sandi?
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2 items-center">
                            <p className="text-[12px] font-bold text-gray-500 mb-2">Atau masuk dengan</p>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    alert('Google Login Gagal');
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center w-full gap-4 flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={handleLogin} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Masuk
                        </Button>
                        <p className="text-[14px] font-bold text-gray-500 mt-2">
                            Belum punya akun? <span className="text-[#14AE5C] cursor-pointer hover:underline" onClick={() => navigate('/welcome')}>Daftar Baru</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
