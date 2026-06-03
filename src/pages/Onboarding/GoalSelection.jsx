import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import mascotImage from '../../assets/images/mascot.png';

const GoalSelection = () => {
    const navigate = useNavigate();
    const [selectedGoal, setSelectedGoal] = useState(null);
    const goals = [
        { id: 'turunkan', title: 'Turunkan Berat Badan', icon: 'mdi:scale-bathroom', color: '#14AE5C' },
        { id: 'jaga', title: 'Jaga Berat Badan', icon: 'ph:person-simple-walk-bold', color: '#14AE5C' },
        { id: 'tambah', title: 'Tambah Berat Badan', icon: 'mdi:dumbbell', color: '#14AE5C' }
    ];

    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Tentukan<br/>Sasaranmu!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Pilih target yang ingin dicapai, dan biarkan AI kami memandu perjalanan sehatmu.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate('/welcome')} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedGoal ? '20%' : '0%' }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400">{selectedGoal ? '20 %' : '0 %'}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 mb-8 flex-shrink-0">
                        <h2 className="text-[26px] md:text-[28px] font-extrabold text-gray-800">Halo, Sobat Sehat 👋</h2>
                        <p className="text-[15px] font-medium text-gray-500 mt-2">Mari mulai dari sasaranmu.</p>
                    </div>

                    <div className="flex flex-col gap-4 flex-1 overflow-y-auto hide-scrollbar">
                        {goals.map((goal) => (
                            <div 
                                key={goal.id} 
                                onClick={() => setSelectedGoal(goal.id)} 
                                className={`w-full h-[76px] md:h-[84px] flex items-center px-5 rounded-[20px] border-[1.5px] transition-all cursor-pointer active:scale-95 ${selectedGoal === goal.id ? 'border-[#14AE5C] bg-[#F0FDF4] shadow-sm' : 'border-gray-200 bg-white hover:border-[#14AE5C] hover:bg-gray-50'}`}
                            >
                                <div className={`w-[48px] h-[48px] flex items-center justify-center rounded-xl border transition-colors ${selectedGoal === goal.id ? 'bg-[#14AE5C] border-[#14AE5C] text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
                                    <Icon icon={goal.icon} className="w-6 h-6" style={{ color: selectedGoal === goal.id ? 'white' : goal.color }} />
                                </div>
                                <span className={`text-[15px] md:text-[16px] font-extrabold ml-4 ${selectedGoal === goal.id ? 'text-[#14AE5C]' : 'text-gray-700'}`}>{goal.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-center w-full flex-shrink-0 pt-4 border-t border-white">
                        <Button 
                            onClick={() => selectedGoal && navigate('/motivasi', { state: { goal: selectedGoal } })} 
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!selectedGoal ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSelection;