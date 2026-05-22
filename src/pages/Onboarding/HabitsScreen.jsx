import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { getProfileDraft, saveProfileDraft } from '../../utils/userProfileStorage';

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
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6 flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '90%' : '70%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '90 %' : '70 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-4 flex-shrink-0">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Kebiasaan mana yang paling penting bagi Anda?</h2>
                    <p className="text-[14px] font-medium text-gray-500 mt-2">Pilih minimal 3 kebiasaan.</p>
                </div>
                <div className="flex-1 overflow-y-auto hide-scrollbar mt-2 pb-4">
                    <div className="flex flex-wrap content-start gap-3">
                        {habitsList.map((habit) => (
                            <button key={habit} onClick={() => toggleHabit(habit)} className={`px-5 py-3 rounded-full border-[1.5px] font-semibold text-[14px] transition-all ${selectedHabits.includes(habit) ? 'border-[#14AE5C] text-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 text-gray-600 bg-white'}`}>{habit}</button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 mb-6 w-full bg-[#F0FDF4] rounded-[16px] p-4 flex items-start gap-4 border border-[#E8F5EE] flex-shrink-0">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center flex-shrink-0 shadow-sm">
                        <Icon icon="mdi:lightbulb-on-outline" className="text-xl text-[#14AE5C]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-black">Tahukah Anda?</span>
                        <span className="text-[12px] font-medium text-gray-600 leading-relaxed mt-1">Anda bisa menginput makanan melalui Teks atau Barcode nanti di Dashboard.</span>
                    </div>
                </div>
                <div className="flex justify-center w-full flex-shrink-0">
                    <Button
                        onClick={() => {
                            if (!isComplete) return;
                            const nextProfile = { ...profileDraft, goal: selectedGoal, habits: selectedHabits };
                            saveProfileDraft(nextProfile);
                            navigate('/daftar', { state: { goal: selectedGoal, profile: nextProfile } });
                        }}
                        className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HabitsScreen;
