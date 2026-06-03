import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getWeightLogs,
    getWeightLogsInRange,
    mergeWeightLogs,
    saveWeightLogs,
    summarizeWeightLogs,
    upsertWeightLog
} from '../src/utils/weightLogStorage.js';

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

test('saveWeightLogs sorts entries by calendar date', () => {
    localStorage.clear();

    saveWeightLogs('weight@example.com', [
        { weight: 62, logDate: '2026-05-31' },
        { weight: 61, logDate: '2026-05-30' }
    ]);

    assert.deepEqual(getWeightLogs('weight@example.com').map((log) => log.logDate), [
        '2026-05-30',
        '2026-05-31'
    ]);
});

test('upsertWeightLog replaces existing entry on the same date', () => {
    localStorage.clear();
    upsertWeightLog('upsert@example.com', 60, '2026-05-31');
    upsertWeightLog('upsert@example.com', 61.5, '2026-05-31');

    const logs = getWeightLogs('upsert@example.com');
    assert.equal(logs.length, 1);
    assert.equal(logs[0].weight, 61.5);
});

test('mergeWeightLogs deduplicates by date and keeps incoming values', () => {
    localStorage.clear();
    upsertWeightLog('merge@example.com', 60, '2026-05-30');

    const merged = mergeWeightLogs('merge@example.com', [
        { id: 9, weight: 59.5, logDate: '2026-05-30' },
        { id: 10, weight: 59, logDate: '2026-05-31' }
    ]);

    assert.deepEqual(merged.map((log) => ({ id: log.id, weight: log.weight, logDate: log.logDate })), [
        { id: 9, weight: 59.5, logDate: '2026-05-30' },
        { id: 10, weight: 59, logDate: '2026-05-31' }
    ]);
});

test('getWeightLogsInRange returns logs on or after the range start', () => {
    localStorage.clear();
    const today = new Date();
    const oldDate = new Date();
    oldDate.setDate(today.getDate() - 10);

    upsertWeightLog('range@example.com', 60, oldDate);
    upsertWeightLog('range@example.com', 61, today);

    assert.equal(getWeightLogsInRange('range@example.com', 7).length, 1);
});

test('summarizeWeightLogs computes latest, delta, average, min, max, entries', () => {
    const summary = summarizeWeightLogs([
        { weight: 62, logDate: '2026-05-31' },
        { weight: 60, logDate: '2026-05-29' },
        { weight: 61, logDate: '2026-05-30' }
    ]);

    assert.deepEqual(summary, {
        latestWeight: 62,
        delta: 1,
        averageWeight: 61,
        minWeight: 60,
        maxWeight: 62,
        entries: 3
    });
});

test('summarizeWeightLogs returns zero summary for empty data', () => {
    assert.deepEqual(summarizeWeightLogs([]), {
        latestWeight: 0,
        delta: 0,
        averageWeight: 0,
        minWeight: 0,
        maxWeight: 0,
        entries: 0
    });
});
