import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import robotImg from '../../assets/images/robot.png';
import { addFoodLog, parseCalories } from '../../utils/foodLogStorage';

const FoodSearchScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeMealMenu, setActiveMealMenu] = useState(null);

    const goalData = {
        jaga: { riwayat: [{ name: 'Telur Rebus', qty: '100g', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Nasi Putih', qty: '150g', cals: '220 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }], saran: [{ name: 'Dada Ayam Panggang', qty: '100g', cals: '165 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Tumis Terong', qty: '100g', cals: '111 kkal', icon: 'mdi:bowl-mix', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }, { name: 'Brokoli', qty: '80g', cals: '60 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Buah Alpukat', qty: '100g', cals: '111 kkal', icon: 'mdi:seed', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Tumis Wortel', qty: '100g', cals: '111 kkal', icon: 'mdi:carrot', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Pisang Ambon', qty: '1 buah', cals: '78 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }], rekomendasi: [{ name: 'Brokoli', cals: '60 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' }, { name: 'Wortel', cals: '40 kkal', icon: 'mdi:carrot', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' }, { name: 'Alpukat', cals: '111 kkal', icon: 'mdi:seed', color: 'text-[#3B82F6]', border: 'border-[#Dbeafe]', bg: 'bg-[#F0F5FF]' }] },
        turunkan: { riwayat: [{ name: 'Oatmeal', qty: '50g', cals: '190 kkal', icon: 'mdi:bowl-mix', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Telur Rebus', qty: '100g', cals: '140 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }], saran: [{ name: 'Dada Ayam Rebus', qty: '100g', cals: '150 kkal', icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Tumis Bayam', qty: '100g', cals: '45 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Apel Hijau', qty: '1 buah', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Tahu Kukus', qty: '100g', cals: '76 kkal', icon: 'mdi:square-rounded', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Salad Sayur', qty: '150g', cals: '120 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Kacang Almond', qty: '30g', cals: '170 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }], rekomendasi: [{ name: 'Apel', cals: '95 kkal', icon: 'mdi:food-apple', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' }, { name: 'Bayam', cals: '45 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' }, { name: 'Tahu', cals: '76 kkal', icon: 'mdi:square-rounded', color: 'text-[#F97316]', border: 'border-[#FFE4C4]', bg: 'bg-[#FFF5EB]' }] },
        tambah: { riwayat: [{ name: 'Nasi Goreng', qty: '200g', cals: '350 kkal', icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Daging Sapi', qty: '150g', cals: '350 kkal', icon: 'mdi:food-steak', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }], saran: [{ name: 'Jus Alpukat', qty: '1 gelas', cals: '250 kkal', icon: 'mdi:cup-water', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Roti Gandum', qty: '2 lembar', cals: '150 kkal', icon: 'mdi:bread-slice', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }, { name: 'Selai Kacang', qty: '2 sdm', cals: '190 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }, { name: 'Susu Full Cream', qty: '1 gelas', cals: '150 kkal', icon: 'mdi:cup', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' }, { name: 'Pisang', qty: '1 buah', cals: '105 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' }, { name: 'Telur Dadar', qty: '2 butir', cals: '180 kkal', icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' }], rekomendasi: [{ name: 'Susu', cals: '150 kkal', icon: 'mdi:cup', color: 'text-[#3B82F6]', border: 'border-[#Dbeafe]', bg: 'bg-[#F0F5FF]' }, { name: 'Kacang', cals: '190 kkal', icon: 'mdi:peanut', color: 'text-[#8B5CF6]', border: 'border-[#ede9fe]', bg: 'bg-[#F5F3FF]' }, { name: 'Pisang', cals: '105 kkal', icon: 'mdi:leaf', color: 'text-[#14AE5C]', border: 'border-[#DCFCE7]', bg: 'bg-[#F0FDF4]' }] }
    };

    const currentData = goalData[selectedGoal] || goalData.jaga;

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const shuffledSaran = useMemo(() => {
        return [...currentData.saran].sort(() => Math.random() - 0.5);
    }, [currentData.saran, refreshKey]);

    const shuffledRekomendasi = useMemo(() => {
        return [...currentData.rekomendasi].sort(() => Math.random() - 0.5);
    }, [currentData.rekomendasi, refreshKey]);

    const mealIds = {
        SARAPAN: 'sarapan',
        'MAKAN SIANG': 'makansiang',
        'MAKAN MALAM': 'makanmalam',
        CAMILAN: 'camilan'
    };

    const heavyFoodKeywords = ['nasi', 'mie', 'gulai', 'sate', 'rawon', 'bakso', 'rendang', 'ayam goreng', 'daging', 'nasi goreng'];
    const isHeavyFood = (foodName) => heavyFoodKeywords.some((keyword) => foodName.toLowerCase().includes(keyword));
    const getMealOptions = (item) => isHeavyFood(item.name) ? ['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM'] : ['SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM', 'CAMILAN'];

    const handleAddFood = async (item, meal) => {
        if (meal === 'CAMILAN' && isHeavyFood(item.name)) {
            alert(`Validasi Gagal: ${item.name} termasuk makanan berat, tidak boleh dimasukkan ke Camilan.`);
            return;
        }

        const foodPayload = {
            foodName: item.name,
            calories: parseCalories(item.cals),
            mealType: meal
        };

        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await fetch('http://localhost:5000/api/v1/food-logs/log-food', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(foodPayload)
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Gagal menyimpan makanan ke database.");
                    return;
                }
            } catch (error) {
                alert("Makanan tetap dicatat lokal, tapi gagal tersimpan ke database. Pastikan backend berjalan di port 5000.");
                console.error(error);
            }
        }

        addFoodLog(userEmail, {
            name: item.name,
            qty: item.qty,
            calories: parseCalories(item.cals),
            mealId: mealIds[meal],
            icon: item.icon,
            color: item.color,
            bg: item.bg
        });
        navigate('/diary', { state: { goal: selectedGoal, email: userEmail } });
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-12 px-4 pb-4 flex items-center gap-4 bg-white z-10 flex-shrink-0">
                    <button onClick={() => navigate(-1)} className="text-2xl text-black font-bold">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <h2 className="text-[18px] font-bold text-black flex-1 text-center pr-8">Pilih Santapan</h2>
                </div>

                <div className="px-4 mb-4 flex-shrink-0">
                    <div className="relative w-full h-[50px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                            <Icon icon="mdi:magnify" />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari makanan" 
                            className="w-full h-full border-[1.5px] border-gray-200 rounded-[16px] pl-12 pr-14 font-medium outline-none focus:border-[#14AE5C] transition-all text-[14px]"
                        />
                        <button 
                            onClick={() => navigate('/scan-barcode', { state: { goal: selectedGoal, email: userEmail } })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-[#14AE5C] rounded-[10px] flex justify-center items-center text-white text-lg hover:bg-[#0f8b48] transition-colors"
                        >
                            <Icon icon="mdi:barcode-scan" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 hide-scrollbar">
                    
                    <h3 className="text-[15px] font-bold text-black mb-3">Riwayat</h3>
                    <div className="flex flex-col gap-3 mb-6">
                        {currentData.riwayat.map((item, index) => (
                            <div key={`riwayat-${index}`} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3`}>
                                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{item.name}</span>
                                    <span className="text-[11px] font-medium text-gray-500">{item.qty}, {item.cals}</span>
                                </div>
                                <button 
                                    onClick={() => setActiveMealMenu(activeMealMenu === `riwayat-${index}` ? null : `riwayat-${index}`)} 
                                    className="w-[28px] h-[28px] rounded-full flex justify-center items-center border-2 border-[#14AE5C] text-[#14AE5C] text-lg hover:bg-[#F0FDF4] transition-colors relative z-10"
                                >
                                    <Icon icon="mdi:plus" />
                                </button>

                                {activeMealMenu === `riwayat-${index}` && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMealMenu(null)}></div>
                                        <div className="absolute right-0 top-12 w-[160px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden flex flex-col">
                                            {getMealOptions(item).map((meal) => (
                                                <div
                                                    key={meal}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMealMenu(null);
                                                        handleAddFood(item, meal);
                                                    }}
                                                    className="w-full py-3 px-4 border-b border-gray-50 last:border-0 hover:bg-[#F0FDF4] active:bg-[#E8F5EE] cursor-pointer flex items-center transition-colors"
                                                >
                                                    <span className="text-[#14AE5C] text-[12px] font-bold tracking-wide">{meal}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[15px] font-bold text-black">Saran</h3>
                        <button onClick={handleRefresh} className="text-[#14AE5C] text-lg hover:rotate-180 transition-transform duration-300">
                            <Icon icon="mdi:refresh" />
                        </button>
                    </div>

                    <div className="w-full bg-[#F0FDF4]/50 rounded-[20px] p-4 shadow-sm border border-[#DCFCE7] mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <img src={robotImg} alt="AI Rekomendasi" className="w-[70px] h-[58px] object-contain flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                                <h4 className="text-[12px] font-bold text-[#14AE5C] mb-2">Rekomendasi Untuk Kamu</h4>
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    {shuffledRekomendasi.map((rek, index) => (
                                        <div key={`rek-${index}`} className={`flex items-center gap-1 px-3 py-1.5 ${rek.bg} rounded-lg border ${rek.border} flex-shrink-0`}>
                                            <Icon icon={rek.icon} className={`${rek.color} text-lg`} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-black leading-none">{rek.name}</span>
                                                <span className="text-[9px] font-medium text-gray-500">{rek.cals}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pb-6">
                        {shuffledSaran.map((item, index) => (
                            <div key={`saran-${index}`} className="w-full bg-white rounded-[16px] p-3 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                                <div className={`w-[45px] h-[45px] ${item.bg} rounded-full flex justify-center items-center mr-3`}>
                                    <Icon icon={item.icon} className={`text-[24px] ${item.color}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[14px] font-bold text-black">{item.name}</span>
                                    <span className="text-[11px] font-medium text-gray-500">{item.qty}, {item.cals}</span>
                                </div>
                                <button 
                                    onClick={() => setActiveMealMenu(activeMealMenu === `saran-${index}` ? null : `saran-${index}`)} 
                                    className="w-[28px] h-[28px] rounded-full flex justify-center items-center border-2 border-[#14AE5C] text-[#14AE5C] text-lg hover:bg-[#F0FDF4] transition-colors relative z-10"
                                >
                                    <Icon icon="mdi:plus" />
                                </button>

                                {activeMealMenu === `saran-${index}` && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMealMenu(null)}></div>
                                        <div className="absolute right-0 top-12 w-[160px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden flex flex-col">
                                            {getMealOptions(item).map((meal) => (
                                                <div
                                                    key={meal}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMealMenu(null);
                                                        handleAddFood(item, meal);
                                                    }}
                                                    className="w-full py-3 px-4 border-b border-gray-50 last:border-0 hover:bg-[#F0FDF4] active:bg-[#E8F5EE] cursor-pointer flex items-center transition-colors"
                                                >
                                                    <span className="text-[#14AE5C] text-[12px] font-bold tracking-wide">{meal}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodSearchScreen;
