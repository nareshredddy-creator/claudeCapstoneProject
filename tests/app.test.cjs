'use strict';

/**
 * Pure-function tests for Vidyarthi Khataa (script.js).
 *
 * script.js is a browser-only entry-point with no exports. The pure business-logic
 * functions are reproduced here verbatim so they can be tested in Node without a DOM.
 * When script.js is refactored to export its core functions, replace the inline
 * definitions below with:
 *   const { parseAmountToPaise, formatINR, ... } = require('../script.js');
 */

// ─── Reproduced pure functions (must stay in sync with script.js) ──────────

const TRANSACTION_TYPES = ['Expense', 'Money Received'];
const AMOUNT_PATTERN = /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/;

const parseAmountToPaise = (value) => {
  const normalizedValue = String(value).trim();
  if (!AMOUNT_PATTERN.test(normalizedValue)) return null;
  const [rupees = '0', paise = ''] = normalizedValue.split('.');
  const amountInPaise =
    BigInt(rupees || '0') * 100n + BigInt((paise + '00').slice(0, 2));
  return amountInPaise > 0n && amountInPaise <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(amountInPaise)
    : null;
};

const formatINR = (amountInPaise) => {
  if (!Number.isSafeInteger(amountInPaise)) {
    throw new RangeError('The amount is outside the supported range.');
  }
  const negative = amountInPaise < 0;
  const absoluteAmount = BigInt(Math.abs(amountInPaise));
  const rupees = absoluteAmount / 100n;
  const paise = String(absoluteAmount % 100n).padStart(2, '0');
  const formattedRupees = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(rupees));
  return `${negative ? '-' : ''}${formattedRupees}.${paise}`;
};

const calculateAvailableBalance = (transactions) =>
  transactions.reduce((balance, transaction) => {
    const signedAmount =
      transaction.type === 'Money Received'
        ? transaction.amountInPaise
        : -transaction.amountInPaise;
    const nextBalance = balance + signedAmount;
    if (!Number.isSafeInteger(nextBalance)) {
      throw new RangeError('The available balance is outside the supported range.');
    }
    return nextBalance;
  }, 10_000); // initial balance: ₹100.00 (10 000 paise)

const isValidTransactionDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = [
    31,
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
};

const formatTransactionDate = (dateString) => {
  if (!isValidTransactionDate(dateString)) {
    throw new TypeError('The transaction date is invalid.');
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const validateTransaction = ({ amount, type, date }) => {
  const errors = {};
  const amountInPaise = parseAmountToPaise(amount);
  if (amountInPaise === null)
    errors.amount = 'Enter an amount greater than zero with no more than two decimal places.';
  if (!TRANSACTION_TYPES.includes(type))
    errors.type = 'Choose Expense or Money Received.';
  if (!isValidTransactionDate(date))
    errors.date = 'Enter a valid transaction date.';
  return { errors, isValid: Object.keys(errors).length === 0, amountInPaise };
};

const isStoredTransaction = (transaction) =>
  transaction !== null &&
  typeof transaction === 'object' &&
  typeof transaction.id === 'string' &&
  TRANSACTION_TYPES.includes(transaction.type) &&
  Number.isSafeInteger(transaction.amountInPaise) &&
  transaction.amountInPaise > 0 &&
  isValidTransactionDate(transaction.date) &&
  (transaction.note === undefined || typeof transaction.note === 'string');

// ─── Test helpers ────────────────────────────────────────────────────────────

const makeTransaction = (overrides = {}) => ({
  id: 'transaction-abc123',
  type: 'Expense',
  amountInPaise: 500,
  date: '2026-01-15',
  ...overrides,
});

// ─── parseAmountToPaise ──────────────────────────────────────────────────────

describe('parseAmountToPaise', () => {
  describe('valid inputs', () => {
    test('whole rupees', () => {
      expect(parseAmountToPaise('10')).toBe(1000);
    });
    test('rupees with two decimal places', () => {
      expect(parseAmountToPaise('10.50')).toBe(1050);
    });
    test('rupees with one decimal place', () => {
      expect(parseAmountToPaise('10.5')).toBe(1050);
    });
    test('paise only (.75)', () => {
      expect(parseAmountToPaise('.75')).toBe(75);
    });
    test('1 rupee', () => {
      expect(parseAmountToPaise('1')).toBe(100);
    });
    test('trims surrounding whitespace', () => {
      expect(parseAmountToPaise('  5.00  ')).toBe(500);
    });
    test('numeric input coerced to string', () => {
      expect(parseAmountToPaise(100)).toBe(10000);
    });
  });

  describe('invalid inputs → null', () => {
    test('zero', () => expect(parseAmountToPaise('0')).toBeNull());
    test('0.00', () => expect(parseAmountToPaise('0.00')).toBeNull());
    test('three decimal places', () => expect(parseAmountToPaise('1.123')).toBeNull());
    test('negative number', () => expect(parseAmountToPaise('-5')).toBeNull());
    test('empty string', () => expect(parseAmountToPaise('')).toBeNull());
    test('alphabetic string', () => expect(parseAmountToPaise('abc')).toBeNull());
    test('mixed alphanumeric', () => expect(parseAmountToPaise('10abc')).toBeNull());
    test('comma as decimal separator', () => expect(parseAmountToPaise('10,50')).toBeNull());
  });
});

// ─── formatINR ───────────────────────────────────────────────────────────────

describe('formatINR', () => {
  test('1 rupee → ₹1.00', () => {
    expect(formatINR(100)).toMatch(/₹\s*1\.00$/);
  });
  test('1 rupee 50 paise → ₹1.50', () => {
    expect(formatINR(150)).toMatch(/₹\s*1\.50$/);
  });
  test('100 rupees → ₹100.00', () => {
    expect(formatINR(10000)).toMatch(/₹\s*100\.00$/);
  });
  test('zero paise → ₹0.00', () => {
    expect(formatINR(0)).toMatch(/₹\s*0\.00$/);
  });
  test('negative amount prefixed with minus', () => {
    expect(formatINR(-500)).toMatch(/^-₹\s*5\.00$/);
  });
  test('single paise padded to two digits', () => {
    expect(formatINR(101)).toMatch(/₹\s*1\.01$/);
  });
  test('throws RangeError for non-safe integer', () => {
    expect(() => formatINR(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    expect(() => formatINR(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      'The amount is outside the supported range.'
    );
  });
  test('throws RangeError for NaN', () => {
    expect(() => formatINR(NaN)).toThrow(RangeError);
  });
  test('throws RangeError for float', () => {
    expect(() => formatINR(1.5)).toThrow(RangeError);
  });
  test('throws RangeError for Infinity', () => {
    expect(() => formatINR(Infinity)).toThrow(RangeError);
  });
});

// ─── calculateAvailableBalance ───────────────────────────────────────────────

describe('calculateAvailableBalance', () => {
  test('no transactions → initial balance of 10 000 paise (₹100)', () => {
    expect(calculateAvailableBalance([])).toBe(10_000);
  });
  test('Expense reduces balance', () => {
    expect(
      calculateAvailableBalance([makeTransaction({ type: 'Expense', amountInPaise: 1000 })])
    ).toBe(9_000);
  });
  test('Money Received increases balance', () => {
    expect(
      calculateAvailableBalance([makeTransaction({ type: 'Money Received', amountInPaise: 5000 })])
    ).toBe(15_000);
  });
  test('multiple mixed transactions', () => {
    // 10 000 + 20 000 − 5 000 − 3 000 = 22 000
    const txns = [
      makeTransaction({ type: 'Money Received', amountInPaise: 20000 }),
      makeTransaction({ id: 'tx-2', type: 'Expense', amountInPaise: 5000 }),
      makeTransaction({ id: 'tx-3', type: 'Expense', amountInPaise: 3000 }),
    ];
    expect(calculateAvailableBalance(txns)).toBe(22_000);
  });
  test('balance can go negative when expenses exceed income', () => {
    // 10 000 − 20 000 = −10 000
    expect(
      calculateAvailableBalance([makeTransaction({ type: 'Expense', amountInPaise: 20000 })])
    ).toBe(-10_000);
  });
  test('throws RangeError when balance overflows Number.MAX_SAFE_INTEGER', () => {
    expect(() =>
      calculateAvailableBalance([
        makeTransaction({ type: 'Money Received', amountInPaise: Number.MAX_SAFE_INTEGER }),
      ])
    ).toThrow(RangeError);
    expect(() =>
      calculateAvailableBalance([
        makeTransaction({ type: 'Money Received', amountInPaise: Number.MAX_SAFE_INTEGER }),
      ])
    ).toThrow('The available balance is outside the supported range.');
  });
});

// ─── isValidTransactionDate ──────────────────────────────────────────────────

describe('isValidTransactionDate', () => {
  describe('valid dates', () => {
    test('standard date', () => expect(isValidTransactionDate('2026-01-15')).toBe(true));
    test('last day of a 31-day month', () => expect(isValidTransactionDate('2026-01-31')).toBe(true));
    test('last day of a 30-day month', () => expect(isValidTransactionDate('2026-04-30')).toBe(true));
    test('Feb 28 on a non-leap year', () => expect(isValidTransactionDate('2026-02-28')).toBe(true));
    test('Feb 29 on a leap year (divisible by 4)', () => expect(isValidTransactionDate('2024-02-29')).toBe(true));
    test('Feb 29 on a century leap year (divisible by 400)', () => expect(isValidTransactionDate('2000-02-29')).toBe(true));
  });

  describe('invalid dates → false', () => {
    test('Feb 29 on a non-leap year', () => expect(isValidTransactionDate('2026-02-29')).toBe(false));
    test('Feb 29 on a century non-leap year (div by 100 not 400)', () => expect(isValidTransactionDate('1900-02-29')).toBe(false));
    test('month 0', () => expect(isValidTransactionDate('2026-00-01')).toBe(false));
    test('month 13', () => expect(isValidTransactionDate('2026-13-01')).toBe(false));
    test('day 0', () => expect(isValidTransactionDate('2026-01-00')).toBe(false));
    test('day beyond month end (Apr 31)', () => expect(isValidTransactionDate('2026-04-31')).toBe(false));
    test('wrong format MM/DD/YYYY', () => expect(isValidTransactionDate('01/15/2026')).toBe(false));
    test('numeric input', () => expect(isValidTransactionDate(20260115)).toBe(false));
    test('null', () => expect(isValidTransactionDate(null)).toBe(false));
    test('undefined', () => expect(isValidTransactionDate(undefined)).toBe(false));
    test('empty string', () => expect(isValidTransactionDate('')).toBe(false));
    test('year 0 is invalid', () => expect(isValidTransactionDate('0000-01-01')).toBe(false));
  });
});

// ─── formatTransactionDate ───────────────────────────────────────────────────

describe('formatTransactionDate', () => {
  test('converts YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatTransactionDate('2026-01-15')).toBe('15/01/2026');
  });
  test('pads single-digit month and day', () => {
    expect(formatTransactionDate('2026-03-05')).toBe('05/03/2026');
  });
  test('throws TypeError for non-date string', () => {
    expect(() => formatTransactionDate('not-a-date')).toThrow(TypeError);
    expect(() => formatTransactionDate('not-a-date')).toThrow('The transaction date is invalid.');
  });
  test('throws TypeError for out-of-range date', () => {
    expect(() => formatTransactionDate('2026-02-30')).toThrow(TypeError);
  });
});

// ─── validateTransaction ─────────────────────────────────────────────────────

describe('validateTransaction', () => {
  const valid = { amount: '100', type: 'Expense', date: '2026-01-15' };

  test('valid Expense returns isValid true with amountInPaise', () => {
    const result = validateTransaction(valid);
    expect(result.isValid).toBe(true);
    expect(result.amountInPaise).toBe(10000);
    expect(result.errors).toEqual({});
  });

  test('valid Money Received is accepted', () => {
    expect(validateTransaction({ ...valid, type: 'Money Received' }).isValid).toBe(true);
  });

  test('valid decimal amount', () => {
    const result = validateTransaction({ ...valid, amount: '5.50' });
    expect(result.isValid).toBe(true);
    expect(result.amountInPaise).toBe(550);
  });

  test('amount zero → amount error', () => {
    const result = validateTransaction({ ...valid, amount: '0' });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
    expect(result.amountInPaise).toBeNull();
  });

  test('negative amount → amount error', () => {
    const result = validateTransaction({ ...valid, amount: '-10' });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  test('three decimal places → amount error', () => {
    const result = validateTransaction({ ...valid, amount: '10.123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  test('unknown type → type error', () => {
    const result = validateTransaction({ ...valid, type: 'Gift' });
    expect(result.isValid).toBe(false);
    expect(result.errors.type).toBeDefined();
  });

  test('invalid date → date error', () => {
    const result = validateTransaction({ ...valid, date: '2026-02-30' });
    expect(result.isValid).toBe(false);
    expect(result.errors.date).toBeDefined();
  });

  test('all three fields invalid → three errors', () => {
    const result = validateTransaction({ amount: '0', type: 'Bribe', date: 'not-a-date' });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(3);
    expect(result.errors.amount).toBeDefined();
    expect(result.errors.type).toBeDefined();
    expect(result.errors.date).toBeDefined();
  });
});

// ─── isStoredTransaction ─────────────────────────────────────────────────────

describe('isStoredTransaction', () => {
  test('valid Expense transaction', () => {
    expect(isStoredTransaction(makeTransaction())).toBe(true);
  });
  test('valid Money Received transaction', () => {
    expect(isStoredTransaction(makeTransaction({ type: 'Money Received' }))).toBe(true);
  });
  test('transaction with optional note is valid', () => {
    expect(isStoredTransaction(makeTransaction({ note: 'Bus fare' }))).toBe(true);
  });
  test('transaction without note field is valid (note is optional)', () => {
    const txn = makeTransaction();
    delete txn.note;
    expect(isStoredTransaction(txn)).toBe(true);
  });

  test('null is invalid', () => expect(isStoredTransaction(null)).toBe(false));
  test('non-object is invalid', () => expect(isStoredTransaction('string')).toBe(false));
  test('missing id → invalid', () => {
    const { id: _removed, ...noId } = makeTransaction();
    expect(isStoredTransaction(noId)).toBe(false);
  });
  test('numeric id → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ id: 123 }))).toBe(false);
  });
  test('unknown type → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ type: 'Bribe' }))).toBe(false);
  });
  test('zero amountInPaise → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ amountInPaise: 0 }))).toBe(false);
  });
  test('negative amountInPaise → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ amountInPaise: -100 }))).toBe(false);
  });
  test('float amountInPaise → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ amountInPaise: 1.5 }))).toBe(false);
  });
  test('invalid date → invalid', () => {
    expect(isStoredTransaction(makeTransaction({ date: 'not-a-date' }))).toBe(false);
  });
  test('numeric note → invalid (note must be string if present)', () => {
    expect(isStoredTransaction(makeTransaction({ note: 42 }))).toBe(false);
  });
});
