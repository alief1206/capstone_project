import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { saveProfileDraft } from '../../utils/userProfileStorage';

const PersonalDataScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const needsTarget = selectedGoal === 'turunkan' || selectedGoal === 'tambah';
    const isComplete = gender && age && height && weight && (!needsTarget || targetWeight);

    const handleSavePhysicalData = async (e) => {
        e.preventDefault();

        const beratSekarang = parseFloat(weight);
        const targetBerat = needsTarget ? parseFloat(targetWeight) : beratSekarang;

        if (selectedGoal === "turunkan" && targetBerat >= beratSekarang) {
            alert("Validasi Gagal: Target berat badan harus lebih rendah dari berat badan saat ini jika Anda ingin menurunkan berat badan.");
            return; 
        }

        if (selectedGoal === "tambah" && targetBerat <= beratSekarang) {
            alert("Validasi Gagal: Target berat badan harus lebih tinggi dari berat badan saat ini jika Anda ingin menaikkan berat badan.");
            return; 
        }

        try {
            const profileDraft = {
                goal: selectedGoal,
                gender,
                age: Number(age),
                height: Number(height),
                currentWeight: beratSekarang,
                targetWeight: targetBerat
            };
            saveProfileDraft(profileDraft);
            navigate('/aktivitas', { state: { goal: selectedGoal, profile: profileDraft } });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col pt-12 pb-10 px-4 overflow-hidden'>
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold"><Icon icon="mdi:arrow-left" /></button>
                    <div className="flex items-center gap-4 w-full px-1">
                        <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '50%' : '35%' }}></div>
                        </div>
                        <span className="text-[14px] font-bold text-gray-400">{isComplete ? '50 %' : '35 %'}</span>
                    </div>
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-[26px] font-bold text-black leading-snug">Beri tahu kami sedikit tentang diri Anda.</h2>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pb-4 hide-scrollbar">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Jenis Kelamin</label>
                        <div className="flex gap-4">
                            <button onClick={() => setGender('pria')} className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'pria' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}><Icon icon="mdi:gender-male" className="text-xl" /> Pria</button>
                            <button onClick={() => setGender('wanita')} className={`flex-1 h-[50px] flex items-center justify-center gap-2 border-[1.5px] rounded-[12px] font-semibold transition-all ${gender === 'wanita' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C]' : 'border-gray-200 text-gray-600'}`}><Icon icon="mdi:gender-female" className="text-xl" /> Wanita</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Usia</label>
                        <div className="relative">
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tahun</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Tinggi Badan</label>
                        <div className="relative">
                            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Cm</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Berat Badan Sekarang</label>
                        <div className="relative">
                            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Kg</span>
                        </div>
                    </div>
                    {needsTarget && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] font-medium text-gray-700">Target Berat Badan</label>
                            <div className="relative">
                                <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full h-[50px] border-[1.5px] border-gray-200 rounded-[12px] px-4 font-semibold outline-none focus:border-[#14AE5C] transition-all" placeholder="0" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Kg</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-medium text-gray-700">Lokasi</label>
                        <div className="w-full h-[50px] border-[1.5px] border-gray-200 bg-gray-50 rounded-[12px] px-4 flex items-center gap-2 font-semibold text-gray-500">
                            <Icon icon="twemoji:flag-indonesia" /> Indonesia
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex justify-center w-full pt-4">
                    <Button onClick={(e) => isComplete && handleSavePhysicalData(e)} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>Berikutnya</Button>
                </div>
            </div>
        </div>
    );
};

export default PersonalDataScreen;
