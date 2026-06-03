import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isFutureLocalDate,
    isSameLocalDay,
    parseLocalDate,
    toLocalDateKey
} from '../src/utils/dateUtils.js';

test('toLocalDateKey keeps date-only strings stable', () => {
    assert.equal(toLocalDateKey('2026-05-31'), '2026-05-31');
});

test('parseLocalDate reads date-only strings as local calendar dates', () => {
    const parsed = parseLocalDate('2026-05-31');

    assert.equal(parsed.getFullYear(), 2026);
    assert.equal(parsed.getMonth(), 4);
    assert.equal(parsed.getDate(), 31);
});

test('isSameLocalDay compares calendar keys instead of raw timestamps', () => {
    assert.equal(isSameLocalDay('2026-05-31', new Date(2026, 4, 31)), true);
    assert.equal(isSameLocalDay('2026-05-30', new Date(2026, 4, 31)), false);
});

test('isFutureLocalDate rejects dates after today', () => {
    assert.equal(isFutureLocalDate('2999-01-01'), true);
});
