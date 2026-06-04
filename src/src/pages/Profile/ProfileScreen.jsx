import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import profileImg from '../../assets/images/profile.png';
import { activityLabels, calculateNutritionTargets, getGoalDescription, getGoalLabel, getTargetDate, getUserProfile, normalizeGoal, saveUserProfile } from '../../utils/userProfileStorage';
import { fetchCurrentUser, updatePhysicalProfile } from '../../services/auth';

const toIntegerInput = (value) => value.replace(/\D/g, '');

const toDecimalInput = (value) => {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [whole, ...fractionParts] = normalized.split('.');
    return fractionParts.length ? `${whole}.${fractionParts.join('')}` : whole;
};

const ProfileScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail));
    const currentGoal = normalizeGoal(userProfile.goal || location.state?.goal || 'turunkan');
    const userName = userEmail ? userEmail.split('@')[0] : 'Pengguna';
    const currentPath = location.pathname;
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState(() => ({
        goal: currentGoal,
        targetWeight: userProfile.targetWeight || '',
        currentWeight: userProfile.currentWeight || userProfile.weight || '',
        height: userProfile.height || '',
        age: userProfile.age || '',
        gender: userProfile.gender || 'pria',
        activity: userProfile.activity || 'sedang'
    }));
    
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const currentWeight = Number(userProfile.currentWeight || userProfile.weight || 0);
    const targetWeight = Number(userProfile.targetWeight || currentWeight || 0);
    const weightDiff = Math.abs(currentWeight - targetWeight);

    useEffect(() => {
        if (location.state?.email) {
            localStorage.setItem('userEmail', location.state.email);
        }
    }, [location.state?.email]);

    useEffect(() => {
        if (!localStorage.getItem('authToken')) return;
        fetchCurrentUser()
            .then((profile) => {
                const normalized = { ...profile, goal: normalizeGoal(profile.goal || currentGoal) };
                saveUserProfile(userEmail, normalized);
                setUserProfile(normalized);
                setEditForm((prev) => ({ ...prev, ...normalized, goal: normalizeGoal(normalized.goal), currentWeight: normalized.currentWeight || '', targetWeight: normalized.targetWeight || '' }));
            })
            .catch((error) => {
                console.warn('Gagal memuat profil dari server:', error.message);
                setUserProfile({});
            });
    }, [userEmail]);

    const handleEditClick = () => {
        setEditForm({
            goal: currentGoal,
            targetWeight: userProfile.targetWeight || '',
            currentWeight: userProfile.currentWeight || userProfile.weight || '',
            height: userProfile.height || '',
            age: userProfile.age || '',
            gender: userProfile.gender || 'pria',
            activity: userProfile.activity || 'sedang'
        });
        setIsEditOpen(true);
    };

    const handleSaveProfile = async () => {
        const payload = {
            ...userProfile,
            ...editForm,
            age: Number(editForm.age),
            height: Number(editForm.height),
            currentWeight: Number(editForm.currentWeight),
            targetWeight: Number(editForm.targetWeight),
            habits: Array.isArray(userProfile.habits) ? userProfile.habits : [],
            goal: editForm.goal
        };

        if (!payload.age || !payload.height || !payload.currentWeight || !payload.targetWeight) {
            alert('Lengkapi usia, tinggi, berat saat ini, dan target berat.');
            return;
        }

        setIsSavingProfile(true);
        try {
            const saved = localStorage.getItem('authToken')
                ? await updatePhysicalProfile(payload)
                : payload;
            const normalized = { ...saved, goal: normalizeGoal(saved.goal || payload.goal) };
            saveUserProfile(userEmail, normalized);
            setUserProfile(normalized);
            setIsEditOpen(false);
        } catch (error) {
            alert(error.message || 'Gagal menyimpan perubahan profil.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-[#F8FAFC] shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-14 px-6 pb-2 flex items-center z-10 flex-shrink-0">
                    <h2 className="text-[24px] font-bold text-black tracking-wide">Profil</h2>
                </div>

                <div className="flex-1 overflow-y-auto pb-[120px] hide-scrollbar px-6 pt-2">
                    
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-8 flex items-center gap-4">
                        <div className="relative w-[64px] h-[64px] flex-shrink-0">
                            <img src={profileImg} className="w-full h-full object-cover rounded-full" alt="Profile" />
                            <div 
                                onClick={handleEditClick}
                                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 flex justify-center items-center text-gray-500 hover:text-[#14AE5C] transition-colors"
                            >
                                <Icon icon="mdi:camera-outline" className="text-[14px]" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[16px] font-bold text-black">{userName}</h3>
                            <p className="text-[12px] font-medium text-gray-500 mt-0.5">{userEmail || 'email belum tersedia'}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">GOAL & TARGET</h3>
                        <span onClick={handleEditClick} className="text-[11px] font-bold text-[#14AE5C] cursor-pointer hover:opacity-70">Edit</span>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex justify-center items-center text-[#14AE5C]">
                                <Icon icon="mdi:target" className="text-2xl" />
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-black">{getGoalLabel(currentGoal)}</p>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">{getGoalDescription(currentGoal)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="border-r border-gray-100 pr-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Berat</p>
                                <p className="text-[15px] font-bold text-black">{targetWeight ? targetWeight.toFixed(1) : '-'} kg</p>
                                <p className="text-[9px] font-bold text-[#14AE5C] mt-0.5">{weightDiff ? `${weightDiff.toFixed(1)} kg lagi` : 'target tercapai'}</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Tanggal</p>
                                <p className="text-[15px] font-bold text-black">{getTargetDate(userProfile)}</p>
                            </div>
                            <div className="col-span-2 border-t border-gray-100 my-0.5"></div>
                            <div className="border-r border-gray-100 pr-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">TDEE (Perkiraan)</p>
                                <p className="text-[15px] font-bold text-black">{targets.tdee ? `${targets.tdee.toLocaleString('id-ID')} kkal` : '-'}</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Harian</p>
                                <p className="text-[15px] font-bold text-black">{targets.calories ? `${targets.calories.toLocaleString('id-ID')} kkal` : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">DATA TUBUH</h3>
                        <span onClick={handleEditClick} className="text-[11px] font-bold text-[#14AE5C] cursor-pointer hover:opacity-70">Edit</span>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Jenis Kelamin</span>
                            <span className="text-[12px] font-bold text-black">{userProfile.gender === 'wanita' ? 'Wanita' : userProfile.gender === 'pria' ? 'Pria' : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Usia</span>
                            <span className="text-[12px] font-bold text-black">{userProfile.age ? `${userProfile.age} tahun` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Tinggi Badan</span>
                            <span className="text-[12px] font-bold text-black">{userProfile.height ? `${userProfile.height} cm` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Berat Badan Saat Ini</span>
                            <span className="text-[12px] font-bold text-black">{currentWeight ? `${currentWeight.toFixed(1)} kg` : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-500">Aktivitas</span>
                            <span className="text-[12px] font-bold text-black">{activityLabels[userProfile.activity] || '-'}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-[12px] font-medium text-gray-500">Kebiasaan</span>
                            <span className="text-[12px] font-bold text-black text-right">{userProfile.habits?.length ? userProfile.habits.slice(0, 3).join(', ') : '-'}</span>
                        </div>
                    </div>

                    <div className="mb-3 px-1">
                        <h3 className="text-[12px] font-bold text-black tracking-wider uppercase">PREFERENSI</h3>
                    </div>
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 flex flex-col gap-6">
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:bell-outline" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Notifikasi</span>
                            </div>
                            <div 
                                onClick={() => setIsNotifEnabled(!isNotifEnabled)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isNotifEnabled ? 'bg-[#14AE5C]' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isNotifEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:weight" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Satuan</span>
                            </div>
                            <span className="text-[12px] font-bold text-gray-400">kg, cm, kkal</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Icon icon="mdi:earth" className="text-xl text-gray-400" />
                                <span className="text-[13px] font-medium text-gray-600">Bahasa</span>
                            </div>
                            <span className="text-[12px] font-bold text-gray-400">Indonesia</span>
                        </div>

                    </div>

                    <button 
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('userEmail');
                            navigate('/welcome');
                        }}
                        className="w-full py-4 text-[#F43F5E] font-bold text-[14px] bg-red-50 rounded-2xl mb-8"
                    >
                        Keluar Akun
                    </button>
                </div>

                {isActionMenuOpen && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex flex-col justify-end items-center pb-[120px]" onClick={() => setIsActionMenuOpen(false)}>
                        <button onClick={() => setIsActionMenuOpen(false)} className="absolute top-10 left-6 text-white text-3xl hover:scale-110 transition-transform"><Icon icon="mdi:close" /></button>
                        <div className="w-[350px] flex justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:magnify" /></div>
                                <span className="text-[13px] font-bold text-black">Catat makanan</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-center items-center gap-4 cursor-pointer hover:border-[#14AE5C] hover:bg-[#F0FDF4]/50 active:border-[#14AE5C] active:bg-[#F0FDF4]/50 transition-all">
                                <div className="w-[50px] h-[50px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-2xl shadow-md"><Icon icon="mdi:barcode-scan" /></div>
                                <span className="text-[13px] font-bold text-black text-center leading-tight">Pemindai Kode Batang</span>
                            </div>
                        </div>
                    </div>
                )}

                {isEditOpen && (
                    <div className="absolute inset-0 bg-black/40 z-[80] flex items-end justify-center" onClick={() => setIsEditOpen(false)}>
                        <div className="w-full bg-white rounded-t-[24px] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[16px] font-bold text-black">Edit Goal & Target</h3>
                                <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                    <Icon icon="mdi:close" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="col-span-2 text-[11px] font-bold text-gray-500">
                                    Goal
                                    <select value={editForm.goal} onChange={(e) => setEditForm((prev) => ({ ...prev, goal: e.target.value }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]">
                                        <option value="turunkan">Turunkan Berat</option>
                                        <option value="tambah">Tambah Berat</option>
                                        <option value="jaga">Jaga Berat</option>
                                    </select>
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Berat Saat Ini
                                    <input type="text" inputMode="decimal" value={editForm.currentWeight} onChange={(e) => setEditForm((prev) => ({ ...prev, currentWeight: toDecimalInput(e.target.value) }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]" />
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Target Berat
                                    <input type="text" inputMode="decimal" value={editForm.targetWeight} onChange={(e) => setEditForm((prev) => ({ ...prev, targetWeight: toDecimalInput(e.target.value) }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]" />
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Usia
                                    <input type="text" inputMode="numeric" value={editForm.age} onChange={(e) => setEditForm((prev) => ({ ...prev, age: toIntegerInput(e.target.value) }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]" />
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Tinggi
                                    <input type="text" inputMode="numeric" value={editForm.height} onChange={(e) => setEditForm((prev) => ({ ...prev, height: toIntegerInput(e.target.value) }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]" />
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Gender
                                    <select value={editForm.gender} onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]">
                                        <option value="pria">Pria</option>
                                        <option value="wanita">Wanita</option>
                                    </select>
                                </label>
                                <label className="text-[11px] font-bold text-gray-500">
                                    Aktivitas
                                    <select value={editForm.activity} onChange={(e) => setEditForm((prev) => ({ ...prev, activity: e.target.value }))} className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold outline-none focus:border-[#14AE5C]">
                                        <option value="rendah">Rendah</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="aktif">Aktif</option>
                                        <option value="sangat">Sangat Aktif</option>
                                    </select>
                                </label>
                            </div>
                            <button onClick={handleSaveProfile} disabled={isSavingProfile} className="mt-5 w-full h-12 rounded-2xl bg-[#14AE5C] text-white text-[13px] font-bold disabled:opacity-60">
                                {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-50">
                    <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="w-[56px] h-[56px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-3xl shadow-[0_4px_12px_rgba(20,174,92,0.5)] hover:scale-105 transition-transform"><Icon icon="mdi:plus" /></button>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-20" style={{ filter: 'drop-shadow(0px -4px 10px rgba(0,0,0,0.05))' }}>
                    <div className="absolute bottom-[35px] left-1/2 -translate-x-1/2 w-[80px] h-[80px] bg-white rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[75px] bg-white flex justify-around items-end pb-3 px-2 rounded-t-[20px]">
                        <div onClick={() => navigate('/dashboard', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:home" className={`text-[24px] ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/dashboard' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Beranda</span>
                        </div>
                        <div onClick={() => navigate('/diary', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:notebook" className={`text-[24px] ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/diary' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Diary</span>
                        </div>
                        <div onClick={() => navigate('/progress', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px] relative z-30 pt-4">
                            <Icon icon="mdi:chart-bar" className={`text-[24px] ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/progress' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Progress</span>
                        </div>
                        <div onClick={() => navigate('/insight', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:chart-line" className={`text-[24px] ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/insight' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Insight</span>
                        </div>
                        <div onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })} className="flex flex-col items-center gap-1 cursor-pointer w-[60px]">
                            <Icon icon="mdi:account-outline" className={`text-[24px] ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-bold ${currentPath === '/profile' ? 'text-[#14AE5C]' : 'text-gray-400'}`}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
