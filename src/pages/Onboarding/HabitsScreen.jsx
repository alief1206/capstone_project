import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { getProfileDraft, saveProfileDraft } from '../../utils/userProfileStorage';
import mascotImage from '../../assets/images/mascot.png';

const HabitsScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const profileDraft = location.state?.profile || getProfileDraft();
    const [selectedHabits, setSelectedHabits] = useState([]);
    const isComplete = selectedHabits.length >= 3;
    const habitsList = ['Lacak Kalori', 'Konsumsi Protein', 'Makan Gizi Seimbang', 'Minum Cukup Air', 'Tidur Cukup', 'Olahraga Teratur', 'Kurangi Gula', 'Makan Sayur & Buah', 'Hindari Makan Malam', 'Kontrol Porsi', 'Jangan Lupa Sarapan', 'Kurangi Makanan Olahan', 'Rutin Olah Raga', 'Makan dengan Porsi Kecil', 'Mengurangi Konsumsi Alkohol', 'Meminimalisir Stres'];
    
    const toggleHabit = (habit) => {
        if (selectedHabits.includes(habit)) setSelectedHabits(selectedHabits.filter(h => h !== habit));
        else setSelectedHabits([...selectedHabits, habit]);
    };
    
    return (
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Bangun Kebiasaan<br/>Lebih Baik</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Pilih kebiasaan kecil yang akan membantumu mencapai target besar bersama EatSistent.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '90%' : '70%' }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400">{isComplete ? '90 %' : '70 %'}</span>
                        </div>
                    </div>

                    <div className="mt-6 mb-4 flex-shrink-0">
                        <h2 className="text-[26px] md:text-[28px] font-extrabold text-gray-800 leading-snug">Kebiasaan mana yang paling penting bagi Anda?</h2>
                        <p className="text-[14px] font-medium text-gray-500 mt-2">Pilih minimal 3 kebiasaan.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar mt-2 pb-2 pr-1">
                        <div className="flex flex-wrap content-start gap-2.5 md:gap-3">
                            {habitsList.map((habit) => (
                                <button 
                                    key={habit} 
                                    onClick={() => toggleHabit(habit)} 
                                    className={`px-5 py-2.5 md:py-3 rounded-[100px] border-[1.5px] font-bold text-[13px] md:text-[14px] transition-all active:scale-95 ${selectedHabits.includes(habit) ? 'border-[#14AE5C] text-[#14AE5C] bg-[#F0FDF4] shadow-sm' : 'border-gray-200 text-gray-600 bg-white hover:border-[#14AE5C] hover:bg-gray-50'}`}
                                >
                                    {habit}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 mb-6 w-full bg-[#F0FDF4] rounded-[20px] p-4 flex items-start gap-4 border border-[#E8F5EE] flex-shrink-0 shadow-sm">
                        <div className="w-[44px] h-[44px] bg-white rounded-full flex justify-center items-center flex-shrink-0 shadow-sm border border-gray-100">
                            <Icon icon="mdi:lightbulb-on-outline" className="text-[22px] text-[#14AE5C]" />
                        </div>
                        <div className="flex flex-col pt-0.5">
                            <span className="font-extrabold text-[14px] text-gray-800">Tahukah Anda?</span>
                            <span className="text-[12px] font-medium text-gray-600 leading-relaxed mt-1">Anda bisa menginput makanan melalui Teks atau Barcode nanti di Dashboard.</span>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-center w-full flex-shrink-0 pt-2 border-t border-white">
                        <Button
                            onClick={() => {
                                if (!isComplete) return;
                                const nextProfile = { ...profileDraft, goal: selectedGoal, habits: selectedHabits };
                                saveProfileDraft(nextProfile);
                                navigate('/daftar', { state: { goal: selectedGoal, profile: nextProfile } });
                            }}
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!isComplete ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitsScreen;
