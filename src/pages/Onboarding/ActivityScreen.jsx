import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { getProfileDraft, saveProfileDraft } from '../../utils/userProfileStorage';
import mascotImage from '../../assets/images/mascot.png';

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
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Sesuaikan<br/>Rutinitasmu!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Mengetahui tingkat aktivitas harianmu membantu kami menghitung kebutuhan kalori harian yang paling presisi.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: selectedActivity ? '70%' : '50%' }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400">{selectedActivity ? '70 %' : '50 %'}</span>
                        </div>
                    </div>

                    <div className="mt-8 mb-6 flex-shrink-0">
                        <h2 className="text-[26px] md:text-[28px] font-extrabold text-gray-800 leading-snug">Seberapa aktif Anda setiap hari?</h2>
                    </div>

                    <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto hide-scrollbar pb-4 pr-1">
                        {activities.map((act) => (
                            <div 
                                key={act.id} 
                                onClick={() => setSelectedActivity(act.id)} 
                                className={`w-full p-4 md:p-5 flex items-center rounded-[20px] border-[1.5px] transition-all cursor-pointer active:scale-95 flex-shrink-0 ${selectedActivity === act.id ? 'border-[#14AE5C] bg-[#F0FDF4] shadow-sm' : 'border-gray-200 bg-white hover:border-[#14AE5C] hover:bg-gray-50'}`}
                            >
                                <div className={`w-[50px] h-[50px] flex items-center justify-center rounded-full mr-4 flex-shrink-0 transition-colors ${selectedActivity === act.id ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'}`}>
                                    <Icon icon={act.icon} className={`text-[32px] md:text-[36px] ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-gray-600'}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className={`text-[15px] md:text-[16px] font-extrabold ${selectedActivity === act.id ? 'text-[#14AE5C]' : 'text-gray-800'}`}>{act.title}</span>
                                    <span className="text-[13px] font-medium text-gray-500 mt-0.5">{act.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-center w-full flex-shrink-0 pt-2 border-t border-white">
                        <Button
                            onClick={() => {
                                if (!selectedActivity) return;
                                const nextProfile = { ...profileDraft, goal: selectedGoal, activity: selectedActivity };
                                saveProfileDraft(nextProfile);
                                navigate('/kebiasaan', { state: { goal: selectedGoal, profile: nextProfile } });
                            }}
                            className={`w-full py-4 text-[15px] font-bold transition-all ${!selectedActivity ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityScreen;
