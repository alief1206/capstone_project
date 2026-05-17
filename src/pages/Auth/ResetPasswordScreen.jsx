import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';

const ResetPasswordScreen = () => {
    const navigate = useNavigate();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const isComplete = pass1 && pass2 && pass1 === pass2;
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold mb-8"><Icon icon="mdi:arrow-left" /></button>
                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div><span className="text-xs font-semibold text-gray-500">Email</span></div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-lg"><Icon icon="mdi:check" /></div><span className="text-xs font-semibold text-gray-500">Verifikasi</span></div>
                    <div className="h-[2px] w-12 bg-[#14AE5C]"></div>
                    <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#14AE5C] text-white flex justify-center items-center font-bold text-sm">3</div><span className="text-xs font-semibold text-[#14AE5C]">Sandi Baru</span></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-[#E8F5EE] rounded-full flex justify-center items-center mb-6 relative">
                        <Icon icon="mdi:lock-outline" className="text-5xl text-[#14AE5C]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14AE5C] rounded-full border-4 border-white flex justify-center items-center"><Icon icon="mdi:check" className="text-white text-md" /></div>
                    </div>
                    <h2 className="text-[24px] font-bold text-black mb-2 text-center">Buat Kata Sandi Baru</h2>
                    <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed mb-8">Gunakan kata sandi yang kuat untuk menjaga akunmu tetap aman.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Kata Sandi Baru</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl"><Icon icon="mdi:lock-outline" /></div>
                            <input type={showPassword1 ? "text" : "password"} value={pass1} onChange={(e) => setPass1(e.target.value)} className="w-full h-[54px] border-[1.5px] border-gray-200 rounded-[12px] pl-12 pr-12 font-semibold outline-none focus:border-[#14AE5C] transition-all text-[14px]" placeholder="••••••••" />
                            <button onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword1 ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-semibold text-gray-700">Ulangi Kata Sandi</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14AE5C] text-xl"><Icon icon="mdi:lock-outline" /></div>
                            <input type={showPassword2 ? "text" : "password"} value={pass2} onChange={(e) => setPass2(e.target.value)} className={`w-full h-[54px] border-[1.5px] rounded-[12px] pl-12 pr-12 font-semibold outline-none transition-all text-[14px] ${pass2 && pass1 !== pass2 ? 'border-red-400' : 'border-gray-200 focus:border-[#14AE5C]'}`} placeholder="••••••••" />
                            <button onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"><Icon icon={showPassword2 ? "mdi:eye-outline" : "mdi:eye-off-outline"} /></button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 mt-auto pt-6">
                    <Button onClick={() => isComplete && navigate('/login')} className={`w-full h-[54px] ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Simpan & Masuk</Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;