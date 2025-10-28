import { assertValidRange, isTimeRangeOverlapping } from '../src/lib/blocks/conflicts';

function assert(name: string, cond: boolean) {
  if (!cond) throw new Error(`FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

function run() {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 1000);
  assert('valid range ok', (() => { assertValidRange(now, later); return true; })());

  const a1 = new Date('2025-01-01T10:00:00Z');
  const a2 = new Date('2025-01-01T11:00:00Z');
  const b1 = new Date('2025-01-01T10:30:00Z');
  const b2 = new Date('2025-01-01T11:30:00Z');
  assert('overlap true', isTimeRangeOverlapping(a1, a2, b1, b2));

  const c1 = new Date('2025-01-01T12:00:00Z');
  const c2 = new Date('2025-01-01T13:00:00Z');
  assert('overlap false', !isTimeRangeOverlapping(a1, a2, c1, c2));
}

run();

