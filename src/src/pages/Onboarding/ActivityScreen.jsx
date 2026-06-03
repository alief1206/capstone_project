import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { getProfileDraft, saveProfileDraft } from '../../utils/userProfileStorage';

const ActivityScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const profileDraft = location.state?.profile || getProfileDraft();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const activities = [
        { id: 'rendah', title: 'Tidak Terlalu Aktif', desc: 'Duduk hampir sepanjang hari', icon: 'mdi:seat-recline-normal' },
        { id: 'sedang', title: 'Agak Aktif', desc: 'Banyak berdiri / berjalan sedikit.', icon: 'mdi:walk' },
        { id: 'aktif', title: 'Aktif', desc: 'Banyak bergerak secara fisik.', icon: 'mdi:run' },
        { id: 'sangat', title: 'Sangat Aktif', desc: 'Aktivitas fisik yang berat.', icon: 'mdi:weight-lifter' }
    ];
    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedActivity ? '70%' : '50%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{selectedActivity ? '70 %' : '50 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Seberapa aktif Anda setiap hari?</h2>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-4">
                    {activities.map((act) => (
                        <div key={act.id} onClick={() => setSelectedActivity(act.id)} className={`w-full h-[80px] flex items-center px-4 rounded-[16px] border-[1.5px] transition-all cursor-pointer flex-shrink-0 ${selectedActivity === act.id ? 'border-[#14AE5C] bg-[#F0FDF4]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className="w-[50px] flex items-center justify-center mr-2">
                                <Icon icon={act.icon} className={`text-4xl ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[15px] font-bold ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-black'}`}>{act.title}</span>
                                <span className="text-[12px] font-medium text-gray-500">{act.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button
                        onClick={() => {
                            if (!selectedActivity) return;
                            const nextProfile = { ...profileDraft, goal: selectedGoal, activity: selectedActivity };
                            saveProfileDraft(nextProfile);
                            navigate('/kebiasaan', { state: { goal: selectedGoal, profile: nextProfile } });
                        }}
                        className={!selectedActivity ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ActivityScreen;
