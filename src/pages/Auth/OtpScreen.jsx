import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';

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

export default OtpScreen;