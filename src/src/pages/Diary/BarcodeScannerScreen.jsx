import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const BarcodeScannerScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const selectedLogDate = location.state?.logDate || new Date().toISOString();

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-black relative flex flex-col items-center overflow-hidden pb-8'>
                
                <div className="w-full pt-12 px-6 flex justify-between items-center z-10 text-white flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="w-[40px] h-[40px] bg-white/20 rounded-full flex justify-center items-center text-xl backdrop-blur-sm">
                        <Icon icon="mdi:close" />
                    </button>
                    <button className="w-[40px] h-[40px] bg-white/20 rounded-full flex justify-center items-center text-xl backdrop-blur-sm">
                        <Icon icon="mdi:flash" />
                    </button>
                </div>

                <div className="mt-10 text-center z-10 flex-shrink-0">
                    <p className="text-white text-[15px] font-bold tracking-wide">Arahkan kamera ke Barcode produk</p>
                </div>

                <div className="flex-1 w-full flex flex-col justify-center items-center gap-8 z-10 -mt-10">
                    <div className="relative w-[280px] h-[200px] flex justify-center items-center">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#14AE5C] rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#14AE5C] rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#14AE5C] rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#14AE5C] rounded-br-xl"></div>
                        
                        <div className="w-full h-full bg-white/5 backdrop-blur-[1px] flex justify-center items-center">
                            <Icon icon="mdi:barcode" className="text-white/40 text-8xl" />
                        </div>
                    </div>

                    <div className="bg-[#14AE5C] px-6 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(20,174,92,0.4)]">
                        <Icon icon="mdi:barcode-scan" className="text-white text-lg" />
                        <span className="text-white text-[14px] font-bold">Siap memindai...</span>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center gap-10 z-10 flex-shrink-0">
                    <div 
                        onClick={() => {
                            alert("Fitur pemindaian belum tersedia. Kamu akan diarahkan ke halaman penambahan makanan secara manual.");
                            navigate('/diary', { state: { goal: currentGoal, email: userEmail } });
                        }}
                        className="w-[72px] h-[72px] rounded-full border-4 border-white flex justify-center items-center p-1 cursor-pointer"
                    >
                        <div className="w-full h-full bg-gray-500 rounded-full hover:bg-gray-400 transition-colors"></div>
                    </div>

                    <p className="text-white text-[13px] font-medium flex items-center gap-2">
                        Tidak terbaca ? 
                        <span 
                            onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail, logDate: selectedLogDate } })} 
                            className="px-4 py-1.5 border border-[#14AE5C] rounded-full text-[#14AE5C] font-bold cursor-pointer hover:bg-[#14AE5C]/20 transition-colors"
                        >
                            Ketik Manual
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default BarcodeScannerScreen;
