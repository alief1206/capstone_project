import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import mascotImage from '../../assets/images/mascot.png';
import { API_BASE_URL } from '../../services/api';

const ResetPasswordScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const token = location.state?.token || '';
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const isComplete = pass1 && pass2 && pass1 === pass2;

    const handleResetPassword = async () => {
        if (!isComplete) return;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (pass1.length < 8 || !passwordRegex.test(pass1)) {
            alert("Validasi Gagal: Kata sandi harus memiliki panjang minimal 8 karakter dan mengandung setidaknya 1 huruf besar, 1 huruf kecil, serta 1 angka!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: pass1 })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Gagal mereset password.");
                return;
            }

            alert(data.message);
            navigate('/login');
        } catch (error) {
            alert("Gagal terhubung ke server. Pastikan koneksi backend tersedia.");
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
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Amankan Akunmu!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Pastikan kamu menggunakan kata sandi baru yang kuat agar data kesehatanmu di EatSistent selalu terlindungi.</p>
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
                            <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm shadow-sm"><Icon icon="mdi:check" className="text-lg" /></div>
                            <span className="text-[11px] md:text-xs font-bold text-gray-500">Email</span>
                        </div>
                        <div className="h-[2px] w-10 md:w-12 bg-[#14AE5C]"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm shadow-sm"><Icon icon="mdi:check" className="text-lg" /></div>
                            <span className="text-[11px] md:text-xs font-bold text-gray-500">Verifikasi</span>
                        </div>
                        <div className="h-[2px] w-10 md:w-12 bg-[#14AE5C]"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm shadow-sm border-[3px] border-[#E8F5EE]">3</div>
                            <span className="text-[11px] md:text-xs font-extrabold text-[#14AE5C]">Sandi Baru</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar pb-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-[85px] h-[85px] bg-[#F0FDF4] rounded-full flex justify-center items-center mb-6 relative border border-[#DCFCE7] shadow-sm">
                                <Icon icon="mdi:lock-outline" className="text-[40px] text-[#14AE5C]" />
                                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#14AE5C] rounded-full border-[3px] border-white flex justify-center items-center">
                                    <Icon icon="mdi:check" className="text-white text-sm" />
                                </div>
                            </div>
                            <h2 className="text-[24px] md:text-[28px] font-extrabold text-gray-800 mb-2 text-center">Buat Kata Sandi Baru</h2>
                            <p className="text-[14px] md:text-[15px] font-medium text-gray-500 text-center leading-relaxed mb-8 px-2">Gunakan kata sandi yang kuat untuk menjaga akunmu tetap aman.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[14px] font-bold text-gray-700">Kata Sandi Baru</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl">
                                        <Icon icon="mdi:lock-outline" />
                                    </div>
                                    <input 
                                        type={showPassword1 ? "text" : "password"} 
                                        value={pass1} 
                                        onChange={(e) => setPass1(e.target.value)} 
                                        className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] pl-[52px] pr-12 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" 
                                        placeholder="Minimal 8 karakter" 
                                    />
                                    <button 
                                        onClick={() => setShowPassword1(!showPassword1)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl hover:text-gray-600 transition-colors"
                                    >
                                        <Icon icon={showPassword1 ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[14px] font-bold text-gray-700">Ulangi Kata Sandi</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl">
                                        <Icon icon="mdi:lock-outline" />
                                    </div>
                                    <input 
                                        type={showPassword2 ? "text" : "password"} 
                                        value={pass2} 
                                        onChange={(e) => setPass2(e.target.value)} 
                                        className={`w-full h-[55px] border-[1.5px] rounded-[16px] pl-[52px] pr-12 font-bold text-gray-800 outline-none transition-all text-[14px] ${pass2 && pass1 !== pass2 ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#14AE5C] focus:bg-[#F0FDF4]'}`} 
                                        placeholder="Ketik ulang kata sandi" 
                                    />
                                    <button 
                                        onClick={() => setShowPassword2(!showPassword2)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl hover:text-gray-600 transition-colors"
                                    >
                                        <Icon icon={showPassword2 ? "mdi:eye-outline" : "mdi:eye-off-outline"} />
                                    </button>
                                </div>
                                {pass2 && pass1 !== pass2 && (
                                    <span className="text-[12px] font-semibold text-red-500 mt-1">Kata sandi tidak cocok.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-6 flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={handleResetPassword} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Simpan & Masuk
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;
