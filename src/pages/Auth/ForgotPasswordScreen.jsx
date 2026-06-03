import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import logoIcon from '../../assets/icons/logo-icon.png';
import mascotImage from '../../assets/images/mascot.png';

const ForgotPasswordScreen = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleForgotPassword = async () => {
        if (!email) return;

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Gagal mengirim kode reset.");
                return;
            }

            alert(`${data.message}${data.devOtp ? `\nKode reset lokal: ${data.devOtp}` : ''}`);
            navigate('/otp', { state: { email, mode: 'reset' } });
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
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Jangan Khawatir!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Kami akan membantumu memulihkan akses ke akun EatSistent agar kamu bisa melanjutkan perjalanan sehatmu.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-14 max-h-[100dvh] md:max-h-[680px]">
                    
                    <div className="flex flex-col flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform mb-6 md:mb-8">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center md:items-start flex-shrink-0 mb-8 md:mb-10">
                        <div className="w-[85px] h-[85px] bg-[#F0FDF4] rounded-full flex justify-center items-center mb-6 relative border border-[#DCFCE7] shadow-sm">
                            <Icon icon="mdi:email-outline" className="text-[40px] text-[#14AE5C]" />
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#14AE5C] rounded-full border-[3px] border-white flex justify-center items-center">
                                <Icon icon="mdi:check" className="text-white text-sm" />
                            </div>
                        </div>
                        <h2 className="text-[28px] md:text-[32px] font-extrabold text-gray-800 text-center md:text-left w-full">Lupa Kata Sandi?</h2>
                        <p className="text-[14px] md:text-[15px] font-medium text-gray-500 text-center md:text-left mt-3 leading-relaxed md:pr-4">
                            Masukkan email yang terdaftar untuk menerima kode verifikasi pengaturan ulang sandi.
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Email</label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    <Icon icon="mdi:email-outline" />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] pl-[52px] pr-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all text-[14px]" 
                                    placeholder="nama@email.com" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center w-full gap-4 flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={handleForgotPassword} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!email ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Kirim Kode
                        </Button>
                        <p className="text-[14px] font-bold text-gray-500 mt-2">
                            Ingat kata sandi? <span className="text-[#14AE5C] cursor-pointer hover:underline" onClick={() => navigate('/login')}>Kembali ke Masuk</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;
