import test from 'node:test';
import assert from 'node:assert/strict';

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

const auth = await import('../src/services/auth.js');
const foods = await import('../src/services/foods.js');
const meals = await import('../src/services/meals.js');

const mockFetchJson = (handler) => {
    globalThis.fetch = async (url, options = {}) => {
        const payload = await handler(url, options);
        return {
            ok: payload.ok ?? true,
            status: payload.status ?? 200,
            json: async () => payload.body ?? {}
        };
    };
};

test('loginWithEmail posts credentials without auth', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/auth/login');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers.Authorization, undefined);
        assert.deepEqual(JSON.parse(options.body), { email: 'a@mail.com', password: 'Secret123' });
        return { body: { token: 'jwt' } };
    });

    assert.deepEqual(await auth.loginWithEmail({ email: 'a@mail.com', password: 'Secret123' }), { token: 'jwt' });
});

test('loginWithGoogle posts Google credential without auth', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/auth/google-login');
        assert.deepEqual(JSON.parse(options.body), { credential: 'google-credential' });
        assert.equal(options.headers.Authorization, undefined);
        return { body: { token: 'jwt-google' } };
    });

    assert.deepEqual(await auth.loginWithGoogle('google-credential'), { token: 'jwt-google' });
});

test('loginWithGoogle can post registration profile payload', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/auth/google-login');
        assert.deepEqual(JSON.parse(options.body), {
            credential: 'google-credential',
            profile: { goal: 'LOSE_WEIGHT', age: 25 }
        });
        assert.equal(options.headers.Authorization, undefined);
        return { body: { token: 'jwt-google-register' } };
    });

    assert.deepEqual(await auth.loginWithGoogle({
        credential: 'google-credential',
        profile: { goal: 'LOSE_WEIGHT', age: 25 }
    }), { token: 'jwt-google-register' });
});

test('fetchCurrentUser flattens profile response with aiTarget', async () => {
    localStorage.setItem('authToken', 'jwt');
    mockFetchJson((url) => {
        assert.equal(url, 'http://localhost:5000/api/v1/users/me');
        return { body: { data: { email: 'u@mail.com' }, aiTarget: { calories: 1800 } } };
    });

    assert.deepEqual(await auth.fetchCurrentUser(), { email: 'u@mail.com', aiTarget: { calories: 1800 } });
});

test('updatePhysicalProfile returns profile plus ai target', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/users/physical-update');
        assert.equal(options.method, 'PUT');
        assert.deepEqual(JSON.parse(options.body), { currentWeight: 60 });
        return { body: { data: { currentWeight: 60 }, aiTarget: { target_kalori: 1700 } } };
    });

    assert.deepEqual(await auth.updatePhysicalProfile({ currentWeight: 60 }), {
        currentWeight: 60,
        aiTarget: { target_kalori: 1700 }
    });
});

test('weight log service posts and returns created data', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/users/weight-logs');
        assert.equal(options.method, 'POST');
        assert.deepEqual(JSON.parse(options.body), { weight: 61, logDate: '2026-05-31' });
        return { body: { data: { weight: 61, logDate: '2026-05-31' } } };
    });

    assert.deepEqual(await auth.createWeightLog({ weight: 61, logDate: '2026-05-31' }), {
        weight: 61,
        logDate: '2026-05-31'
    });
});

test('fetchWeightTrend encodes range query', async () => {
    mockFetchJson((url) => {
        assert.equal(url, 'http://localhost:5000/api/v1/users/weight-logs?range=30%20hari');
        return { body: { data: [] } };
    });

    assert.deepEqual(await auth.fetchWeightTrend('30 hari'), { data: [] });
});

test('fetchFoodCatalog builds catalog query parameters', async () => {
    mockFetchJson((url) => {
        assert.equal(url, 'http://localhost:5000/api/v1/foods?q=nasi+ayam&goal=turunkan&limit=12&recommendationLimit=8');
        return { body: { data: { foods: [{ name: 'Nasi ayam' }] } } };
    });

    assert.deepEqual(await foods.fetchFoodCatalog({
        query: 'nasi ayam',
        goal: 'turunkan',
        limit: 12,
        recommendationLimit: 8
    }), { foods: [{ name: 'Nasi ayam' }] });
});

test('createFoodLog normalizes server response for local storage', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/food-logs/log-food');
        assert.equal(options.method, 'POST');
        assert.deepEqual(JSON.parse(options.body), {
            foodName: 'Telur',
            calories: 80,
            logDate: '2026-05-31'
        });
        return {
            body: {
                data: {
                    id: 5,
                    foodName: 'Telur',
                    calories: 80,
                    mealType: 'SARAPAN',
                    logDate: '2026-05-31'
                }
            }
        };
    });

    const response = await meals.createFoodLog({ foodName: 'Telur', calories: 80, logDate: '2026-05-31' });

    assert.equal(response.data.serverId, 5);
    assert.equal(response.data.name, 'Telur');
    assert.equal(response.data.logDate, '2026-05-31');
});

test('syncFoodLogs saves normalized logs locally', async () => {
    localStorage.clear();
    mockFetchJson(() => ({
        body: {
            data: [
                { id: 7, foodName: 'Oat', calories: 120, logDate: '2026-05-31' }
            ]
        }
    }));

    const logs = await meals.syncFoodLogs('sync@example.com');

    assert.equal(logs[0].serverId, 7);
    assert.equal(JSON.parse(localStorage.getItem('foodLogs:sync@example.com'))[0].name, 'Oat');
});

test('deleteFoodLog calls food log delete endpoint', async () => {
    mockFetchJson((url, options) => {
        assert.equal(url, 'http://localhost:5000/api/v1/food-logs/log-food/12');
        assert.equal(options.method, 'DELETE');
        return { body: { message: 'deleted' } };
    });

    assert.deepEqual(await meals.deleteFoodLog(12), { message: 'deleted' });
});
