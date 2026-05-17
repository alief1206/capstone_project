import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import logoIcon from '../../assets/icons/logo-icon.png';

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

export default ForgotPasswordScreen;