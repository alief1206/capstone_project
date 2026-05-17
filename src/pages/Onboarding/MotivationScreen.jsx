import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import GoalChart from '../../components/GoalChart';

const MotivationScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan'; 
    const contentData = {
        turunkan: { title: 'Menurunkan Berat Badan Tidak Selalu Mudah', desc: 'Tetapi kami akan memotivasi Anda melewati segala kesulitannya.' },
        jaga: { title: 'Menjaga berat badan ideal adalah bentuk konsistensi.', desc: 'Pertahankan pola sehatmu untuk hidup berkualitas setiap hari.' },
        tambah: { title: 'Menambah berat badan sehat butuh strategi.', desc: 'Kami akan membantu Anda mencapai berat ideal dengan cara yang sehat.' }
    };
    const currentContent = contentData[selectedGoal];
    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-6 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/sasaran')} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">35 %</span>
                    </div>
                </div>
                <div className="mt-8 mb-6 overflow-y-auto hide-scrollbar flex-1 pb-4">
                    <h2 className="text-[26px] font-bold text-black leading-snug mb-6">{currentContent.title}</h2>
                    <div className="flex justify-center mb-8"><GoalChart goal={selectedGoal} /></div>
                    <p className="text-[18px] font-medium text-gray-700 leading-relaxed">{currentContent.desc}</p>
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button onClick={() => navigate('/datadiri', { state: { goal: selectedGoal } })}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

export default MotivationScreen;