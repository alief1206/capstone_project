import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import mascotImage from '../../assets/images/mascot.png';
import logoIcon from '../../assets/icons/logo-icon.png';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl relative flex flex-col items-center pt-12 pb-10 px-4 overflow-hidden'>
                <header className="flex items-center gap-1 mt-2">
                    <img src={logoIcon} alt="Logo" className="w-[80px] h-[70px] object-contain" />
                    <h1 className="-ml-3 text-[32px] font-bold text-[#14AE5C]">EatSistent</h1>
                </header>
                <img src={mascotImage} alt="Mascot" className="w-[350px] h-[250px] object-contain mt-10 mb-8" />
                <div className="text-center mt-2">
                    <h2 className="text-[24px] font-bold text-black">Selamat Datang!</h2>
                    <p className="text-[16px] font-medium text-black mt-3 px-6 leading-relaxed">Mari kita sesuaikan EatSistent <br/> dengan sasaranmu.</p>
                </div>
                <footer className="mt-auto w-full flex flex-col items-center">
                    <Button onClick={() => navigate('/sasaran')}>Lanjutkan</Button>
                    <div className="w-[358px] flex items-center gap-4 my-5 text-black font-semibold">
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                        <span className="text-[12px] tracking-wide">ATAU</span>
                        <div className="flex-grow h-[1px] bg-gray-300"></div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/login')}>Masuk</Button>
                </footer>
            </div>
        </div>
    );
};

export default WelcomeScreen;