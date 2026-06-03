import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';

const GoalSelection = () => {
    const navigate = useNavigate();
    const [selectedGoal, setSelectedGoal] = useState(null);
    const goals = [
        { id: 'turunkan', title: 'Turunkan Berat Badan', icon: 'mdi:scale-bathroom', color: '#14AE5C' },
        { id: 'jaga', title: 'Jaga Berat Badan', icon: 'ph:person-simple-walk-bold', color: '#14AE5C' },
        { id: 'tambah', title: 'Tambah Berat Badan', icon: 'mdi:dumbbell', color: '#14AE5C' }
    ];
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/welcome')} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedGoal ? '20%' : '0%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{selectedGoal ? '20 %' : '0 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[24px] font-bold text-black">Halo, Sobat Sehat</h2>
                    <p className="text-[15px] font-medium text-gray-500 mt-2">Mari mulai dari sasaranmu.</p>
                </div>
                <div className="flex flex-col gap-3">
                    {goals.map((goal) => (
                        <div key={goal.id} onClick={() => setSelectedGoal(goal.id)} className={`w-full h-[76px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer ${selectedGoal === goal.id ? 'border-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className="w-[44px] h-[44px] flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm mr-4">
                                <Icon icon={goal.icon} className="w-6 h-6" style={{ color: goal.color }} />
                            </div>
                            <span className={`text-[15px] font-semibold ${selectedGoal === goal.id ? 'text-black' : 'text-gray-700'}`}>{goal.title}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex justify-center w-full">
                    <Button onClick={() => selectedGoal && navigate('/motivasi', { state: { goal: selectedGoal } })} className={!selectedGoal ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

export default GoalSelection;