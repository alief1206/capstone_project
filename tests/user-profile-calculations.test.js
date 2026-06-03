import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateNutritionTargets,
    getGoalDescription,
    getGoalLabel,
    getProfileDraft,
    getTargetDate,
    getUserProfile,
    normalizeActivity,
    normalizeGoal,
    saveProfileDraft,
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

test('normalizeGoal maps database goals to UI goals', () => {
    assert.equal(normalizeGoal('LOSE_WEIGHT'), 'turunkan');
    assert.equal(normalizeGoal('GAIN_WEIGHT'), 'tambah');
    assert.equal(normalizeGoal('MAINTAIN'), 'jaga');
    assert.equal(normalizeGoal('naikkan'), 'tambah');
    assert.equal(normalizeGoal('turunkan'), 'turunkan');
});

test('normalizeActivity maps UI labels to database values', () => {
    assert.equal(normalizeActivity('Agak aktif'), 'sedang');
    assert.equal(normalizeActivity('Tidak terlalu aktif'), 'rendah');
    assert.equal(normalizeActivity('aktif'), 'aktif');
});

test('goal labels and descriptions match normalized goals', () => {
    assert.equal(getGoalLabel('GAIN_WEIGHT'), 'Tambah Berat Badan');
    assert.equal(getGoalDescription('MAINTAIN'), 'Menjaga kalori seimbang');
    assert.equal(getGoalDescription('LOSE_WEIGHT'), 'Defisit kalori bertahap');
});

test('profile draft is merged and used as fallback profile', () => {
    localStorage.clear();
    saveProfileDraft({ age: 25 });
    saveProfileDraft({ height: 170 });

    assert.deepEqual(getProfileDraft(), { age: 25, height: 170 });
    assert.deepEqual(getUserProfile('missing@example.com'), { age: 25, height: 170 });
});

test('saveUserProfile merges with existing user profile', () => {
    localStorage.clear();
    saveUserProfile('profile@example.com', { age: 30, goal: 'turunkan' });
    saveUserProfile('profile@example.com', { height: 168 });

    assert.deepEqual(getUserProfile('profile@example.com'), {
        age: 30,
        goal: 'turunkan',
        height: 168
    });
});

test('calculateNutritionTargets returns zero target when profile is incomplete', () => {
    assert.deepEqual(calculateNutritionTargets({ age: 20 }, 'turunkan'), {
        goal: 'turunkan',
        tdee: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });
});

test('calculateNutritionTargets computes target from profile and goal', () => {
    const targets = calculateNutritionTargets({
        age: 25,
        gender: 'pria',
        height: 170,
        currentWeight: 70,
        activity: 'sedang',
        goal: 'turunkan'
    });

    assert.equal(targets.goal, 'turunkan');
    assert.equal(targets.tdee, 2258);
    assert.equal(targets.calories, 1758);
    assert.equal(targets.protein, 112);
    assert.equal(targets.fat, 49);
    assert.equal(targets.carbs, 217);
});

test('calculateNutritionTargets prefers AI target calories when available', () => {
    const targets = calculateNutritionTargets({
        age: 25,
        gender: 'wanita',
        height: 160,
        currentWeight: 55,
        activity: 'aktif',
        goal: 'jaga',
        aiTarget: {
            target_kalori: 1850,
            target_protein: 65,
            target_karbo: 250,
            target_lemak: 55
        }
    });

    assert.equal(targets.calories, 1850);
    assert.equal(targets.tdee, 1850);
    assert.equal(targets.protein, 65);
    assert.equal(targets.carbs, 250);
    assert.equal(targets.fat, 55);
    assert.equal(targets.goal, 'jaga');
});

test('getTargetDate returns dash when target and current weight are equal', () => {
    assert.equal(getTargetDate({ currentWeight: 60, targetWeight: 60 }), '-');
});
