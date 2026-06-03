import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logoIcon from '../../assets/icons/logo-icon.png';
import { toLocalDateKey } from '../../utils/dateUtils.js';

const BarcodeScannerScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const selectedLogDate = toLocalDateKey(location.state?.logDate || new Date());

    const [toast, setToast] = useState({ show: false, title: '', message: '', icon: '' });

    const showToast = (title, message, icon = 'mdi:information-variant') => {
        setToast({ show: true, title, message, icon });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    return (
        <div className='w-full min-h-screen font-sans'>
            
            <div className={`fixed z-[999] transition-all duration-500 transform ${toast.show ? 'top-10 opacity-100 translate-y-0' : '-top-20 opacity-0 -translate-y-full'} left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white px-6 py-4 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 w-[90%] max-w-[360px]`}>
                <div className="w-10 h-10 bg-[#FFF5EB] rounded-full flex items-center justify-center border border-[#FFE4C4] flex-shrink-0">
                    <Icon icon={toast.icon} className="text-xl text-[#F97316]" />
                </div>
                <div className="flex flex-col text-left">
                    <h4 className="text-[14px] font-extrabold text-gray-800">{toast.title}</h4>
                    <p className="text-[12px] font-medium text-gray-500 mt-0.5">{toast.message}</p>
                </div>
            </div>

            <div className="hidden md:flex flex-col min-h-screen bg-[#F8FAFC]">
                <nav className="fixed top-0 w-full h-[84px] bg-white shadow-sm border-b border-gray-100 z-50 flex justify-center">
                    <div className="w-full max-w-[1400px] px-8 flex justify-between items-center h-full">
                        <div className="flex items-center cursor-pointer gap-3" onClick={() => navigate('/dashboard')}>
                            <img src={logoIcon} alt="Logo" className="w-[36px] h-[36px]" />
                            <h1 className="text-[24px] font-extrabold text-[#14AE5C]">EatSistent</h1>
                        </div>
                        <button type="button" onClick={() => navigate(-1)} className="bg-[#14AE5C] text-white px-6 py-2.5 rounded-[100px] text-[14px] font-bold hover:bg-[#108e4b] transition-all cursor-pointer">
                            Kembali
                        </button>
                    </div>
                </nav>

                <main className="flex-1 flex items-center justify-center p-8 mt-[84px]">
                    <div className="w-full max-w-[420px] bg-white rounded-[36px] shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col">
                        
                        <div className="flex justify-between items-center mb-6">
                            <button type="button" onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 border border-gray-100 transition-all cursor-pointer active:scale-95">
                                <Icon icon="mdi:arrow-left" className="text-xl text-gray-700 pointer-events-none" />
                            </button>
                            <button type="button" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 border border-gray-100 transition-all cursor-pointer active:scale-95">
                                <Icon icon="mdi:flash" className="text-xl text-gray-700 pointer-events-none" />
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-[22px] font-extrabold text-gray-800">Pindai Barcode</h2>
                            <p className="text-[13px] font-medium text-gray-500 mt-1.5">Arahkan kamera ke barcode produk</p>
                        </div>

                        <div className="w-full h-[280px] bg-[#0A0A0A] rounded-[24px] relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
                            <div className="absolute inset-0 border-[4px] border-[#14AE5C] rounded-[24px] opacity-40"></div>
                            
                            <Icon icon="mdi:barcode" className="text-white/20 text-[80px] mb-4" />
                            
                            <div className="absolute bottom-5 bg-[#14AE5C] px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                <Icon icon="mdi:barcode-scan" className="text-white text-[13px]" />
                                <span className="text-white text-[13px] font-bold tracking-wide">Siap memindai...</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div 
                                onClick={() => {
                                    showToast("Informasi", "Fitur pemindaian belum tersedia. Mengarahkan ke input manual...");
                                    setTimeout(() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } }), 2000);
                                }}
                                className="w-[72px] h-[72px] bg-gray-100 rounded-full flex justify-center items-center cursor-pointer active:scale-95 transition-transform border-2 border-dashed border-gray-300 p-1.5"
                            >
                                <div className="w-full h-full bg-gray-800 rounded-full hover:bg-gray-700 transition-colors pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center items-center gap-3">
                            <span className="text-[13px] font-medium text-gray-500">Tidak terbaca?</span>
                            <button 
                                type="button"
                                onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } })} 
                                className="px-5 py-2 border-2 border-[#14AE5C] text-[#14AE5C] text-[13px] font-bold rounded-full hover:bg-[#F0FDF4] active:scale-95 transition-all cursor-pointer"
                            >
                                Ketik Manual
                            </button>
                        </div>

                    </div>
                </main>
            </div>

            <div className="md:hidden flex flex-col min-h-[100dvh] bg-black relative overflow-hidden">
                <div className="fixed top-0 left-0 w-full pt-12 px-6 flex justify-between items-center z-[9999] pointer-events-none">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)} 
                        className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer active:scale-95 transition-transform pointer-events-auto"
                    >
                        <Icon icon="mdi:close" className="text-2xl text-white pointer-events-none" />
                    </button>
                    <button type="button" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer active:scale-95 transition-transform pointer-events-auto">
                        <Icon icon="mdi:flash" className="text-2xl text-white pointer-events-none" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center mt-20 z-10 w-full px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-[22px] font-extrabold text-white">Pindai Barcode</h2>
                        <p className="text-[14px] font-medium text-gray-400 mt-2">Arahkan kamera ke barcode produk</p>
                    </div>

                    <div className="relative w-full max-w-[320px] aspect-[4/3] flex justify-center items-center mb-8">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#14AE5C] rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#14AE5C] rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#14AE5C] rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#14AE5C] rounded-br-2xl"></div>
                        
                        <div className="w-full h-full bg-white/5 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                            <Icon icon="mdi:barcode" className="text-white/40 text-[90px]" />
                        </div>
                    </div>
                    
                    <div className="bg-[#14AE5C] px-7 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(20,174,92,0.4)] mb-12">
                        <Icon icon="mdi:barcode-scan" className="text-white text-lg" />
                        <span className="text-white text-[14px] font-bold tracking-wide">Siap memindai...</span>
                    </div>

                    <div 
                        onClick={() => {
                            showToast("Informasi", "Fitur pemindaian belum tersedia. Mengarahkan ke input manual...");
                            setTimeout(() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } }), 2000);
                        }}
                        className="w-[76px] h-[76px] rounded-full border-[3px] border-white flex justify-center items-center p-1.5 cursor-pointer active:scale-95 transition-transform mb-10 z-[50] relative"
                    >
                        <div className="w-full h-full bg-gray-500 rounded-full hover:bg-gray-400 transition-colors pointer-events-none"></div>
                    </div>

                    <p className="text-white text-[14px] font-medium flex items-center gap-3">
                        Tidak terbaca? 
                        <button 
                            type="button"
                            onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } })} 
                            className="px-5 py-2 border-2 border-[#14AE5C] rounded-full text-[#14AE5C] font-bold cursor-pointer hover:bg-[#14AE5C]/20 transition-colors z-[50] relative"
                        >
                            Ketik Manual
                        </button>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default BarcodeScannerScreen;
