import test from 'node:test';
import assert from 'node:assert/strict';

import {
    endOfDay,
    getDateKey,
    isFutureCalendarDate,
    parseCalendarDate,
    startOfDay
} from '../server/utils/dateUtils.js';

test('server date keys keep database UTC dates on the same app calendar day', () => {
    assert.equal(getDateKey(new Date('2026-05-31T00:00:00.000Z')), '2026-05-31');
});

test('server date-only strings become UTC database date boundaries', () => {
    assert.equal(startOfDay('2026-05-31').toISOString(), '2026-05-31T00:00:00.000Z');
    assert.equal(endOfDay('2026-05-31').toISOString(), '2026-05-31T23:59:59.999Z');
});

test('parseCalendarDate avoids previous-day timezone shifts for date-only strings', () => {
    assert.equal(getDateKey(parseCalendarDate('2026-05-31')), '2026-05-31');
});

test('server future validation compares calendar dates', () => {
    assert.equal(isFutureCalendarDate('2999-01-01'), true);
});
