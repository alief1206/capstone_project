import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import GoalChart from '../../components/GoalChart';
import mascotImage from '../../assets/images/mascot.png';

const MotivationScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan'; 
    
    const [progress, setProgress] = useState(20);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(35);
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    const contentData = {
        turunkan: { title: 'Menurunkan Berat Badan Tidak Selalu Mudah', desc: 'Tetapi kami akan memotivasi Anda melewati segala kesulitannya.' },
        jaga: { title: 'Menjaga berat badan ideal adalah bentuk konsistensi.', desc: 'Pertahankan pola sehatmu untuk hidup berkualitas setiap hari.' },
        tambah: { title: 'Menambah berat badan sehat butuh strategi.', desc: 'Kami akan membantu Anda mencapai berat ideal dengan cara yang sehat.' }
    };
    const currentContent = contentData[selectedGoal];
    
    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Tetap Semangat!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Konsistensi adalah kunci utama menuju pola hidup sehat dan target impianmu.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate('/sasaran')} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400">{progress} %</span>
                        </div>
                    </div>

                    <div className="mt-8 mb-6 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
                        <h2 className="text-[26px] md:text-[30px] font-extrabold text-gray-800 leading-snug mb-8">{currentContent.title}</h2>
                        <div className="flex justify-center mb-10 bg-gray-50/50 py-8 px-4 rounded-[28px] border border-gray-100 shadow-inner">
                            <GoalChart goal={selectedGoal} />
                        </div>
                        <p className="text-[16px] md:text-[18px] font-medium text-gray-600 leading-relaxed">{currentContent.desc}</p>
                    </div>

                    <div className="mt-4 flex justify-center w-full flex-shrink-0 pt-2 border-t border-white">
                        <Button 
                            onClick={() => navigate('/datadiri', { state: { goal: selectedGoal } })} 
                            className="w-full py-4 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotivationScreen;