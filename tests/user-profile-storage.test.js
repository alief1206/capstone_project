import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getProfilePhoto,
    getUserProfile,
    saveProfilePhoto,
    saveUserProfile
} from '../src/utils/userProfileStorage.js';

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

test('saveProfilePhoto stores photo data url in the selected user profile', () => {
    const email = 'avatar@example.com';
    const photo = 'data:image/png;base64,abc123';

    saveUserProfile(email, { goal: 'turunkan' });
    saveProfilePhoto(email, photo);

    assert.equal(getUserProfile(email).profilePhoto, photo);
    assert.equal(getProfilePhoto(email), photo);
});

test('profile photos stay separated per email', () => {
    saveProfilePhoto('first@example.com', 'data:image/png;base64,first');
    saveProfilePhoto('second@example.com', 'data:image/png;base64,second');

    assert.equal(getProfilePhoto('first@example.com'), 'data:image/png;base64,first');
    assert.equal(getProfilePhoto('second@example.com'), 'data:image/png;base64,second');
});

test('getProfilePhoto prefers provided profile state', () => {
    saveProfilePhoto('state@example.com', 'data:image/png;base64,stored');

    assert.equal(
        getProfilePhoto('state@example.com', { profilePhoto: 'data:image/png;base64,state' }),
        'data:image/png;base64,state'
    );
});
