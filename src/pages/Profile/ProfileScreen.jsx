import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logoIcon from '../../assets/icons/logo-icon.png';
import profileImg from '../../assets/images/profile.png';
import { fetchCurrentUser, updatePhysicalProfile } from '../../services/auth';
import { getProfilePhoto, getTargetDate, getUserProfile, saveProfilePhoto, saveUserProfile, calculateNutritionTargets, normalizeActivity, normalizeGoal, activityLabels } from '../../utils/userProfileStorage';

const normalizeGender = (gender = 'pria') => String(gender).toLowerCase() === 'wanita' || String(gender).toLowerCase() === 'perempuan'
    ? 'wanita'
    : 'pria';

const buildPhysicalPayload = (profile = {}) => ({
    age: Number(profile.age),
    gender: normalizeGender(profile.gender),
    height: Number(profile.height),
    currentWeight: Number(profile.currentWeight || profile.weight),
    targetWeight: Number(profile.targetWeight || profile.currentWeight || profile.weight),
    activity: normalizeActivity(profile.activity || profile.activityLevel),
    habits: profile.habits || [],
    goal: normalizeGoal(profile.goal)
});

const toIntegerInput = (value) => value.replace(/\D/g, '');

const toDecimalInput = (value) => {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [whole, ...fractionParts] = normalized.split('.');
    return fractionParts.length ? `${whole}.${fractionParts.join('')}` : whole;
};

const CustomDropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative w-full">
            <div 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
                className={`w-full h-10 bg-gray-50 rounded-xl px-3 flex items-center justify-between border ${isOpen ? 'border-[#14AE5C] ring-1 ring-[#14AE5C]' : 'border-gray-100'} transition-all cursor-pointer text-[13px] font-bold text-gray-800`}
            >
                <span>{selectedLabel}</span>
                <Icon icon="mdi:chevron-down" className={`text-lg text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#14AE5C]' : ''}`} />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#14AE5C] rounded-xl shadow-lg z-[70] py-1 max-h-[180px] overflow-y-auto">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
                                className={`px-4 py-2.5 text-[13px] font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-[#E8F5EE] text-[#14AE5C]' : 'text-gray-700 hover:bg-[#14AE5C] hover:text-white'}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ProfileScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const [userProfile, setUserProfile] = useState(() => getUserProfile(userEmail));
    const currentGoal = normalizeGoal(userProfile.goal || 'turunkan');
    const currentPath = location.pathname;
    const profilePhoto = getProfilePhoto(userEmail, userProfile) || profileImg;
    const photoInputRef = useRef(null);

    const [activePopover, setActivePopover] = useState(null);
    const [toast, setToast] = useState({ show: false, title: '', message: '', icon: '' });
    
    const [isNotifOn, setIsNotifOn] = useState(true);

    const [editGoalForm, setEditGoalForm] = useState({
        goal: currentGoal,
        targetWeight: userProfile.targetWeight || ''
    });
    const [editDataForm, setEditDataForm] = useState({
        gender: normalizeGender(userProfile.gender),
        age: userProfile.age || '',
        height: userProfile.height || '',
        currentWeight: userProfile.currentWeight || '',
        activity: normalizeActivity(userProfile.activity || userProfile.activityLevel)
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        let isActive = true;
        fetchCurrentUser()
            .then((profile) => {
                if (!isActive) return;
                const mergedProfile = {
                    ...userProfile,
                    ...profile,
                    goal: normalizeGoal(profile.goal || userProfile.goal),
                    activity: normalizeActivity(profile.activity || userProfile.activity),
                    profilePhoto: userProfile.profilePhoto || profile.profilePhoto || ''
                };
                saveUserProfile(userEmail, mergedProfile);
                setUserProfile(mergedProfile);
            })
            .catch((error) => {
                console.warn('Gagal mengambil profil terbaru:', error.message);
            });

        return () => {
            isActive = false;
        };
    }, [userEmail]);

    const showToast = (title, message, icon = 'mdi:information-variant') => {
        setToast({ show: true, title, message, icon });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    const togglePopover = (id) => {
        setActivePopover(prev => prev === id ? null : id);
        if (id === 'edit-goal') setEditGoalForm({ goal: currentGoal, targetWeight: userProfile.targetWeight || '' });
        if (id === 'edit-data') setEditDataForm({
            gender: normalizeGender(userProfile.gender),
            age: userProfile.age || '',
            height: userProfile.height || '',
            currentWeight: userProfile.currentWeight || '',
            activity: normalizeActivity(userProfile.activity || userProfile.activityLevel)
        });
    };

    const handleNotifToggle = () => {
        const newState = !isNotifOn;
        setIsNotifOn(newState);
        showToast('Notifikasi', `Pengaturan notifikasi berhasil di${newState ? 'aktifkan' : 'matikan'}.`, newState ? 'mdi:bell-ring-outline' : 'mdi:bell-off-outline');
    };

    const saveProfileWithAiTarget = async (nextProfile, successMessage) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            saveUserProfile(userEmail, nextProfile);
            setUserProfile(nextProfile);
            setActivePopover(null);
            showToast('Tersimpan Lokal', successMessage, 'mdi:check-circle');
            return;
        }

        const responseProfile = await updatePhysicalProfile(buildPhysicalPayload(nextProfile));
        const updatedProfile = {
            ...nextProfile,
            ...responseProfile,
            goal: normalizeGoal(responseProfile.goal || nextProfile.goal),
            activity: normalizeActivity(responseProfile.activity || nextProfile.activity),
            aiTarget: responseProfile.aiTarget || nextProfile.aiTarget || null,
            profilePhoto: nextProfile.profilePhoto || userProfile.profilePhoto || ''
        };
        saveUserProfile(userEmail, updatedProfile);
        setUserProfile(updatedProfile);
        setActivePopover(null);
        showToast('Berhasil', successMessage, 'mdi:check-circle');
    };

    const handleSaveGoal = async () => {
        const updatedProfile = { ...userProfile, goal: editGoalForm.goal, targetWeight: editGoalForm.targetWeight };
        try {
            await saveProfileWithAiTarget(updatedProfile, 'Goal, target, dan target harian AI berhasil diperbarui!');
        } catch (error) {
            showToast('Gagal Menyimpan', error.message || 'Pastikan backend dan AI service berjalan.', 'mdi:alert-circle-outline');
        }
    };

    const handleSaveData = async () => {
        const updatedProfile = { ...userProfile, ...editDataForm };
        try {
            await saveProfileWithAiTarget(updatedProfile, 'Data tubuh dan target harian AI berhasil diperbarui!');
        } catch (error) {
            showToast('Gagal Menyimpan', error.message || 'Pastikan backend dan AI service berjalan.', 'mdi:alert-circle-outline');
        }
    };

    const handleProfilePhotoUpload = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showToast('Format Tidak Didukung', 'Pilih file gambar JPG atau PNG saja.', 'mdi:alert-circle-outline');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('File Terlalu Besar', 'Ukuran foto profil maksimal 2 MB.', 'mdi:alert-circle-outline');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const profilePhoto = String(reader.result || '');
            const updatedProfile = { ...userProfile, profilePhoto };
            saveProfilePhoto(userEmail, profilePhoto);
            setUserProfile(updatedProfile);
            showToast('Foto Profil Tersimpan', 'Foto profil berhasil diperbarui.', 'mdi:check-circle');
        };
        reader.onerror = () => {
            showToast('Gagal Membaca File', 'Coba pilih foto lain.', 'mdi:alert-circle-outline');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveProfilePhoto = () => {
        const updatedProfile = { ...userProfile, profilePhoto: '' };
        saveProfilePhoto(userEmail, '');
        setUserProfile(updatedProfile);
        showToast('Foto Profil Dihapus', 'Foto profil kembali ke gambar bawaan.', 'mdi:check-circle');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const targets = calculateNutritionTargets(userProfile, currentGoal);
    const userName = userEmail ? userEmail.split('@')[0] : 'Pengguna';

    const ContextPopover = ({ id, title, content, position = "bottom-full mb-3 left-0", origin = "origin-bottom-left" }) => {
        if (activePopover !== id) return null;
        return (
            <div className={`absolute ${position} w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-5 z-[100] animate-scaleIn ${origin} cursor-default text-left`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#F0FDF4] rounded-full flex items-center justify-center border border-[#DCFCE7] flex-shrink-0">
                        <Icon icon="mdi:information-variant" className="text-lg text-[#14AE5C]" />
                    </div>
                    <h4 className="text-[14px] font-extrabold text-gray-800">{title}</h4>
                </div>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed">{content}</p>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative' onClick={() => setActivePopover(null)}>
            
            <div className={`fixed z-[999] transition-all duration-500 transform ${toast.show ? 'top-10 opacity-100 translate-y-0' : '-top-20 opacity-0 -translate-y-full'} left-1/2 -translate-x-1/2 lg:left-auto lg:-translate-x-0 lg:right-10 flex items-start gap-4 bg-white px-5 md:px-6 py-4 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 w-[90%] max-w-[360px]`}>
                <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center border border-[#DCFCE7] flex-shrink-0 mt-0.5">
                    <Icon icon={toast.icon} className="text-xl text-[#14AE5C]" />
                </div>
                <div className="flex flex-col text-left">
                    <h4 className="text-[14px] font-extrabold text-gray-800">{toast.title}</h4>
                    <p className="text-[12px] font-medium text-gray-500 mt-1 leading-relaxed">{toast.message}</p>
                </div>
            </div>

            <nav className="hidden md:flex fixed top-0 w-full h-[84px] bg-white shadow-sm border-b border-gray-100 z-50 justify-center">
                <div className="w-full max-w-[1400px] px-6 lg:px-8 flex justify-between items-center h-full gap-4">
                    <div className="flex items-center cursor-pointer gap-3 flex-shrink-0" onClick={() => navigate('/dashboard')}>
                        <img src={logoIcon} alt="Logo" className="w-[36px] h-[36px] lg:w-[42px] lg:h-[42px] object-contain" />
                        <h1 className="text-[20px] lg:text-[24px] font-extrabold text-[#14AE5C] tracking-tight">EatSistent</h1>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-[100px] p-1 border border-gray-100 shadow-inner flex-shrink-0 overflow-x-auto hide-scrollbar">
                        {[
                            { path: '/dashboard', label: 'Beranda' },
                            { path: '/diary', label: 'Diary' },
                            { path: '/progress', label: 'Progress' },
                            { path: '/insight', label: 'Insight' }
                        ].map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })}
                                className={`px-5 lg:px-7 py-2 lg:py-2.5 rounded-[100px] text-[13px] lg:text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${
                                    currentPath === item.path
                                    ? 'bg-white text-[#14AE5C] shadow-md transform scale-100' 
                                    : 'text-gray-500 hover:text-[#14AE5C] hover:bg-gray-100 scale-95'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                        <div className="relative z-50">
                            <button 
                                onClick={(e) => { e.stopPropagation(); togglePopover('nav-catat'); }}
                                className="bg-[#14AE5C] text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-[100px] text-[13px] lg:text-[14px] font-bold flex items-center gap-2 hover:bg-[#108e4b] transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                                <Icon icon="mdi:plus-circle-outline" className="text-[18px] lg:text-[20px]" /> Catat Makanan
                            </button>
                            {activePopover === 'nav-catat' && (
                                <div className="absolute right-0 top-full mt-3 w-[220px] lg:w-[240px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 animate-scaleIn origin-top-right text-left" onClick={(e) => e.stopPropagation()}>
                                    <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-[#14AE5C] border border-gray-100"><Icon icon="mdi:magnify" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Cari Manual</span>
                                    </div>
                                    <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex items-center gap-4 p-3 hover:bg-[#F0FDF4] rounded-xl cursor-pointer transition-colors group mt-1">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-[#14AE5C] border border-gray-100"><Icon icon="mdi:barcode-scan" className="text-xl" /></div>
                                        <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#14AE5C] whitespace-nowrap">Scan Barcode</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="w-[1px] h-[30px] bg-gray-200"></div>

                        <div className="relative cursor-pointer z-50">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm" onClick={(e) => { e.stopPropagation(); togglePopover('nav-notif'); }}>
                                <Icon icon="mdi:bell-outline" className="text-[20px] lg:text-[22px] text-gray-600" />
                            </div>
                            <span className="absolute top-[0px] right-[2px] w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] bg-red-500 rounded-full border-[2px] lg:border-[2.5px] border-white"></span>
                            <ContextPopover id="nav-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                        </div>

                        <div 
                            onClick={() => navigate('/profile', { state: { goal: currentGoal, email: userEmail } })}
                            className={`w-[40px] h-[40px] lg:w-[44px] lg:h-[44px] rounded-full border-[2.5px] cursor-pointer transition-all overflow-hidden shadow-sm flex-shrink-0 ${currentPath === '/profile' ? 'border-[#14AE5C]' : 'border-gray-100 hover:border-[#14AE5C]'}`}
                        >
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="md:hidden fixed top-0 w-full h-[75px] bg-white shadow-sm border-b border-gray-100 z-50 flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <img src={logoIcon} alt="Logo" className="w-[34px] h-[34px] object-contain" />
                    <h1 className="text-[22px] font-extrabold text-[#14AE5C]">EatSistent</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer z-50">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100" onClick={(e) => { e.stopPropagation(); togglePopover('mobile-notif'); }}>
                            <Icon icon="mdi:bell-outline" className="text-xl text-gray-600" />
                        </div>
                        <span className="absolute top-[0px] right-[2px] w-[12px] h-[12px] bg-red-500 rounded-full border-[2.5px] border-white"></span>
                        <ContextPopover id="mobile-notif" title="Notifikasi" content="Belum ada notifikasi baru hari ini. Terus pantau progress harianmu!" position="top-full mt-3 right-0" origin="origin-top-right" />
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pt-[100px] md:pt-[130px] pb-[120px] md:pb-16 flex flex-col items-center">
                
                <div className="bg-white md:bg-transparent rounded-[24px] md:rounded-none p-5 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none mb-6 md:mb-10 w-full flex flex-row md:flex-col items-center md:justify-center gap-4 md:gap-0 relative">
                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleProfilePhotoUpload}
                    />
                    <div 
                        className="relative flex-shrink-0 cursor-pointer group"
                        onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}
                    >
                        <div className="w-[64px] h-[64px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden border-2 md:border-4 border-gray-50 md:border-white shadow-sm md:shadow-md md:mb-4 relative">
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            <div className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon icon="mdi:camera-outline" className="text-white text-2xl" />
                            </div>
                        </div>
                        <div className="md:hidden absolute bottom-0 right-0 bg-[#14AE5C] w-[24px] h-[24px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Icon icon="mdi:camera-outline" className="text-white text-[12px]" />
                        </div>
                    </div>

                    <div className="flex flex-col md:items-center">
                        <h2 className="text-[18px] md:text-[28px] font-extrabold text-gray-800 leading-tight">{userName}</h2>
                        <p className="text-[12px] md:text-[14px] text-gray-500 font-medium md:mt-1">{userEmail || 'email belum tersedia'}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}
                                className="h-9 px-4 rounded-full bg-[#14AE5C] text-white text-[12px] font-extrabold flex items-center gap-2 hover:bg-[#108e4b] active:scale-95 transition-all"
                            >
                                <Icon icon="mdi:camera-plus-outline" className="text-base" />
                                Ubah Foto
                            </button>
                            {userProfile.profilePhoto && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveProfilePhoto(); }}
                                    className="h-9 px-4 rounded-full bg-red-50 text-red-500 text-[12px] font-extrabold flex items-center gap-2 hover:bg-red-100 active:scale-95 transition-all"
                                >
                                    <Icon icon="mdi:trash-can-outline" className="text-base" />
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid 2 Kolom untuk area konten */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    
                    {/* Kolom Kiri */}
                    <div className="flex flex-col gap-6 lg:gap-8 w-full">
                        
                        <div className="w-full bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] md:text-[14px] font-bold text-gray-500 tracking-wider uppercase">GOAL & TARGET</h3>
                                <div className="relative z-30">
                                    <button onClick={(e) => { e.stopPropagation(); togglePopover('edit-goal'); }} className="flex items-center gap-1.5 text-[#14AE5C] text-[13px] md:text-[14px] font-bold hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full hover:bg-[#F0FDF4]">
                                        <Icon icon="mdi:pencil" /> Edit
                                    </button>
                                    {activePopover === 'edit-goal' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-2 w-[280px] md:w-[320px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-5 animate-scaleIn origin-top-right text-left cursor-default">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[15px] font-extrabold text-gray-800">Edit Goal & Target</h4>
                                                <Icon icon="mdi:close" className="text-xl text-gray-400 cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); setActivePopover(null); }} />
                                            </div>
                                            <div className="flex flex-col gap-3 mb-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500">Goal Utama</label>
                                                    <CustomDropdown 
                                                        value={editGoalForm.goal} 
                                                        onChange={(val) => setEditGoalForm({...editGoalForm, goal: val})} 
                                                        options={[
                                                            { value: 'turunkan', label: 'Turunkan Berat Badan' },
                                                            { value: 'jaga', label: 'Jaga Berat Badan' },
                                                            { value: 'tambah', label: 'Naikkan Berat Badan' }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500">Target Berat (kg)</label>
                                                    <input 
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={editGoalForm.targetWeight} 
                                                        onChange={(e) => setEditGoalForm({...editGoalForm, targetWeight: toDecimalInput(e.target.value)})} 
                                                        placeholder="Misal: 55" 
                                                        className="w-full h-10 bg-gray-50 rounded-xl px-3 text-[13px] font-bold text-gray-800 border border-gray-100 focus:border-[#14AE5C] focus:ring-1 focus:ring-[#14AE5C] outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleSaveGoal(); }} className="w-full py-2.5 bg-[#14AE5C] hover:bg-[#108e4b] text-white rounded-[14px] text-[13px] font-bold shadow-md active:scale-95 transition-all">
                                                Simpan Perubahan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center mb-8 flex flex-col items-center">
                                <div className="w-[60px] h-[60px] bg-[#E8F5EE] rounded-full flex items-center justify-center mb-4">
                                    <Icon icon="mdi:target" className="text-[32px] text-[#14AE5C]" />
                                </div>
                                <h4 className="text-[18px] md:text-[22px] font-extrabold text-gray-800 mb-1">
                                    {currentGoal === 'turunkan' ? 'Turunkan Berat Badan' : currentGoal === 'tambah' ? 'Naikkan Berat Badan' : 'Jaga Berat Badan'}
                                </h4>
                                <p className="text-[13px] text-gray-500 font-medium">
                                    {currentGoal === 'turunkan' ? 'Defisit berbasis model AI' : currentGoal === 'tambah' ? 'Surplus berbasis model AI' : 'Target seimbang berbasis model AI'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 md:gap-y-8 border-t border-gray-100 pt-6">
                                <div className="flex flex-col gap-1 text-left border-r border-gray-100">
                                    <span className="text-[11px] font-bold text-gray-500">Target Berat</span>
                                    <span className="text-[16px] md:text-[18px] font-extrabold text-gray-800 flex items-center gap-2">
                                        {userProfile.targetWeight ? `${userProfile.targetWeight} kg` : '- kg'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 text-left pl-4 md:pl-6">
                                    <span className="text-[11px] font-bold text-gray-500">Target Tanggal</span>
                                    <span className="text-[16px] md:text-[18px] font-extrabold text-gray-800">{getTargetDate(userProfile)}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-left border-r border-gray-100">
                                    <span className="text-[11px] font-bold text-gray-500">TDEE (Perkiraan)</span>
                                    <span className="text-[16px] md:text-[18px] font-extrabold text-gray-800">{targets.tdee ? `${targets.tdee.toLocaleString('id-ID')} kkal` : '- kkal'}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-left pl-4 md:pl-6">
                                    <span className="text-[11px] font-bold text-gray-500">Target Harian</span>
                                    <span className="text-[16px] md:text-[18px] font-extrabold text-[#14AE5C]">{targets.calories ? `${targets.calories.toLocaleString('id-ID')} kkal` : '- kkal'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 relative">
                            <h3 className="text-[12px] md:text-[14px] font-bold text-gray-500 tracking-wider uppercase mb-2">PREFERENSI</h3>
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center py-5 border-b border-gray-50 cursor-pointer group" onClick={(e) => { e.stopPropagation(); handleNotifToggle(); }}>
                                    <div className="flex items-center gap-3">
                                        <Icon icon={isNotifOn ? "mdi:bell-outline" : "mdi:bell-off-outline"} className={`text-[20px] ${isNotifOn ? 'text-[#14AE5C]' : 'text-gray-500'} group-hover:text-[#14AE5C] transition-colors`} />
                                        <span className="text-[14px] font-bold text-gray-800">Notifikasi</span>
                                    </div>
                                    <div className={`w-[42px] h-[24px] rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${isNotifOn ? 'bg-[#14AE5C]' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-all duration-300 ${isNotifOn ? 'right-[2px]' : 'left-[2px]'}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-gray-50 cursor-pointer group" onClick={(e) => { e.stopPropagation(); showToast('Satuan', 'Pengaturan satuan berhasil disimpan.', 'mdi:weight-kilogram'); }}>
                                    <div className="flex items-center gap-3">
                                        <Icon icon="mdi:weight-kilogram" className="text-[20px] text-gray-500 group-hover:text-[#14AE5C] transition-colors" />
                                        <span className="text-[14px] font-bold text-gray-800">Satuan</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                                        kg, cm, kkal <Icon icon="mdi:chevron-right" className="text-lg text-gray-300 group-hover:text-[#14AE5C] transition-colors" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 cursor-pointer group" onClick={(e) => { e.stopPropagation(); showToast('Bahasa', 'Bahasa berhasil diubah.', 'mdi:translate'); }}>
                                    <div className="flex items-center gap-3">
                                        <Icon icon="mdi:translate" className="text-[20px] text-gray-500 group-hover:text-[#14AE5C] transition-colors" />
                                        <span className="text-[14px] font-bold text-gray-800">Bahasa</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                                        Indonesia <Icon icon="mdi:chevron-right" className="text-lg text-gray-300 group-hover:text-[#14AE5C] transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Kolom Kanan */}
                    <div className="flex flex-col gap-6 lg:gap-8 w-full">
                        
                        <div className="w-full bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] md:text-[14px] font-bold text-gray-500 tracking-wider uppercase">DATA TUBUH</h3>
                                <div className="relative z-20">
                                    <button onClick={(e) => { e.stopPropagation(); togglePopover('edit-data'); }} className="flex items-center gap-1.5 text-[#14AE5C] text-[13px] md:text-[14px] font-bold hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full hover:bg-[#F0FDF4]">
                                        <Icon icon="mdi:pencil" /> Edit
                                    </button>
                                    {activePopover === 'edit-data' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-2 w-[280px] md:w-[320px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-5 animate-scaleIn origin-top-right text-left cursor-default">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[15px] font-extrabold text-gray-800">Edit Data Tubuh</h4>
                                                <Icon icon="mdi:close" className="text-xl text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setActivePopover(null)} />
                                            </div>
                                            <div className="flex flex-col gap-3 mb-5">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[11px] font-bold text-gray-500">Usia (Tahun)</label>
                                                        <input type="text" inputMode="numeric" value={editDataForm.age} onChange={(e) => setEditDataForm({...editDataForm, age: toIntegerInput(e.target.value)})} className="w-full h-10 bg-gray-50 rounded-xl px-3 text-[13px] font-bold text-gray-800 border border-gray-100 focus:border-[#14AE5C] focus:ring-1 focus:ring-[#14AE5C] outline-none transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[11px] font-bold text-gray-500">Tinggi (cm)</label>
                                                        <input type="text" inputMode="numeric" value={editDataForm.height} onChange={(e) => setEditDataForm({...editDataForm, height: toIntegerInput(e.target.value)})} className="w-full h-10 bg-gray-50 rounded-xl px-3 text-[13px] font-bold text-gray-800 border border-gray-100 focus:border-[#14AE5C] focus:ring-1 focus:ring-[#14AE5C] outline-none transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[11px] font-bold text-gray-500">Berat (kg)</label>
                                                        <input type="text" inputMode="decimal" value={editDataForm.currentWeight} onChange={(e) => setEditDataForm({...editDataForm, currentWeight: toDecimalInput(e.target.value)})} className="w-full h-10 bg-gray-50 rounded-xl px-3 text-[13px] font-bold text-gray-800 border border-gray-100 focus:border-[#14AE5C] focus:ring-1 focus:ring-[#14AE5C] outline-none transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[11px] font-bold text-gray-500">Gender</label>
                                                        <CustomDropdown
                                                            value={editDataForm.gender}
                                                            onChange={(val) => setEditDataForm({...editDataForm, gender: val})}
                                                            options={[
                                                                { value: 'pria', label: 'Pria' },
                                                                { value: 'wanita', label: 'Wanita' }
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500">Tingkat Aktivitas</label>
                                                    <CustomDropdown 
                                                        value={editDataForm.activity}
                                                        onChange={(val) => setEditDataForm({...editDataForm, activity: val})}
                                                        options={[
                                                            { value: 'rendah', label: 'Tidak Terlalu Aktif' },
                                                            { value: 'sedang', label: 'Agak Aktif' },
                                                            { value: 'aktif', label: 'Aktif' },
                                                            { value: 'sangat', label: 'Sangat Aktif' }
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleSaveData(); }} className="w-full py-2.5 bg-[#14AE5C] hover:bg-[#108e4b] text-white rounded-[14px] text-[13px] font-bold shadow-md active:scale-95 transition-all">
                                                Simpan Perubahan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {[
                                    { label: 'Tanggal Lahir', value: userProfile.age ? `${new Date().getFullYear() - userProfile.age}` : '-' },
                                    { label: 'Tinggi Badan', value: userProfile.height ? `${userProfile.height} cm` : '-' },
                                    { label: 'Berat Badan Saat Ini', value: userProfile.currentWeight ? `${userProfile.currentWeight} kg` : '-' },
                                    { label: 'Aktivitas', value: activityLabels[normalizeActivity(userProfile.activity || userProfile.activityLevel)] || '-' }
                                ].map((item, idx) => (
                                    <div key={idx} className={`flex justify-between items-center py-4 ${idx !== 3 ? 'border-b border-gray-50' : ''}`}>
                                        <span className="text-[14px] font-bold text-gray-600">{item.label}</span>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px]">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="w-full bg-white border border-gray-100 text-red-500 rounded-[28px] p-5 flex items-center justify-center gap-3 hover:bg-red-50 hover:border-red-100 transition-all font-extrabold text-[15px] shadow-sm active:scale-[0.98]"
                        >
                            Keluar Akun <Icon icon="mdi:logout" className="text-xl" />
                        </button>

                    </div>
                </div>

            </main>

            <footer className="hidden md:block w-full bg-[#FAFAFA] border-t border-gray-200 pt-16 pb-8 mt-auto z-30 relative text-left">
                <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                        <div className="flex-1 max-w-lg">
                            <div className="flex items-center gap-3 mb-5">
                                <img src={logoIcon} alt="Logo" className="w-[40px] h-[40px] object-contain" />
                                <h2 className="text-[24px] font-extrabold text-[#14AE5C]">EatSistent</h2>
                            </div>
                            <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">
                                Membangun masa depan yang lebih sehat melalui teknologi kecerdasan buatan. Kami hadir untuk membantu kamu mencapai target nutrisi harian secara cerdas dan efisien.
                            </p>
                            <div className="relative w-fit">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); togglePopover('footer-email'); }} 
                                    className="flex items-center gap-2 text-[14px] font-bold text-gray-500 hover:text-[#14AE5C] cursor-pointer w-fit transition-colors"
                                >
                                    <Icon icon="mdi:email-outline" className="text-xl" /> eatsistent@gmail.com
                                </div>
                                <ContextPopover id="footer-email" title="Hubungi Kami" content="Punya pertanyaan atau masukan? Jangan ragu untuk menghubungi tim dukungan kami melalui email eatsistent@gmail.com." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                            </div>
                        </div>

                        <div className="flex-1 max-w-xs text-left">
                            <h4 className="text-[14px] font-extrabold text-gray-800 tracking-widest mb-6 uppercase">Bantuan</h4>
                            <div className="flex flex-col gap-4 text-[14px] font-semibold text-gray-500 items-start">
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-privacy'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Kebijakan Privasi</span>
                                    <ContextPopover id="footer-privacy" title="Kebijakan Privasi" content="Informasi selengkapnya terkait Kebijakan Privasi sedang dalam tahap pengembangan dan akan segera kami perbarui. Terima kasih atas pengertiannya." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-terms'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Syarat & Ketentuan</span>
                                    <ContextPopover id="footer-terms" title="Syarat & Ketentuan" content="Halaman Syarat & Ketentuan layanan EatSistent sedang dirancang untuk memberikan kenyamanan dan keamanan terbaik bagi pengguna." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                                <div className="relative w-fit">
                                    <span onClick={(e) => { e.stopPropagation(); togglePopover('footer-nutrition'); }} className="cursor-pointer hover:text-[#14AE5C] transition-colors w-fit">Dasar Nutrisi</span>
                                    <ContextPopover id="footer-nutrition" title="Dasar Nutrisi" content="Panduan lengkap mengenai literatur dan Dasar Nutrisi akan segera hadir untuk menambah wawasan kesehatan Anda." position="bottom-full mb-3 left-0" origin="origin-bottom-left" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-[13px] font-bold text-gray-400 border-t border-gray-200 pt-8">
                        © 2026 EatSistent. All rights reserved.
                    </div>
                </div>
            </footer>

            {activePopover === 'mobile-catat' && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] md:hidden" onClick={() => setActivePopover(null)}></div>
                    <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white rounded-[28px] p-6 shadow-2xl z-[101] md:hidden animate-scaleIn origin-bottom text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[18px] font-extrabold text-gray-800">Pilih Mode Pencatatan</h3>
                            <button onClick={() => setActivePopover(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors border border-gray-100">
                                <Icon icon="mdi:close" className="text-xl" />
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <div onClick={() => navigate('/cari-makanan', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100">
                                    <Icon icon="mdi:magnify" />
                                </div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center">Cari<br/>Manual</span>
                            </div>
                            <div onClick={() => navigate('/scan-barcode', { state: { goal: currentGoal, email: userEmail } })} className="flex-1 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#F0FDF4] hover:border-[#14AE5C] border-2 border-transparent transition-all shadow-sm">
                                <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center text-[#14AE5C] text-2xl shadow-sm border border-gray-100">
                                    <Icon icon="mdi:barcode-scan" />
                                </div>
                                <span className="text-[13px] font-extrabold text-gray-700 text-center leading-tight">Scan<br/>Barcode</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="md:hidden fixed bottom-0 left-0 w-full z-40">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); togglePopover('mobile-catat'); }} 
                        className="w-[72px] h-[72px] bg-[#14AE5C] rounded-full flex justify-center items-center text-white text-4xl shadow-[0_8px_20px_rgba(20,174,92,0.4)] hover:scale-105 active:scale-95 transition-transform border-[6px] border-white"
                    >
                        <Icon icon={activePopover === 'mobile-catat' ? 'mdi:close' : 'mdi:plus'} className={`transition-transform duration-300 ${activePopover === 'mobile-catat' ? 'rotate-90' : ''}`} />
                    </button>
                </div>
                
                <div className="w-full h-[80px] bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.06)] rounded-t-[28px] flex justify-between items-center px-6 z-40 relative">
                    {[
                        { path: '/dashboard', icon: 'mdi:home', label: 'Beranda' },
                        { path: '/diary', icon: 'mdi:notebook', label: 'Diary' },
                        { spacer: true },
                        { path: '/progress', icon: 'mdi:chart-bar', label: 'Progress' },
                        { path: '/insight', icon: 'mdi:chart-line', label: 'Insight' }
                    ].map((item, idx) => (
                        item.spacer ? (
                            <div key="spacer" className="w-[60px]"></div>
                        ) : (
                            <div 
                                key={idx} 
                                onClick={() => navigate(item.path, { state: { goal: currentGoal, email: userEmail } })} 
                                className="flex flex-col items-center gap-1.5 cursor-pointer w-[50px] pt-2"
                            >
                                <Icon 
                                    icon={item.icon} 
                                    className={`text-[26px] transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-300'}`} 
                                />
                                <span className={`text-[11px] font-extrabold transition-colors ${currentPath === item.path ? 'text-[#14AE5C]' : 'text-gray-400'}`}>
                                    {item.label}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default ProfileScreen;
