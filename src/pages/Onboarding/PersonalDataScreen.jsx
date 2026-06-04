import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Button from '../../components/ui/Button';
import { saveProfileDraft } from '../../utils/userProfileStorage';
import mascotImage from '../../assets/images/mascot.png';

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
    const toIntegerInput = (value) => value.replace(/\D/g, '');
    const toDecimalInput = (value) => {
        const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
        const [whole, ...fractionParts] = normalized.split('.');
        return fractionParts.length ? `${whole}.${fractionParts.join('')}` : whole;
    };

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
        <div className='flex justify-center items-center min-h-screen bg-white md:bg-gray-50'>
            <div className='w-full md:max-w-5xl h-[100dvh] md:h-auto md:min-h-[680px] bg-white md:rounded-[32px] md:shadow-xl relative flex flex-col md:flex-row items-center overflow-hidden'>
                
                <div className="hidden md:flex w-1/2 h-full min-h-[680px] bg-gradient-to-b from-[#F0FDF4] to-[#E8F5EE] flex-col justify-center items-center p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#14AE5C] opacity-5 mix-blend-multiply pointer-events-none"></div>
                    <img src={mascotImage} alt="Mascot" className="w-full max-w-[320px] object-contain drop-shadow-xl z-10 relative hover:scale-105 transition-transform duration-500" />
                    <div className="z-10 text-center mt-10">
                        <h2 className="text-[28px] font-extrabold text-[#14AE5C] leading-tight">Satu Langkah<br/>Lebih Dekat!</h2>
                        <p className="text-[14px] font-medium text-gray-600 mt-3 px-4">Bantu AI kami menyusun rencana nutrisi yang paling akurat dengan melengkapi data dirimu.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col pt-10 md:pt-12 pb-8 px-6 md:px-12 max-h-[100dvh] md:max-h-[680px]">
                    <div className="flex flex-col gap-6 flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="w-fit text-2xl text-gray-800 font-bold hover:scale-110 transition-transform">
                            <Icon icon="mdi:arrow-left" />
                        </button>
                        <div className="flex items-center gap-4 w-full px-1">
                            <div className="flex-grow h-[8px] bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#14AE5C] rounded-full transition-all duration-500 ease-out" style={{ width: isComplete ? '50%' : '35%' }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400">{isComplete ? '50 %' : '35 %'}</span>
                        </div>
                    </div>

                    <div className="mt-6 mb-6 flex-shrink-0">
                        <h2 className="text-[26px] md:text-[28px] font-extrabold text-gray-800 leading-snug">Beri tahu kami sedikit tentang diri Anda.</h2>
                    </div>

                    <div className="flex flex-col gap-5 overflow-y-auto pb-6 hide-scrollbar flex-1 pr-1">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Jenis Kelamin</label>
                            <div className="flex gap-4">
                                <button onClick={() => setGender('pria')} className={`flex-1 h-[55px] flex items-center justify-center gap-2 border-[1.5px] rounded-[16px] font-bold transition-all active:scale-95 ${gender === 'pria' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C] shadow-sm' : 'border-gray-200 text-gray-500 hover:border-[#14AE5C] hover:bg-gray-50'}`}>
                                    <Icon icon="mdi:gender-male" className="text-2xl" /> Pria
                                </button>
                                <button onClick={() => setGender('wanita')} className={`flex-1 h-[55px] flex items-center justify-center gap-2 border-[1.5px] rounded-[16px] font-bold transition-all active:scale-95 ${gender === 'wanita' ? 'border-[#14AE5C] bg-[#F0FDF4] text-[#14AE5C] shadow-sm' : 'border-gray-200 text-gray-500 hover:border-[#14AE5C] hover:bg-gray-50'}`}>
                                    <Icon icon="mdi:gender-female" className="text-2xl" /> Wanita
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Usia</label>
                            <div className="relative">
                                <input type="text" inputMode="numeric" value={age} onChange={(e) => setAge(toIntegerInput(e.target.value))} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all" placeholder="0" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Tahun</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Tinggi Badan</label>
                            <div className="relative">
                                <input type="text" inputMode="numeric" value={height} onChange={(e) => setHeight(toIntegerInput(e.target.value))} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all" placeholder="0" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Cm</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Berat Badan Sekarang</label>
                            <div className="relative">
                                <input type="text" inputMode="decimal" value={weight} onChange={(e) => setWeight(toDecimalInput(e.target.value))} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all" placeholder="0" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kg</span>
                            </div>
                        </div>

                        {needsTarget && (
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[14px] font-bold text-gray-700">Target Berat Badan</label>
                                <div className="relative">
                                    <input type="text" inputMode="decimal" value={targetWeight} onChange={(e) => setTargetWeight(toDecimalInput(e.target.value))} className="w-full h-[55px] border-[1.5px] border-gray-200 rounded-[16px] px-5 font-bold text-gray-800 outline-none focus:border-[#14AE5C] focus:bg-[#F0FDF4] transition-all" placeholder="0" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kg</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[14px] font-bold text-gray-700">Lokasi</label>
                            <div className="w-full h-[55px] border-[1.5px] border-gray-200 bg-gray-50 rounded-[16px] px-5 flex items-center gap-3 font-bold text-gray-500 cursor-not-allowed">
                                <Icon icon="twemoji:flag-indonesia" className="text-xl" /> Indonesia
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-center w-full flex-shrink-0 pt-2 border-t border-white">
                        <Button 
                            onClick={(e) => isComplete && handleSavePhysicalData(e)} 
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

export default PersonalDataScreen;
