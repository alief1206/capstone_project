const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const padTwo = (value) => String(value).padStart(2, '0');

export const isDateKey = (value) => typeof value === 'string' && DATE_KEY_PATTERN.test(value);

export const parseLocalDate = (value = new Date()) => {
    if (isDateKey(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const toLocalDateKey = (value = new Date()) => {
    if (isDateKey(value)) return value;

    const date = parseLocalDate(value);
    return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
};

export const isSameLocalDay = (dateA, dateB = new Date()) => toLocalDateKey(dateA) === toLocalDateKey(dateB);

export const isFutureLocalDate = (value) => toLocalDateKey(value) > toLocalDateKey(new Date());

export const isTodayLocalDate = (value) => toLocalDateKey(value) === toLocalDateKey(new Date());

export const isWithinLastSevenDaysLocal = (value) => {
    const selectedDate = parseLocalDate(value);
    const today = parseLocalDate(new Date());
    const earliestAllowedDate = new Date(today);
    earliestAllowedDate.setDate(today.getDate() - 7);

    return selectedDate >= earliestAllowedDate && selectedDate <= today;
};
