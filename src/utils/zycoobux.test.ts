import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRICE_PER_ROBUX,
  CUSTOM_MIN_ROBUX,
  CUSTOM_MAX_ROBUX,
  CUSTOM_STEP,
  QRIS_MAX_ROBUX,
} from '../../lib/config';
import { USERNAME_REGEX } from '../../lib/roblox';
import {
  timingSafeCompare,
  createSessionToken,
  verifySessionToken,
  verifyAdminCredentials,
} from '../../lib/auth';

test('Price calculation strictly adheres to Rp 165 per Robux', () => {
  assert.equal(50 * PRICE_PER_ROBUX, 8250);
  assert.equal(100 * PRICE_PER_ROBUX, 16500);
  assert.equal(250 * PRICE_PER_ROBUX, 41250);
  assert.equal(500 * PRICE_PER_ROBUX, 82500);
  assert.equal(1000 * PRICE_PER_ROBUX, 165000);
  assert.equal(2500 * PRICE_PER_ROBUX, 412500);
  assert.equal(5000 * PRICE_PER_ROBUX, 825000);
});

test('QRIS payment limit is strictly 2500 Robux', () => {
  assert.equal(QRIS_MAX_ROBUX, 2500);

  const canPayWithQris = (amount: number) => amount <= QRIS_MAX_ROBUX;
  assert.equal(canPayWithQris(50), true);
  assert.equal(canPayWithQris(1000), true);
  assert.equal(canPayWithQris(2500), true);
  assert.equal(canPayWithQris(2550), false);
  assert.equal(canPayWithQris(3000), false);
  assert.equal(canPayWithQris(5000), false);
});

test('Roblox Username Regex validates 3-20 characters without illegal symbols', () => {
  assert.equal(USERNAME_REGEX.test('Builderman'), true);
  assert.equal(USERNAME_REGEX.test('Roblox_User_99'), true);
  assert.equal(USERNAME_REGEX.test('ab'), false); // too short
  assert.equal(USERNAME_REGEX.test('this_username_is_way_too_long_for_roblox'), false); // too long
  assert.equal(USERNAME_REGEX.test('user@name!'), false); // illegal characters
});

test('Robux order constraints: multiple of 50 between 50 and 50000', () => {
  const isValidAmount = (amt: number) =>
    Number.isInteger(amt) &&
    amt >= CUSTOM_MIN_ROBUX &&
    amt <= CUSTOM_MAX_ROBUX &&
    amt % CUSTOM_STEP === 0;

  assert.equal(isValidAmount(50), true);
  assert.equal(isValidAmount(250), true);
  assert.equal(isValidAmount(2500), true);
  assert.equal(isValidAmount(50000), true);
  assert.equal(isValidAmount(49), false);
  assert.equal(isValidAmount(75), false);
  assert.equal(isValidAmount(50050), false);
});

test('Timing-safe auth and HMAC token generation & verification for zycoo admin', () => {
  assert.equal(timingSafeCompare('zycoo', 'zycoo'), true);
  assert.equal(timingSafeCompare('zycoo', 'admin'), false);

  // Test admin credentials
  assert.equal(verifyAdminCredentials('zycoo', 'Gua.azky.277'), true);
  assert.equal(verifyAdminCredentials('zycoo', 'WrongPassword!'), false);
  assert.equal(verifyAdminCredentials('other_user', 'Gua.azky.277'), false);

  const token = createSessionToken('zycoo');
  assert.ok(typeof token === 'string');
  assert.ok(token.includes('.'));

  const result = verifySessionToken(token);
  assert.equal(result.valid, true);
  assert.equal(result.username, 'zycoo');

  const invalidToken = token + 'tampered';
  assert.equal(verifySessionToken(invalidToken).valid, false);
});
