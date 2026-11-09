import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRobloxTax,
  calculateTargetPrice,
  calculateDevEx,
  formatNumber,
} from './calculator';

test('calculateRobloxTax computes 70% net payout and 30% tax', () => {
  const result100 = calculateRobloxTax(100);
  assert.equal(result100.netReceived, 70);
  assert.equal(result100.taxDeducted, 30);

  const result10 = calculateRobloxTax(10);
  assert.equal(result10.netReceived, 7);
  assert.equal(result10.taxDeducted, 3);

  const result1 = calculateRobloxTax(1);
  assert.equal(result1.netReceived, 0); // floor(1 * 0.7) = 0
  assert.equal(result1.taxDeducted, 1);

  const resultZero = calculateRobloxTax(0);
  assert.equal(resultZero.netReceived, 0);
  assert.equal(resultZero.taxDeducted, 0);
});

test('calculateTargetPrice finds the correct listing price for desired payout', () => {
  assert.equal(calculateTargetPrice(70), 100);
  assert.equal(calculateTargetPrice(100), 143);
  assert.equal(calculateTargetPrice(0), 0);

  // Verification check: 143 * 0.7 = 100.1, floor is 100!
  const payout = calculateRobloxTax(143);
  assert.equal(payout.netReceived, 100);
});

test('calculateDevEx checks eligibility and yields correct USD and IDR', () => {
  const underMin = calculateDevEx(30000, 16000);
  assert.equal(underMin.eligible, false);
  assert.equal(underMin.usdAmount, 105);
  assert.equal(underMin.idrAmount, 105 * 16000);

  const exactMin = calculateDevEx(50000, 16000);
  assert.equal(exactMin.eligible, true);
  assert.equal(exactMin.usdAmount, 175);
  assert.equal(exactMin.idrAmount, 2800000);

  const higher = calculateDevEx(100000, 15000);
  assert.equal(higher.eligible, true);
  assert.equal(higher.usdAmount, 350);
  assert.equal(higher.idrAmount, 5250000);
});

test('formatNumber formats numbers in standard locale format', () => {
  assert.ok(typeof formatNumber(1250000) === 'string');
  assert.ok(formatNumber(1000).includes('1'));
});
