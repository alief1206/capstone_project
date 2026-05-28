import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nutritionDatasetPath = path.resolve(__dirname, '../../data-science/data/nutrition_dataset/tkpi_clean_labeled.csv');

const DEFAULT_NUTRITION_URL = 'http://127.0.0.1:8000/predict-nutrition';
const DEFAULT_FOOD_CLASS_URL = 'http://127.0.0.1:8000/predict-food-class';
const LEGACY_AI_URL = process.env.AI_MODEL_URL?.replace('/api/predict', '/predict-nutrition');
const AI_NUTRITION_URL = process.env.AI_NUTRITION_URL || LEGACY_AI_URL || DEFAULT_NUTRITION_URL;
const AI_FOOD_CLASS_URL = process.env.AI_FOOD_CLASS_URL || DEFAULT_FOOD_CLASS_URL;

let nutritionRowsCache = null;
let geminiClient = null;

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

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const roundOne = (value) => Math.round((toNumber(value) + Number.EPSILON) * 10) / 10;

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
    if (row.normalizedName === query) return 100;
    if (row.normalizedName.includes(query)) return 85;

    const queryTokens = query.split(' ').filter((token) => token.length > 2);
    if (!queryTokens.length) return 0;

    const matched = queryTokens.filter((token) => row.normalizedName.includes(token)).length;
    return (matched / queryTokens.length) * 70;
};

export const findNutritionFromDataset = (foodName = '') => {
    const query = normalizeText(foodName);
    const rows = loadNutritionRows();

    return rows
        .map((row) => ({ row, score: scoreFoodMatch(query, row) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)[0]?.row || null;
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
    rendah: 'tidak_aktif',
    sedang: 'ringan',
    aktif: 'aktif',
    sangat: 'sangat_aktif'
}[activity] || 'ringan');

const mapGoalForModel = (goal) => ({
    LOSE_WEIGHT: 'Turun_BB',
    GAIN_WEIGHT: 'Naik_BB',
    MAINTAIN: 'Jaga_BB',
    turunkan: 'Turun_BB',
    tambah: 'Naik_BB',
    jaga: 'Jaga_BB'
}[goal] || 'Jaga_BB');

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

const getGeminiModel = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    if (!geminiClient) geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return geminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
};

export const askGeminiNutritionAssistant = async ({ message, user, recentLogs = [] }) => {
    const model = getGeminiModel();
    const latestFoods = recentLogs
        .slice(0, 6)
        .map((log) => `${log.foodName} (${log.calories || 0} kkal)`)
        .join(', ') || 'belum ada catatan makanan';

    if (!model) {
        return `Saya belum menemukan GEMINI_API_KEY di server. Berdasarkan profilmu, tetap catat makanan secara rutin dan sesuaikan porsi dengan target ${mapGoalForModel(user?.goal).replace('_', ' ').toLowerCase()}.`;
    }

    const prompt = [
        'Kamu adalah EatSistent AI, asisten nutrisi berbahasa Indonesia.',
        'Jawab singkat, ramah, praktis, dan aman. Jangan memberi diagnosis medis.',
        `Profil pengguna: usia ${user?.age || '-'}, tinggi ${user?.height || '-'} cm, berat ${user?.currentWeight || '-'} kg, target ${mapGoalForModel(user?.goal)}.`,
        `Catatan makanan terbaru: ${latestFoods}.`,
        `Pertanyaan pengguna: ${message}`
    ].join('\n');

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};
