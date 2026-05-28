const PROFILE_DRAFT_KEY = 'userProfileDraft';

export const goalMap = {
    turunkan: 'LOSE_WEIGHT',
    tambah: 'GAIN_WEIGHT',
    jaga: 'MAINTAIN',
    LOSE_WEIGHT: 'turunkan',
    GAIN_WEIGHT: 'tambah',
    MAINTAIN: 'jaga'
};

export const activityLabels = {
    rendah: 'Tidak terlalu aktif',
    sedang: 'Agak aktif',
    aktif: 'Aktif',
    sangat: 'Sangat aktif'
};

const activityFactors = {
    rendah: 1.2,
    sedang: 1.375,
    aktif: 1.55,
    sangat: 1.725
};

export const getProfileKey = (email = '') => `userProfile:${email || 'guest'}`;

const safeParse = (value, fallback = null) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

export const getProfileDraft = () => safeParse(localStorage.getItem(PROFILE_DRAFT_KEY), {});

export const saveProfileDraft = (profile = {}) => {
    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify({ ...getProfileDraft(), ...profile }));
};

export const saveUserProfile = (email = '', profile = {}) => {
    const existing = getUserProfile(email);
    localStorage.setItem(getProfileKey(email), JSON.stringify({ ...existing, ...profile }));
};

export const getUserProfile = (email = '') => {
    const byEmail = safeParse(localStorage.getItem(getProfileKey(email)), null);
    if (byEmail) return byEmail;
    return getProfileDraft();
};

export const normalizeGoal = (goal = 'turunkan') => goalMap[goal] || goal || 'turunkan';

export const getGoalLabel = (goal = 'turunkan') => {
    const normalized = normalizeGoal(goal);
    if (normalized === 'tambah') return 'Tambah Berat Badan';
    if (normalized === 'jaga') return 'Jaga Berat Badan';
    return 'Turunkan Berat Badan';
};

export const getGoalDescription = (goal = 'turunkan') => {
    const normalized = normalizeGoal(goal);
    if (normalized === 'tambah') return 'Surplus kalori bertahap';
    if (normalized === 'jaga') return 'Menjaga kalori seimbang';
    return 'Defisit kalori bertahap';
};

export const calculateNutritionTargets = (profile = {}, goalFallback = 'turunkan') => {
    const goal = normalizeGoal(profile.goal || goalFallback);
    if (!profile.age || !profile.height || !(profile.currentWeight || profile.weight)) {
        return { goal, tdee: 0, calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const gender = profile.gender || 'pria';
    const age = Number(profile.age || 25);
    const height = Number(profile.height || 165);
    const weight = Number(profile.currentWeight || profile.weight || 60);
    const factor = activityFactors[profile.activity] || activityFactors.sedang;
    const bmr = gender === 'wanita'
        ? (10 * weight) + (6.25 * height) - (5 * age) - 161
        : (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const tdee = Math.round(bmr * factor);
    const aiCalories = Number(profile.aiTarget?.target_kalori || profile.aiTarget?.calories || 0);
    const calorieTarget = aiCalories > 0
        ? Math.round(aiCalories)
        : Math.max(1200, Math.round(tdee + (goal === 'tambah' ? 300 : goal === 'turunkan' ? -500 : 0)));
    const protein = Math.round(weight * (goal === 'tambah' ? 1.8 : 1.6));
    const fat = Math.round((calorieTarget * 0.25) / 9);
    const carbs = Math.max(0, Math.round((calorieTarget - (protein * 4) - (fat * 9)) / 4));

    return { goal, tdee, calories: calorieTarget, protein, carbs, fat };
};

export const getTargetDate = (profile = {}) => {
    const currentWeight = Number(profile.currentWeight || profile.weight || 0);
    const targetWeight = Number(profile.targetWeight || currentWeight || 0);
    const diff = Math.abs(currentWeight - targetWeight);
    if (!diff) return '-';

    const weeks = Math.max(1, Math.ceil(diff / 0.5));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeks * 7));
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(targetDate);
};
