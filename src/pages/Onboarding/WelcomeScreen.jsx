import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import mascotImage from '../../assets/images/mascot.png';
import logoIcon from '../../assets/icons/logo-icon.png';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    
    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[600px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[600px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[350px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-8">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Mulai Perjalanan<br/>Sehatmu Hari Ini</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3">Bersama AI Nutrition Assistant</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center pt-12 md:pt-16 pb-10 px-6 md:px-12">
                    <header className="flex items-center gap-2 md:mb-6">
                        <img src={logoIcon} alt="Logo" className="w-[65px] h-[65px] md:w-[75px] md:h-[75px] object-contain" />
                        <h1 className="text-[32px] md:text-[36px] font-extrabold text-[#14AE5C] tracking-tight">EatSistent</h1>
                    </header>
                    
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[280px] object-contain mt-8 mb-6 md:hidden" />
                    
                    <div className="text-center mt-2 md:mt-0 mb-8 md:mb-12 w-full max-w-[350px]">
                        <h2 className="text-[26px] md:text-[30px] font-extrabold text-gray-800">Selamat Datang!</h2>
                        <p className="text-[15px] md:text-[16px] font-medium text-gray-500 mt-3 leading-relaxed">
                            Mari kita sesuaikan EatSistent dengan sasaran harianmu.
                        </p>
                    </div>
                    
                    <footer className="mt-auto md:mt-0 w-full flex flex-col items-center max-w-[350px]">
                        <Button onClick={() => navigate('/sasaran')} className="w-full py-4 text-[15px] font-bold shadow-md hover:shadow-lg transition-all active:scale-95">Lanjutkan</Button>
                        
                        <div className="w-full flex items-center gap-4 my-6 text-black font-semibold">
                            <div className="flex-grow h-[1px] bg-gray-200"></div>
                            <span className="text-[12px] font-extrabold tracking-widest text-gray-400 uppercase">Atau</span>
                            <div className="flex-grow h-[1px] bg-gray-200"></div>
                        </div>
                        
                        <Button variant="outline" onClick={() => navigate('/login')} className="w-full py-4 text-[15px] font-bold border-2 hover:bg-gray-50 transition-all active:scale-95">Masuk</Button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;