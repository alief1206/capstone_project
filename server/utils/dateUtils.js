const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Jakarta';

const padTwo = (value) => String(value).padStart(2, '0');

const parseDateKey = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return { year, month, day };
};

const getDatePartsInAppTimeZone = (value = new Date()) => {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(safeDate);

    return {
        year: Number(parts.find((part) => part.type === 'year')?.value),
        month: Number(parts.find((part) => part.type === 'month')?.value),
        day: Number(parts.find((part) => part.type === 'day')?.value)
    };
};

const toUtcDate = (value, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) => {
    const parts = typeof value === 'string' && DATE_KEY_PATTERN.test(value)
        ? parseDateKey(value)
        : getDatePartsInAppTimeZone(value);

    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hours, minutes, seconds, milliseconds));
};

export const parseCalendarDate = (value = new Date()) => {
    if (typeof value === 'string' && DATE_KEY_PATTERN.test(value)) {
        return toUtcDate(value, 12);
    }

    const date = value instanceof Date ? new Date(value) : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const startOfDay = (value = new Date()) => {
    return toUtcDate(value, 0, 0, 0, 0);
};

export const endOfDay = (value = new Date()) => {
    return toUtcDate(value, 23, 59, 59, 999);
};

export const getDateKey = (value = new Date()) => {
    if (typeof value === 'string' && DATE_KEY_PATTERN.test(value)) return value;

    const parts = getDatePartsInAppTimeZone(value);
    return `${parts.year}-${padTwo(parts.month)}-${padTwo(parts.day)}`;
};

export const isFutureCalendarDate = (value) => getDateKey(value) > getDateKey(new Date());
