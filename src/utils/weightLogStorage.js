import { parseLocalDate, toLocalDateKey } from './dateUtils.js';

export const getWeightLogKey = (email = '') => `weightLogs:${email || 'guest'}`;

const safeParse = (value, fallback = []) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const dateKey = (date = new Date()) => toLocalDateKey(date);

export const getWeightLogs = (email = '') => safeParse(localStorage.getItem(getWeightLogKey(email)), []);

export const saveWeightLogs = (email = '', logs = []) => {
    localStorage.setItem(getWeightLogKey(email), JSON.stringify(
        logs.sort((a, b) => parseLocalDate(a.logDate) - parseLocalDate(b.logDate))
    ));
};

export const upsertWeightLog = (email = '', weight, logDate = new Date()) => {
    const key = dateKey(logDate);
    const nextLog = {
        id: key,
        weight: Number(weight),
        logDate: key,
        createdAt: new Date().toISOString()
    };

    const logs = getWeightLogs(email).filter((log) => dateKey(log.logDate) !== key);
    saveWeightLogs(email, [...logs, nextLog]);
    return nextLog;
};

export const mergeWeightLogs = (email = '', incomingLogs = []) => {
    const byDate = new Map();
    [...getWeightLogs(email), ...incomingLogs].forEach((log) => {
        const key = dateKey(log.logDate);
        byDate.set(key, {
            id: log.id || key,
            weight: Number(log.weight || 0),
            logDate: key,
            createdAt: log.createdAt || new Date().toISOString()
        });
    });

    const merged = Array.from(byDate.values());
    saveWeightLogs(email, merged);
    return merged;
};

export const getWeightLogsInRange = (email = '', days = 7) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return getWeightLogs(email).filter((log) => parseLocalDate(log.logDate) >= start);
};

export const summarizeWeightLogs = (logs = []) => {
    if (!logs.length) {
        return { latestWeight: 0, delta: 0, averageWeight: 0, minWeight: 0, maxWeight: 0, entries: 0 };
    }

    const ordered = [...logs].sort((a, b) => parseLocalDate(a.logDate) - parseLocalDate(b.logDate));
    const weights = ordered.map((log) => Number(log.weight || 0));
    const latest = ordered[ordered.length - 1];
    const previous = ordered.length > 1 ? ordered[ordered.length - 2] : latest;

    return {
        latestWeight: Number(latest.weight || 0),
        delta: Number((Number(latest.weight || 0) - Number(previous.weight || 0)).toFixed(1)),
        averageWeight: Number((weights.reduce((sum, weight) => sum + weight, 0) / weights.length).toFixed(1)),
        minWeight: Math.min(...weights),
        maxWeight: Math.max(...weights),
        entries: logs.length
    };
};
