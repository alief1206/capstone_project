import test from 'node:test';
import assert from 'node:assert/strict';

import {
    addFoodLog,
    clearFoodLogs,
    estimateMacros,
    formatTwoDecimals,
    getFoodLogs,
    getFoodLogsByDate,
    getFoodLogKey,
    getDailyCalorieBuckets,
    getMacroSources,
    getMacroTotals,
    getNutritionSummary,
    getTotalCalories,
    mergeFoodLogs,
    normalizeFoodLogForStorage,
    parseCalories,
    removeFoodLog,
    roundTwo,
    saveFoodLogs
} from '../src/utils/foodLogStorage.js';

const createLocalStorageMock = () => {
    const store = new Map();
    return {
        getItem: (key) => store.has(key) ? store.get(key) : null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear()
    };
};

globalThis.localStorage = createLocalStorageMock();

test('normalizeFoodLogForStorage stores date-only logDate', () => {
    const log = normalizeFoodLogForStorage({
        foodName: 'Nasi',
        calories: 175,
        mealType: 'SARAPAN',
        logDate: '2026-05-31'
    });

    assert.equal(log.logDate, '2026-05-31');
    assert.equal(log.mealId, 'sarapan');
});

test('parseCalories extracts numeric calories from labels', () => {
    assert.equal(parseCalories('250 kkal'), 250);
    assert.equal(parseCalories('kalori tidak tersedia'), 0);
});

test('rounding and formatting helpers use Indonesian two-decimal format', () => {
    assert.equal(roundTwo(1.005), 1.01);
    assert.equal(formatTwoDecimals(1234.5), '1.234,50');
});

test('addFoodLog and getFoodLogsByDate keep today entry on selected day', () => {
    const email = 'date-test@example.com';
    localStorage.removeItem(getFoodLogKey(email));

    addFoodLog(email, {
        foodName: 'Ayam',
        calories: 220,
        mealType: 'MAKAN SIANG',
        logDate: '2026-05-31'
    });

    assert.equal(getFoodLogsByDate(email, '2026-05-31').length, 1);
    assert.equal(getFoodLogsByDate(email, '2026-05-30').length, 0);
});

test('removeFoodLog removes by local id or server id', () => {
    const email = 'remove@example.com';
    saveFoodLogs(email, [
        normalizeFoodLogForStorage({ id: 'local-1', foodName: 'Nasi', calories: 100 }),
        normalizeFoodLogForStorage({ id: 'local-2', serverId: 22, foodName: 'Ayam', calories: 200 })
    ]);

    assert.equal(removeFoodLog(email, 22).length, 1);
    assert.equal(getFoodLogs(email)[0].name, 'Nasi');
    assert.equal(removeFoodLog(email, 'local-1').length, 0);
});

test('mergeFoodLogs deduplicates server logs and keeps newest local entries', () => {
    const email = 'merge-food@example.com';
    saveFoodLogs(email, [
        normalizeFoodLogForStorage({
            id: 'local-1',
            foodName: 'Local',
            calories: 10,
            createdAt: '2026-05-31T02:00:00.000Z'
        })
    ]);

    const merged = mergeFoodLogs(email, [
        { id: 8, serverId: 8, foodName: 'Server A', calories: 100, createdAt: '2026-05-31T01:00:00.000Z' },
        { id: 8, serverId: 8, foodName: 'Server A Updated', calories: 120, createdAt: '2026-05-31T01:30:00.000Z' }
    ]);

    assert.equal(merged.length, 2);
    assert.equal(merged.find((log) => log.serverId === 8).name, 'Server A Updated');
});

test('clearFoodLogs removes saved food logs for an email', () => {
    const email = 'clear@example.com';
    addFoodLog(email, { foodName: 'Roti', calories: 90 });
    clearFoodLogs(email);

    assert.deepEqual(getFoodLogs(email), []);
});

test('getDailyCalorieBuckets groups by local date key', () => {
    const logs = [
        normalizeFoodLogForStorage({ foodName: 'Tempe', calories: 100, logDate: '2026-05-30' }),
        normalizeFoodLogForStorage({ foodName: 'Tahu', calories: 80, logDate: '2026-05-30' }),
        normalizeFoodLogForStorage({ foodName: 'Telur', calories: 90, logDate: '2026-05-31' })
    ];

    assert.deepEqual(getDailyCalorieBuckets(logs), [
        { date: '2026-05-30', calories: 180 },
        { date: '2026-05-31', calories: 90 }
    ]);
});

test('macro estimation uses provided macros when available', () => {
    assert.deepEqual(estimateMacros({ protein: 10, carbs: 20, fat: 5 }), {
        protein: 10,
        carbs: 20,
        fat: 5
    });
});

test('macro estimation falls back to food presets', () => {
    assert.deepEqual(estimateMacros({ foodName: 'nasi putih', calories: 200 }), {
        protein: 5,
        carbs: 39,
        fat: 3
    });
});

test('nutrition totals summarize calories, macros, fiber, and count', () => {
    const logs = [
        normalizeFoodLogForStorage({ foodName: 'Ayam', calories: 100, protein: 20, carbs: 1, fat: 2, fiber: 0 }),
        normalizeFoodLogForStorage({ foodName: 'Sayur', calories: 50, protein: 2, carbs: 8, fat: 1, fiber: 4 })
    ];

    assert.equal(getTotalCalories(logs), 150);
    assert.deepEqual(getMacroTotals(logs), { protein: 22, carbs: 9, fat: 3 });
    assert.deepEqual(getNutritionSummary(logs), {
        calories: 150,
        protein: 22,
        carbs: 9,
        fat: 3,
        fiber: 4,
        totalLogs: 2
    });
});

test('getMacroSources filters zero macro sources', () => {
    const sources = getMacroSources([
        normalizeFoodLogForStorage({ foodName: 'Ayam', calories: 100, protein: 20 }),
        normalizeFoodLogForStorage({ foodName: 'Air', calories: 0, protein: 0 })
    ], 'protein');

    assert.deepEqual(sources, [{ name: 'Ayam', qty: '20g' }]);
});

test('saveFoodLogs accepts normalized server logs with date-only values', () => {
    const email = 'server-sync@example.com';
    const logs = [
        normalizeFoodLogForStorage({
            id: 1,
            serverId: 1,
            foodName: 'Oat',
            calories: 120,
            logDate: '2026-05-31',
            createdAt: '2026-05-31T04:00:00.000Z'
        })
    ];

    saveFoodLogs(email, logs);

    assert.equal(getFoodLogsByDate(email, '2026-05-31')[0].name, 'Oat');
});
