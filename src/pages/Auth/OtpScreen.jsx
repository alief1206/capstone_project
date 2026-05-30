import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { getProfileDraft, goalMap, saveUserProfile } from '../../utils/userProfileStorage';
import { upsertWeightLog } from '../../utils/weightLogStorage';
import mascotImage from '../../assets/images/mascot.png';

const OtpScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'email Anda';
    const selectedGoal = location.state?.goal || 'turunkan';
    const profileDraft = location.state?.profile || getProfileDraft();
    const mode = location.state?.mode || 'register';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);
    
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputs.current[index + 1].focus();
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1].focus();
    };
    
    const isComplete = otp.every(digit => digit !== '');

    const handleVerifyOtp = async () => {
        if (!isComplete) return;

        if (mode === 'reset') {
            navigate('/reset-sandi', { state: { email, token: otp.join('') } });
            return;
        }

        if (email === 'email Anda') {
            navigate('/reset-sandi', { state: { email, token: otp.join('') } });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp.join('') })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Verifikasi OTP gagal.");
                return;
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            const userProfile = { ...profileDraft, goal: selectedGoal };
            saveUserProfile(email, userProfile);
            
            if (userProfile.age && userProfile.height && userProfile.currentWeight && userProfile.targetWeight) {
                try {
                    await fetch('http://localhost:5000/api/v1/users/physical-update', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${data.token}`
                        },
                        body: JSON.stringify({
                            age: Number(userProfile.age),
                            height: Number(userProfile.height),
                            currentWeight: Number(userProfile.currentWeight),
                            targetWeight: Number(userProfile.targetWeight),
                            gender: userProfile.gender,
                            activity: userProfile.activity,
                            habits: userProfile.habits || [],
                            goal: goalMap[selectedGoal] || selectedGoal
                        })
                    });
                } catch (error) {
                    console.error(error);
                }
            }
            if (userProfile.currentWeight) upsertWeightLog(email, Number(userProfile.currentWeight));
            navigate('/dashboard', { state: { email, goal: selectedGoal } });
        } catch (error) {
            alert("Gagal terhubung ke server. Pastikan backend berjalan di port 5000.");
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
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Keamanan Terjamin!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Satu langkah lagi. Silakan masukkan kode OTP yang telah kami kirimkan untuk memverifikasi identitasmu.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-14 max-h-[100dvh] md:max-h-[680px]">
                    
                    <div className="flex flex-col flex-shrink-0 mb-4 md:mb-6">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-8 md:mb-10 px-2 flex-shrink-0">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm shadow-sm">1</div>
                            <span className="text-[11px] md:text-xs font-bold text-gray-500">Email</span>
                        </div>
                        <div className="h-[2px] w-10 md:w-12 bg-[#14AE5C]"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm shadow-sm border-[3px] border-[#E8F5EE]">2</div>
                            <span className="text-[11px] md:text-xs font-extrabold text-[#14AE5C]">Verifikasi</span>
                        </div>
                        <div className="h-[2px] w-10 md:w-12 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex justify-center items-center font-bold text-sm border border-gray-200">3</div>
                            <span className="text-[11px] md:text-xs font-bold text-gray-400">Sandi Baru</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center overflow-y-auto hide-scrollbar pb-4">
                        <div className="w-[85px] h-[85px] bg-[#F0FDF4] rounded-full flex justify-center items-center mb-6 relative border border-[#DCFCE7] shadow-sm">
                            <Icon icon="mdi:shield-lock-outline" className="text-[40px] text-[#14AE5C]" />
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#14AE5C] rounded-full border-[3px] border-white flex justify-center items-center">
                                <Icon icon="mdi:check" className="text-white text-sm" />
                            </div>
                        </div>
                        
                        <h2 className="text-[24px] md:text-[28px] font-extrabold text-gray-800 mb-3 text-center">Masukkan Kode Verifikasi</h2>
                        <p className="text-[14px] md:text-[15px] font-medium text-gray-500 text-center leading-relaxed mb-8 px-2 md:px-6">
                            Kami telah mengirimkan kode 6 digit ke <br/> 
                            <span className="font-extrabold text-[#14AE5C]">{email}</span>
                        </p>

                        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-8">
                            {otp.map((digit, index) => (
                                <input 
                                    key={index} 
                                    type="text" 
                                    maxLength="1" 
                                    value={digit} 
                                    onChange={(e) => handleChange(e, index)} 
                                    onKeyDown={(e) => handleKeyDown(e, index)} 
                                    ref={(el) => (inputs.current[index] = el)} 
                                    className={`w-[45px] h-[55px] sm:w-[50px] sm:h-[60px] md:w-[55px] md:h-[65px] rounded-[16px] border-[1.5px] text-center text-[24px] md:text-[28px] font-extrabold outline-none transition-all ${digit ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C] shadow-sm' : 'border-gray-200 text-gray-400 focus:border-[#14AE5C] focus:bg-[#F0FDF4] bg-white'}`} 
                                />
                            ))}
                        </div>
                        
                        <p className="text-center text-[13px] md:text-[14px] font-medium text-gray-500">
                            Tidak menerima kode? <br/> 
                            <span className="font-extrabold text-[#14AE5C] cursor-pointer mt-1.5 block hover:underline">Kirim Ulang (00:45)</span>
                        </p>
                    </div>

                    <div className="mt-4 flex flex-col w-full gap-4 flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={handleVerifyOtp} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Verifikasi
                        </Button>
                        <p className="text-center text-[14px] font-bold text-gray-500 mt-1">
                            Salah email? <span className="text-[#14AE5C] cursor-pointer hover:underline" onClick={() => navigate('/lupa-sandi')}>Ubah Email</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpScreen;
