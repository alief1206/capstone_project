import test from 'node:test';
import assert from 'node:assert/strict';

import {
    askDataScienceNutritionAssistant,
    findNutritionFromDataset,
    getNutritionCatalogRecommendations,
    searchNutritionCatalog
} from '../server/services/aiIntegrationService.js';

test('findNutritionFromDataset returns a matching nutrition row', () => {
    const row = findNutritionFromDataset('nasi putih');

    assert.ok(row);
    assert.match(row.name.toLowerCase(), /nasi|beras/);
    assert.ok(Number(row.calories) > 0);
});

test('searchNutritionCatalog returns decorated catalog items with limit', () => {
    const foods = searchNutritionCatalog({ query: 'ayam', goal: 'MAINTAIN', limit: 3 });

    assert.ok(foods.length <= 3);
    assert.ok(foods.length > 0);
    assert.ok(foods[0].name);
    assert.equal(foods[0].qty, '100g');
    assert.match(foods[0].cals, /kkal/);
});

test('getNutritionCatalogRecommendations returns goal-aware recommendations', () => {
    const recommendations = getNutritionCatalogRecommendations({ goal: 'LOSE_WEIGHT', limit: 5 });

    assert.ok(recommendations.length <= 5);
    assert.ok(recommendations.length > 0);
    assert.ok(recommendations.every((item) => Number(item.calories) > 0));
});

test('nutrition assistant answers food lookup from dataset', () => {
    const reply = askDataScienceNutritionAssistant({
        message: 'berapa kalori nasi putih',
        user: { goal: 'LOSE_WEIGHT' },
        recentLogs: []
    });

    assert.match(reply.toLowerCase(), /nasi|beras/);
    assert.match(reply.toLowerCase(), /kkal/);
});

test('nutrition assistant summarizes recent diary logs', () => {
    const reply = askDataScienceNutritionAssistant({
        message: 'ringkasan diary hari ini',
        user: { goal: 'MAINTAIN' },
        recentLogs: [
            { foodName: 'Nasi', calories: 100, protein: 2, carbs: 20, fat: 1 },
            { foodName: 'Ayam', calories: 150, protein: 25, carbs: 0, fat: 5 }
        ]
    });

    assert.match(reply, /250/);
    assert.match(reply.toLowerCase(), /protein/);
});
