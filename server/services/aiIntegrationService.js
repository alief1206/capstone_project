import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nutritionDatasetPath = path.resolve(__dirname, '../../data-science/data/nutrition_dataset/tkpi_clean_labeled.csv');

const DEFAULT_NUTRITION_URL = 'http://127.0.0.1:8000/predict-nutrition';
const DEFAULT_FOOD_CLASS_URL = 'http://127.0.0.1:8000/predict-food-class';
const LEGACY_AI_URL = process.env.AI_MODEL_URL?.replace('/api/predict', '/predict-nutrition');
const AI_NUTRITION_URL = process.env.AI_NUTRITION_URL || LEGACY_AI_URL || DEFAULT_NUTRITION_URL;
const AI_FOOD_CLASS_URL = process.env.AI_FOOD_CLASS_URL || DEFAULT_FOOD_CLASS_URL;

let nutritionRowsCache = null;

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && next === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
};

const normalizeText = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const chatStopwords = new Set([
    'berapa', 'kalori', 'kkal', 'gizi', 'nutrisi', 'rekomendasi', 'saran',
    'makanan', 'makan', 'menu', 'untuk', 'yang', 'tinggi', 'rendah', 'kaya',
    'cocok', 'apa', 'saya', 'aku', 'kamu', 'hari', 'ini', 'dong', 'tolong',
    'protein', 'serat', 'karbo', 'karbohidrat', 'lemak', 'diet'
]);

const cleanFoodQuery = (value = '') => {
    const tokens = normalizeText(value).split(' ').filter(Boolean);
    const foodTokens = tokens.filter((token) => !chatStopwords.has(token));
    return foodTokens.join(' ') || tokens.join(' ');
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const roundOne = (value) => Math.round((toNumber(value) + Number.EPSILON) * 10) / 10;
const roundTwo = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
const formatNumber = (value) => roundTwo(value).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const loadNutritionRows = () => {
    if (nutritionRowsCache) return nutritionRowsCache;
    if (!fs.existsSync(nutritionDatasetPath)) {
        nutritionRowsCache = [];
        return nutritionRowsCache;
    }

    const [headerLine, ...lines] = fs.readFileSync(nutritionDatasetPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const headers = parseCsvLine(headerLine);

    nutritionRowsCache = lines.map((line) => {
        const values = parseCsvLine(line);
        const row = headers.reduce((acc, header, index) => ({ ...acc, [header]: values[index] }), {});
        return {
            code: row.kode,
            name: row.nama_bahan,
            normalizedName: normalizeText(row.nama_bahan),
            category: row.kategori,
            calories: toNumber(row.energi_kkal),
            protein: toNumber(row.protein_g),
            fat: toNumber(row.lemak_g),
            carbs: toNumber(row.karbohidrat_g),
            fiber: toNumber(row.serat_g),
            label: row.label_kelas
        };
    });

    return nutritionRowsCache;
};

const scoreFoodMatch = (query, row) => {
    if (!query || !row.normalizedName) return 0;
    const queryTokens = query.split(' ').filter((token) => token.length > 2);
    const rowTokens = row.normalizedName.split(' ').filter((token) => token.length > 2);

    if (row.normalizedName === query) return 100;
    if (queryTokens.length && rowTokens.length && rowTokens.every((token) => queryTokens.includes(token))) return 92;
    if (queryTokens.length && queryTokens.every((token) => row.normalizedName.includes(token))) return 90;
    if (row.normalizedName.includes(query)) return 85;

    if (!queryTokens.length) return 0;

    const matched = queryTokens.filter((token) => row.normalizedName.includes(token)).length;
    const baseScore = (matched / queryTokens.length) * 70;
    const rowIsSpecificSubset = rowTokens.length > 0 && rowTokens.every((token) => queryTokens.includes(token));
    const shorterNameBonus = Math.max(0, 8 - rowTokens.length);
    return baseScore + (rowIsSpecificSubset ? 15 : 0) + shorterNameBonus;
};

export const findNutritionFromDataset = (foodName = '') => {
    const query = cleanFoodQuery(foodName);
    const rows = loadNutritionRows();

    return rows
        .map((row) => ({ row, score: scoreFoodMatch(query, row) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)[0]?.row || null;
};

const toCatalogItem = (row) => ({
    id: row.code || row.name,
    name: row.name,
    qty: '100g',
    calories: roundTwo(row.calories),
    cals: `${formatNumber(row.calories)} kkal`,
    protein: roundTwo(row.protein),
    carbs: roundTwo(row.carbs),
    fat: roundTwo(row.fat),
    fiber: roundTwo(row.fiber),
    category: row.category,
    label: row.label
});

export const searchNutritionCatalog = ({ query = '', goal = 'MAINTAIN', limit = 20 } = {}) => {
    const rows = loadNutritionRows().filter((row) => row.name && row.calories > 0);
    const cleanedQuery = cleanFoodQuery(query);

    if (cleanedQuery) {
        return rows
            .map((row) => ({ row, score: scoreFoodMatch(cleanedQuery, row) }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score || a.row.name.length - b.row.name.length)
            .slice(0, limit)
            .map((item) => toCatalogItem(item.row));
    }

    const normalizedGoal = mapGoalForCatalog(goal);
    const goalRows = rows
        .filter((row) => {
            if (normalizedGoal === 'Turun_BB') return row.calories <= 180 && (row.protein >= 3 || row.fiber >= 1 || row.label === 'Rendah_Kalori');
            if (normalizedGoal === 'Tambah_BB') return row.calories >= 150 && (row.protein >= 4 || row.carbs >= 25 || row.fat >= 5);
            return row.calories >= 80 && row.calories <= 260 && (row.protein >= 3 || row.fiber >= 1);
        })
        .sort((a, b) => {
            if (normalizedGoal === 'Turun_BB') return ((b.protein + b.fiber) / Math.max(b.calories, 1)) - ((a.protein + a.fiber) / Math.max(a.calories, 1));
            if (normalizedGoal === 'Tambah_BB') return (b.calories + b.protein * 8) - (a.calories + a.protein * 8);
            return (b.protein + b.fiber) - (a.protein + a.fiber);
        });

    return goalRows.slice(0, limit).map(toCatalogItem);
};

export const getNutritionCatalogRecommendations = ({ goal = 'MAINTAIN', limit = 8 } = {}) => {
    return searchNutritionCatalog({ goal, limit });
};

const postJson = async (url, payload, timeoutMs = 4000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
};

const mapGenderForModel = (gender) => {
    if (String(gender).toLowerCase() === 'wanita') return 'Perempuan';
    return 'Laki-laki';
};

const mapActivityForModel = (activity) => ({
    rendah: 'Tidak terlalu aktif',
    sedang: 'Agak aktif',
    aktif: 'Aktif',
    sangat: 'Sangat aktif'
}[activity] || 'Agak aktif');

const mapGoalForCatalog = (goal) => ({
    LOSE_WEIGHT: 'Turun_BB',
    GAIN_WEIGHT: 'Tambah_BB',
    MAINTAIN: 'Jaga_BB',
    turunkan: 'Turun_BB',
    tambah: 'Tambah_BB',
    jaga: 'Jaga_BB'
}[goal] || 'Jaga_BB');

const mapGoalForModel = (goal) => ({
    LOSE_WEIGHT: 'Turun BB',
    GAIN_WEIGHT: 'Tambah BB',
    MAINTAIN: 'Jaga BB',
    turunkan: 'Turun BB',
    tambah: 'Tambah BB',
    jaga: 'Jaga BB'
}[goal] || 'Jaga BB');

const getGoalLabel = (goal) => ({
    LOSE_WEIGHT: 'menurunkan berat badan',
    GAIN_WEIGHT: 'menaikkan berat badan',
    MAINTAIN: 'menjaga berat badan',
    turunkan: 'menurunkan berat badan',
    tambah: 'menaikkan berat badan',
    jaga: 'menjaga berat badan'
}[goal] || 'menjaga berat badan');

export const predictNutritionTarget = async (user = {}) => {
    if (!user.height || !user.currentWeight || !user.age) return null;

    try {
        const result = await postJson(AI_NUTRITION_URL, {
            tinggi_cm: Number(user.height),
            berat_kg: Number(user.currentWeight),
            usia: Number(user.age),
            jenis_kelamin: mapGenderForModel(user.gender),
            activity_level: mapActivityForModel(user.activity),
            target_user: mapGoalForModel(user.goal)
        });

        return result.prediction || null;
    } catch (error) {
        console.warn('AI nutrition model unavailable:', error.message);
        return null;
    }
};

export const classifyFoodWithModel = async (nutrition = {}) => {
    try {
        const result = await postJson(AI_FOOD_CLASS_URL, {
            data: {
                Energi: nutrition.calories || 0,
                Protein: nutrition.protein || 0,
                Lemak: nutrition.fat || 0,
                Karbohidrat: nutrition.carbs || 0,
                Serat: nutrition.fiber || 0
            }
        });

        return result.prediction || null;
    } catch (error) {
        console.warn('AI food classifier unavailable:', error.message);
        return null;
    }
};

export const buildFoodNutrition = async ({ foodName, calories, user }) => {
    const datasetMatch = findNutritionFromDataset(foodName);
    const providedCalories = toNumber(calories, 0);
    const baseCalories = providedCalories || datasetMatch?.calories || 0;
    const scale = datasetMatch?.calories ? (baseCalories / datasetMatch.calories) : 1;

    const nutrition = {
        calories: roundOne(baseCalories),
        protein: roundOne((datasetMatch?.protein || 0) * scale),
        carbs: roundOne((datasetMatch?.carbs || 0) * scale),
        fat: roundOne((datasetMatch?.fat || 0) * scale),
        fiber: roundOne((datasetMatch?.fiber || 0) * scale),
        source: datasetMatch ? 'data-science TKPI' : 'fallback'
    };

    if (!datasetMatch && baseCalories) {
        nutrition.protein = roundOne((baseCalories * 0.2) / 4);
        nutrition.carbs = roundOne((baseCalories * 0.5) / 4);
        nutrition.fat = roundOne((baseCalories * 0.3) / 9);
    }

    const [targetPrediction, classification] = await Promise.all([
        predictNutritionTarget(user),
        datasetMatch ? classifyFoodWithModel(nutrition) : Promise.resolve(null)
    ]);

    const classLabel = classification?.predicted_class || datasetMatch?.label || 'Makanan';
    const targetCalories = targetPrediction?.target_kalori;
    const analysisParts = [
        `${foodName} dipetakan sebagai ${classLabel}`,
        `estimasi ${nutrition.calories} kkal`
    ];

    if (targetCalories) {
        analysisParts.push(`target harian model AI: ${Math.round(targetCalories)} kkal`);
    }

    return {
        ...nutrition,
        classification: classLabel,
        targetPrediction,
        analysis: `${analysisParts.join(', ')}.`
    };
};

const detectChatIntent = (message = '') => {
    const normalized = normalizeText(message);
    if (/\b(ringkasan|summary|diary|hari ini|makananku|asupan)\b/.test(normalized)) return 'summary';
    if (/\b(protein|otot|tinggi protein)\b/.test(normalized)) return 'protein';
    if (/\b(serat|fiber|pencernaan|sayur|buah)\b/.test(normalized)) return 'fiber';
    if (/\b(rendah kalori|kalori rendah|diet|defisit|turun berat)\b/.test(normalized)) return 'low_calorie';
    if (/\b(karbo|karbohidrat|energi)\b/.test(normalized)) return 'carbs';
    if (/\b(lemak|fat)\b/.test(normalized)) return 'fat';
    if (/\b(murah|hemat|terjangkau)\b/.test(normalized)) return 'budget';
    if (/\b(rekomendasi|saran|menu|makan apa|cocok|berdasarkan|insight)\b/.test(normalized)) return 'recommendation';
    if (/\b(kalori|kkal|gizi|nutrisi|berapa)\b/.test(normalized)) return 'food_lookup';
    return 'general';
};

const recommendationPool = (intent) => {
    const rows = loadNutritionRows().filter((row) => row.calories > 0);
    const commonBudgetNames = ['telur', 'tempe', 'tahu', 'bayam', 'kangkung', 'pisang', 'beras', 'ikan'];

    if (intent === 'protein') {
        return rows
            .filter((row) => row.protein >= 15)
            .sort((a, b) => b.protein - a.protein)
            .slice(0, 5);
    }

    if (intent === 'fiber') {
        return rows
            .filter((row) => row.fiber >= 4)
            .sort((a, b) => b.fiber - a.fiber)
            .slice(0, 5);
    }

    if (intent === 'low_calorie') {
        return rows
            .filter((row) => row.calories <= 100)
            .sort((a, b) => (b.protein + b.fiber) - (a.protein + a.fiber))
            .slice(0, 5);
    }

    if (intent === 'carbs') {
        return rows
            .filter((row) => row.carbs >= 40)
            .sort((a, b) => b.carbs - a.carbs)
            .slice(0, 5);
    }

    if (intent === 'fat') {
        return rows
            .filter((row) => row.fat >= 10)
            .sort((a, b) => b.fat - a.fat)
            .slice(0, 5);
    }

    if (intent === 'budget') {
        return commonBudgetNames
            .map((name) => findNutritionFromDataset(name))
            .filter(Boolean)
            .slice(0, 5);
    }

    return rows
        .filter((row) => row.protein >= 8 || row.fiber >= 3)
        .sort((a, b) => (b.protein + b.fiber) - (a.protein + a.fiber))
        .slice(0, 5);
};

const formatFoodRows = (rows = [], nutrient = 'calories') => {
    const labels = {
        protein: (row) => `protein ${formatNumber(row.protein)} g`,
        fiber: (row) => `serat ${formatNumber(row.fiber)} g`,
        low_calorie: (row) => `${formatNumber(row.calories)} kkal`,
        carbs: (row) => `karbohidrat ${formatNumber(row.carbs)} g`,
        fat: (row) => `lemak ${formatNumber(row.fat)} g`,
        calories: (row) => `${formatNumber(row.calories)} kkal`
    };

    const formatter = labels[nutrient] || labels.calories;
    return rows
        .slice(0, 4)
        .map((row) => `${row.name}: ${formatter(row)}`)
    .join('; ');
};

const summarizeRecentLogs = (recentLogs = []) => {
    const totals = recentLogs.reduce((acc, log) => ({
        calories: acc.calories + toNumber(log.calories),
        protein: acc.protein + toNumber(log.protein),
        carbs: acc.carbs + toNumber(log.carbs),
        fat: acc.fat + toNumber(log.fat),
        count: acc.count + 1
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });

    return `Dari ${totals.count} catatan terakhir: ${formatNumber(totals.calories)} kkal, protein ${formatNumber(totals.protein)} g, karbo ${formatNumber(totals.carbs)} g, dan lemak ${formatNumber(totals.fat)} g.`;
};

const summarizeInsightContext = (context = {}) => {
    if (!context || !Array.isArray(context.nutrients)) return '';
    const kurang = context.nutrients
        .filter((item) => item.status === 'down')
        .map((item) => `${item.label} ${item.value}/${item.target}`)
        .join(', ');
    const total = context.dailySummary?.totalCalories || context.totalCalories || 0;
    return kurang
        ? `Ringkasan Insight ${context.date || 'hari ini'}: total ${total} kkal. Yang perlu diperhatikan: ${kurang}.`
        : `Ringkasan Insight ${context.date || 'hari ini'}: total ${total} kkal dan asupan utama sudah mendekati target.`;
};

const buildGoalAdvice = (user = {}, row = null) => {
    const goalLabel = getGoalLabel(user?.goal);
    if (!row) return `Sesuaikan porsi dengan targetmu untuk ${goalLabel}.`;

    if (user?.goal === 'LOSE_WEIGHT' && row.calories > 250) {
        return `Untuk target ${goalLabel}, makanan ini masih bisa masuk, tetapi porsinya perlu dijaga karena kalorinya cukup tinggi.`;
    }

    if (user?.goal === 'GAIN_WEIGHT' && row.calories >= 150) {
        return `Untuk target ${goalLabel}, makanan ini bisa membantu menambah energi harian jika porsinya sesuai.`;
    }

    return `Untuk target ${goalLabel}, makanan ini bisa dipakai selama total harianmu tetap seimbang.`;
};

export const askDataScienceNutritionAssistant = ({ message, user, recentLogs = [], context = null, sourceAction = '' }) => {
    const intent = detectChatIntent(message);
    const datasetMatch = findNutritionFromDataset(message);
    const hasDiary = recentLogs.length > 0;
    const insightSummary = summarizeInsightContext(context);

    if (sourceAction === 'evaluasi_harian' || sourceAction === 'today_evaluation') {
        const calorieTarget = context?.calorieTarget || 0;
        let totalCalories = context?.totalCalories || 0;
        let macros = context?.macroTotals || { protein: 0, carbs: 0, fat: 0 };

        // Jika ada recentLogs dari database, gunakan itu
        if (hasDiary && recentLogs.length > 0) {
            totalCalories = toNumber(recentLogs.reduce((sum, log) => sum + toNumber(log.calories), 0));
            macros = {
                protein: toNumber(recentLogs.reduce((sum, log) => sum + toNumber(log.protein), 0)),
                carbs: toNumber(recentLogs.reduce((sum, log) => sum + toNumber(log.carbs), 0)),
                fat: toNumber(recentLogs.reduce((sum, log) => sum + toNumber(log.fat), 0))
            };
        }

        let evaluation = '';
        const goalLabel = getGoalLabel(user?.goal);
        const userProfile = context?.userProfile || {};

        if (totalCalories === 0) {
            return `Halo! Saya lihat belum ada makanan yang dicatat hari ini di diary. Mulai tambahkan makanan ke diary agar saya bisa membantu evaluasi dan memberikan rekomendasi nutrisi yang lebih baik untuk target ${goalLabel}. 😊`;
        }

        // Jika calorieTarget tidak tersedia, gunakan totalCalories sebagai patokan
        if (calorieTarget <= 0) {
            evaluation = `Oke! Hari ini kamu sudah konsumsi ${Math.round(totalCalories)} kkal. `;

            // Beri saran berdasarkan makro yang sudah dikonsumsi
            if (macros.protein > 0) {
                const proteinStatus = macros.protein > 50 ? 'cukup baik' : macros.protein > 30 ? 'sedang' : 'masih kurang';
                evaluation += `Asupan protein ${macros.protein}g termasuk ${proteinStatus}. `;
            }

            // Saran berdasarkan tujuan
            if (goalLabel.includes('menurunkan')) {
                evaluation += `Untuk target ${goalLabel}, makanan yang kamu makan tadi relatif seimbang. Untuk sisa hari, lebih baik fokus makanan rendah kalori dan tinggi protein seperti sayuran, buah, atau protein tanpa lemak (ayam, ikan). `;
            } else if (goalLabel.includes('menaikkan')) {
                evaluation += `Untuk target ${goalLabel}, kamu bisa menambah asupan kalori dengan makanan bergizi tinggi seperti daging, telur, kacang-kacangan, atau minuman bernutrisi. `;
            } else {
                evaluation += `Untuk target ${goalLabel}, asupanmu sudah masuk kategori moderat. Pastikan nutrisi seimbang dengan menambah makanan bergizi untuk sisa hari. `;
            }

            evaluation += `Apa makanan yang kamu rencanakan selanjutnya? Saya siap bantu cek nutrisinya. 👍`;
            return evaluation;
        }

        // Jika ada calorieTarget, gunakan perhitungan normal
        const percentageTarget = calorieTarget ? Math.round((totalCalories / calorieTarget) * 100) : 0;
        const remaining = calorieTarget - totalCalories;

        if (percentageTarget > 100) {
            evaluation = `Wow! Kalorimu sudah mencapai ${percentageTarget}% dari target ${Math.round(calorieTarget)} kkal. Untuk sisa hari ini, sebaiknya fokus pada makanan berkalori rendah seperti sayuran, buah-buahan, atau minuman tanpa gula. `;
        } else if (percentageTarget > 70) {
            evaluation = `Bagus! Kalorimu sudah ${percentageTarget}% dari target ${Math.round(calorieTarget)} kkal. Untuk makan berikutnya, kamu masih bisa konsumsi makanan berkalori sedang (kurang dari ${Math.round(remaining)} kkal), pilih yang tinggi protein agar kenyang lebih lama. `;
        } else {
            evaluation = `Oke! Kalorimu baru ${percentageTarget}% dari target ${Math.round(calorieTarget)} kkal. Masih bisa tambah hingga ${Math.round(remaining)} kkal. Untuk makan berikutnya, kamu bisa konsumsi makanan bergizi dengan kalori sedang. `;
        }

        let macroFeedback = '';
        const proteinTarget = context?.targets?.protein || 0;
        const carbTarget = context?.targets?.carbs || 0;

        if (proteinTarget && macros.protein < proteinTarget) {
            macroFeedback += `Proteinmu baru ${Math.round((macros.protein / proteinTarget) * 100)}% dari target. `;
        }
        if (carbTarget && macros.carbs < carbTarget) {
            macroFeedback += `Karbomu juga masih perlu ditambah. `;
        }

        if (macroFeedback) {
            evaluation += `Dari sisi makro: ${macroFeedback}`;
        }

        evaluation += `Apa makanan yang kamu rencanakan selanjutnya? Saya siap bantu cek nutrisinya. 👍`;

        return evaluation;
    }

    if (sourceAction === 'insight_recommendation' && context?.recommendationTitle) {
        const lackingNutrients = context?.lackingNutrients || {};
        const totalCalories = context?.dailySummary?.totalCalories || 0;
        const goalLabel = getGoalLabel(user?.goal);

        let response = `${context.recommendationTitle}: ${context.recommendationDesc || 'pilih makanan yang sesuai kebutuhanmu.'}\n\n`;

        // Jika ada protein yang kurang
        if (lackingNutrients.protein > 0) {
            response += `• Protein kurang ${lackingNutrients.protein.toFixed(1)}g\n  Pilih: ${formatFoodRows(recommendationPool('protein'), 'protein')}\n\n`;
        }

        // Jika ada serat yang kurang
        if (lackingNutrients.fiber > 0) {
            response += `• Serat kurang ${lackingNutrients.fiber.toFixed(1)}g\n  Pilih: ${formatFoodRows(recommendationPool('fiber'), 'fiber')}\n\n`;
        }

        // Jika masih ada ruang kalori dan target diet menurun
        if (lackingNutrients.calories > 0 && user?.goal && String(user.goal).toLowerCase().includes('lose')) {
            response += `• Masih ada ruang ${lackingNutrients.calories.toFixed(0)} kkal\n  Pilih rendah kalori: ${formatFoodRows(recommendationPool('low_calorie'), 'low_calorie')}\n\n`;
        }

        // Jika perlu tambah karbohidrat
        if (lackingNutrients.carbs > 0) {
            response += `• Karbohidrat kurang ${lackingNutrients.carbs.toFixed(1)}g\n  Pilih: ${formatFoodRows(recommendationPool('carbs'), 'carbs')}\n\n`;
        }

        response += `Tip: Pilih kombinasi makanan dari saran di atas sesuai preferensi dan ketersediaan. Apa makanan pilihan kamu?`;

        return response;
    }

    if (intent === 'summary') {
        return hasDiary
            ? `${summarizeRecentLogs(recentLogs)} Kalau ingin lebih presisi, tambahkan semua makanan hari ini di Diary.`
            : 'Diary kamu belum punya catatan makanan terbaru. Tambahkan makanan dulu agar saya bisa membuat ringkasan asupanmu.';
    }

    if (intent === 'food_lookup' && datasetMatch) {
        return `Berdasarkan data TKPI, ${datasetMatch.name} per 100 g memiliki ${formatNumber(datasetMatch.calories)} kkal, protein ${formatNumber(datasetMatch.protein)} g, karbo ${formatNumber(datasetMatch.carbs)} g, lemak ${formatNumber(datasetMatch.fat)} g, dan serat ${formatNumber(datasetMatch.fiber)} g. ${buildGoalAdvice(user, datasetMatch)}`;
    }

    if (['protein', 'fiber', 'low_calorie', 'carbs', 'fat', 'budget', 'recommendation'].includes(intent)) {
        // Jika ada context dari insight, prioritaskan nutrisi yang kurang
        if (context?.sourceAction === 'insight' && context?.lackingNutrients) {
            const lacking = context.lackingNutrients;
            let recommendations = [];

            // Prioritas: nutrisi yang paling banyak kurang
            if (lacking.protein > 0) recommendations.push({ type: 'protein', label: 'Tinggi Protein', amount: lacking.protein });
            if (lacking.fiber > 0) recommendations.push({ type: 'fiber', label: 'Kaya Serat', amount: lacking.fiber });
            if (lacking.carbs > 0) recommendations.push({ type: 'carbs', label: 'Karbohidrat', amount: lacking.carbs });

            if (recommendations.length > 0) {
                let response = `Berdasarkan ringkasan insight hari ini, berikut rekomendasi untuk melengkapi nutrisi yang masih kurang:\n\n`;
                recommendations.forEach(rec => {
                    const rows = recommendationPool(rec.type);
                    response += `**${rec.label}** (kurang ${rec.amount.toFixed(1)}): ${formatFoodRows(rows, rec.type)}\n\n`;
                });
                response += `Pilih kombinasi dari saran di atas. Apa makanan pilihan kamu?`;
                return response;
            }
        }

        const rows = recommendationPool(intent);
        const intro = {
            protein: 'Pilihan tinggi protein dari basis data TKPI:',
            fiber: 'Pilihan kaya serat dari basis data TKPI:',
            low_calorie: 'Pilihan rendah kalori yang relatif ringan:',
            carbs: 'Pilihan sumber karbohidrat/energi:',
            fat: 'Pilihan dengan kandungan lemak lebih tinggi:',
            budget: 'Pilihan sederhana dan umumnya mudah dicari:',
            recommendation: `Rekomendasi untuk target ${getGoalLabel(user?.goal)}:`
        }[intent];

        const nutrientKey = {
            protein: 'protein',
            fiber: 'fiber',
            low_calorie: 'low_calorie',
            carbs: 'carbs',
            fat: 'fat',
            budget: 'calories',
            recommendation: 'calories'
        }[intent];

        return `${intro} ${formatFoodRows(rows, nutrientKey)}.`;
    }

    if (datasetMatch) {
        return `Saya menemukan ${datasetMatch.name} di dataset TKPI: ${formatNumber(datasetMatch.calories)} kkal, protein ${formatNumber(datasetMatch.protein)} g, karbo ${formatNumber(datasetMatch.carbs)} g, lemak ${formatNumber(datasetMatch.fat)} g, serat ${formatNumber(datasetMatch.fiber)} g per 100 g. ${buildGoalAdvice(user, datasetMatch)}`;
    }

    return `Saya menjawab memakai basis data TKPI dan diary kamu. Kamu bisa tanya seperti "berapa kalori nasi putih", "rekomendasi tinggi protein", "makanan rendah kalori", atau "ringkasan diary hari ini". ${hasDiary ? summarizeRecentLogs(recentLogs) : 'Saat ini belum ada catatan makanan terbaru untuk diringkas.'}`;
};
