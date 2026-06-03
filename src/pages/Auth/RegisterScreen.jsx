import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../../components/ui/Button';
import confettiImg from '../../assets/images/confetti.png';
import { getProfileDraft, goalMap, normalizeGoal, saveUserProfile } from '../../utils/userProfileStorage';
import { upsertWeightLog } from '../../utils/weightLogStorage';
import { loginWithGoogle } from '../../services/auth';
import { API_BASE_URL } from '../../services/api';

const RegisterScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const profileDraft = location.state?.profile || getProfileDraft();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isComplete = email && password;
    const messageData = {
        turunkan: 'Kamu baru saja mengambil langkah besar untuk mencapai target berat badan idealmu.',
        tambah: 'Kamu baru saja mengambil langkah besar untuk mencapai target berat badan impianmu.',
        jaga: 'Kamu baru saja mengambil langkah besar untuk menjaga konsistensi berat badanmu.'
    };

    const saveAuthenticatedUser = (data, fallbackEmail = email) => {
        const userProfile = { ...profileDraft, goal: selectedGoal };
        const userEmail = data.user?.email || fallbackEmail;

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', userEmail);
        saveUserProfile(userEmail, {
            ...userProfile,
            goal: normalizeGoal(data.user?.goal || selectedGoal),
            age: data.user?.age ?? userProfile.age,
            gender: data.user?.gender ?? userProfile.gender,
            height: data.user?.height ?? userProfile.height,
            currentWeight: data.user?.currentWeight ?? userProfile.currentWeight,
            targetWeight: data.user?.targetWeight ?? userProfile.targetWeight,
            activity: data.user?.activity ?? userProfile.activity,
            habits: data.user?.habits || userProfile.habits || []
        });
        if (data.user?.currentWeight || userProfile.currentWeight) {
            upsertWeightLog(userEmail, Number(data.user?.currentWeight || userProfile.currentWeight));
        }

        navigate('/dashboard', { state: { email: userEmail, goal: normalizeGoal(data.user?.goal || selectedGoal) } });
    };

    const handleRegister = async () => {
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            alert("Pendaftaran hanya diizinkan menggunakan email @gmail.com");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (password.length < 8 || !passwordRegex.test(password)) {
            alert("Validasi Gagal: Kata sandi harus memiliki panjang minimal 8 karakter dan mengandung setidaknya 1 huruf besar, 1 huruf kecil, serta 1 angka!");
            return;
        }

        if (isComplete) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: email.split('@')[0].length >= 3 ? email.split('@')[0] : 'User',
                        email,
                        password,
                        profile: { ...profileDraft, goal: goalMap[selectedGoal] || selectedGoal }
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Registrasi gagal. Silakan coba lagi.");
                    return;
                }

                alert(data.message);
                saveAuthenticatedUser(data);
            } catch (error) {
                alert("Gagal terhubung ke server. Pastikan koneksi backend tersedia.");
                console.error(error);
            }
        }
    };

    const handleGoogleRegisterSuccess = async (credentialResponse) => {
        try {
            const data = await loginWithGoogle({
                credential: credentialResponse.credential,
                profile: { ...profileDraft, goal: goalMap[selectedGoal] || selectedGoal }
            });

            alert(data.message || 'Registrasi Google berhasil!');
            saveAuthenticatedUser(data, data.user?.email);
        } catch (error) {
            alert(error.message || 'Registrasi dengan Google gagal. Pastikan backend berjalan dan GOOGLE_CLIENT_ID sudah benar.');
            console.error(error);
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={confettiImg} alt="Sukses" className="w-full max-w-[240px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Langkah Terakhir!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Buat akun untuk mengamankan seluruh profil kesehatan, sasaran kalori, dan catatan harian yang telah disesuaikan.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '100%' : '90%' }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-[#14AE5C]">{isComplete ? '100 %' : '90 %'}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pt-4">
                        <div className="flex flex-col items-center">
                            <img src={confettiImg} alt="Sukses" className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] object-contain md:hidden" />
                            <h2 className="text-[28px] md:text-[32px] font-extrabold text-gray-800 text-center mt-4 md:mt-0">Hebat!</h2>
                            <p className="text-[14px] md:text-[15px] font-medium text-gray-500 text-center mt-2 px-2 leading-relaxed">{messageData[selectedGoal]}</p>
                        </div>

                        <div className="flex flex-col gap-4 mt-6 md:mt-8">
                            <div className="flex flex-col gap-2 items-center">
                                <p className="text-[12px] font-bold text-gray-500">Daftar cepat dengan</p>
                                <GoogleLogin
                                    onSuccess={handleGoogleRegisterSuccess}
                                    onError={() => {
                                        alert('Registrasi Google gagal');
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-px bg-gray-100 flex-1"></div>
                                <span className="text-[11px] font-bold text-gray-400">atau daftar manual</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[14px] font-bold text-gray-700">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" placeholder="nama@gmail.com" />
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[14px] font-bold text-gray-700">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] pl-5 pr-12 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" placeholder="Minimal 8 karakter" />
                                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl hover:text-gray-600 transition-colors">
                                        <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center w-full gap-4 flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={() => isComplete && handleRegister()} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Daftar
                        </Button>
                        <p className="text-[14px] font-bold text-gray-500">
                            Sudah punya akun? <span className="text-[#14AE5C] cursor-pointer hover:underline" onClick={() => navigate('/login', { state: { goal: selectedGoal } })}>Masuk</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
