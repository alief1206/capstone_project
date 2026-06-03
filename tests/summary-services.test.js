import test from 'node:test';
import assert from 'node:assert/strict';

import {
    summarizeFoodLogs,
    summarizeWeightLogs
} from '../server/services/summarySnapshotService.js';

test('server summarizeFoodLogs totals nutrition values and count', () => {
    assert.deepEqual(summarizeFoodLogs([
        { calories: 100, protein: 10, carbs: 12, fat: 3, fiber: 1 },
        { calories: '50', protein: '5', carbs: '8', fat: '2', fiber: '4' },
        { calories: null, protein: null, carbs: null, fat: null, fiber: null }
    ]), {
        totalCalories: 150,
        protein: 15,
        carbs: 20,
        fat: 5,
        fiber: 5,
        totalLogs: 3
    });
});

test('server summarizeWeightLogs returns range-aware empty summary', () => {
    assert.deepEqual(summarizeWeightLogs([], 'monthly'), {
        range: 'monthly',
        latestWeight: null,
        delta: 0,
        averageWeight: 0,
        minWeight: 0,
        maxWeight: 0,
        entries: 0
    });
});

test('server summarizeWeightLogs sorts logs and computes delta', () => {
    assert.deepEqual(summarizeWeightLogs([
        { weight: 59, logDate: '2026-05-31' },
        { weight: 60, logDate: '2026-05-29' },
        { weight: 58.5, logDate: '2026-05-30' }
    ], 'weekly'), {
        range: 'weekly',
        latestWeight: 59,
        delta: 0.5,
        averageWeight: 59.2,
        minWeight: 58.5,
        maxWeight: 60,
        entries: 3
    });
});
