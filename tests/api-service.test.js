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

const { apiRequest, getAuthToken } = await import('../src/services/api.js');

test('getAuthToken reads auth token from localStorage', () => {
    localStorage.clear();
    localStorage.setItem('authToken', 'token-123');

    assert.equal(getAuthToken(), 'token-123');
});

test('apiRequest sends JSON body and bearer token by default', async () => {
    localStorage.clear();
    localStorage.setItem('authToken', 'token-abc');
    let requestUrl = '';
    let requestOptions = null;

    globalThis.fetch = async (url, options) => {
        requestUrl = url;
        requestOptions = options;
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    };

    const result = await apiRequest('/sample', {
        method: 'POST',
        body: { hello: 'world' }
    });

    assert.equal(requestUrl, 'http://localhost:5000/api/v1/sample');
    assert.equal(requestOptions.method, 'POST');
    assert.equal(requestOptions.headers.Authorization, 'Bearer token-abc');
    assert.equal(requestOptions.headers['Content-Type'], 'application/json');
    assert.equal(requestOptions.body, JSON.stringify({ hello: 'world' }));
    assert.deepEqual(result, { success: true });
});

test('apiRequest can disable auth header', async () => {
    localStorage.clear();
    localStorage.setItem('authToken', 'token-hidden');

    globalThis.fetch = async (_url, options) => {
        assert.equal(options.headers.Authorization, undefined);
        return {
            ok: true,
            json: async () => ({ ok: true })
        };
    };

    assert.deepEqual(await apiRequest('/public', { auth: false }), { ok: true });
});

test('apiRequest throws response message and status on failed requests', async () => {
    globalThis.fetch = async () => ({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Validasi gagal', field: 'email' })
    });

    await assert.rejects(
        () => apiRequest('/error'),
        (error) => {
            assert.equal(error.message, 'Validasi gagal');
            assert.equal(error.status, 422);
            assert.deepEqual(error.data, { message: 'Validasi gagal', field: 'email' });
            return true;
        }
    );
});

test('apiRequest tolerates empty non-json success responses', async () => {
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => {
            throw new Error('empty');
        }
    });

    assert.deepEqual(await apiRequest('/empty'), {});
});
