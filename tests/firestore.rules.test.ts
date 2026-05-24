/**
 * tests/firestore.rules.test.ts
 * Security rules tests for PayTrace Firestore.
 *
 * Uses @firebase/rules-unit-testing to test against the local Firestore emulator.
 * Run with: firebase emulators:exec --only firestore "npx jest tests/firestore.rules.test.ts"
 *
 * Or install globally: npm i -D @firebase/rules-unit-testing
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

// ─── Test Environment Setup ───────────────────────────────────────────────────

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'paytrace-test';
const UID_A = 'user-a';
const UID_B = 'user-b';

const RULES_PATH = path.resolve(__dirname, '../firestore.rules');

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authedDb(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function unauthedDb() {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedTransaction(uid: string, personId: string, txId: string, data: Record<string, any>) {
  await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
    await ctx.firestore()
      .collection('users').doc(uid)
      .collection('people').doc(personId)
      .collection('transactions').doc(txId)
      .set(data);
  });
}

async function seedPerson(uid: string, personId: string, data: Record<string, any>) {
  await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
    await ctx.firestore()
      .collection('users').doc(uid)
      .collection('people').doc(personId)
      .set(data);
  });
}

function validTxData() {
  return {
    amount: 100,
    direction: 'lent',
    date: new Date(),
    note: 'test',
  };
}

// ─── User profile rules ───────────────────────────────────────────────────────

describe('User profile — /users/{uid}', () => {
  test('owner can read their own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
      await ctx.firestore().collection('users').doc(UID_A).set({ displayName: 'User A' });
    });
    const db = authedDb(UID_A);
    await assertSucceeds(db.collection('users').doc(UID_A).get());
  });

  test('owner can write their own profile', async () => {
    const db = authedDb(UID_A);
    await assertSucceeds(db.collection('users').doc(UID_A).set({ displayName: 'Updated' }));
  });

  test('unauthenticated user cannot read any profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
      await ctx.firestore().collection('users').doc(UID_A).set({ displayName: 'User A' });
    });
    const db = unauthedDb();
    await assertFails(db.collection('users').doc(UID_A).get());
  });

  test('user B cannot read user A profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
      await ctx.firestore().collection('users').doc(UID_A).set({ displayName: 'User A' });
    });
    const db = authedDb(UID_B);
    await assertFails(db.collection('users').doc(UID_A).get());
  });

  test('user B cannot write to user A profile', async () => {
    const db = authedDb(UID_B);
    await assertFails(db.collection('users').doc(UID_A).set({ displayName: 'Hacked' }));
  });
});

// ─── People sub-collection ─────────────────────────────────────────────────────

describe('People — /users/{uid}/people/{personId}', () => {
  test('owner can create a person', async () => {
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A).collection('people').add({ name: 'Alice' })
    );
  });

  test('owner can read people', async () => {
    await seedPerson(UID_A, 'p1', { name: 'Alice' });
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A).collection('people').doc('p1').get()
    );
  });

  test('owner can update a person', async () => {
    await seedPerson(UID_A, 'p1', { name: 'Alice' });
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A).collection('people').doc('p1').update({ name: 'Alice Updated' })
    );
  });

  test('owner can delete a person', async () => {
    await seedPerson(UID_A, 'p1', { name: 'Alice' });
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A).collection('people').doc('p1').delete()
    );
  });

  test('unauthenticated user cannot access people', async () => {
    await seedPerson(UID_A, 'p1', { name: 'Alice' });
    const db = unauthedDb();
    await assertFails(
      db.collection('users').doc(UID_A).collection('people').doc('p1').get()
    );
  });

  test('user B cannot access user A people', async () => {
    await seedPerson(UID_A, 'p1', { name: 'Alice' });
    const db = authedDb(UID_B);
    await assertFails(
      db.collection('users').doc(UID_A).collection('people').doc('p1').get()
    );
  });
});

// ─── Transaction sub-collection ───────────────────────────────────────────────

describe('Transactions — /users/{uid}/people/{personId}/transactions/{txId}', () => {
  const txPath = (uid: string, personId: string, txId: string) =>
    authedDb(uid)
      .collection('users').doc(uid)
      .collection('people').doc(personId)
      .collection('transactions').doc(txId);

  test('owner can read a transaction', async () => {
    await seedTransaction(UID_A, 'p1', 'tx1', validTxData());
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').doc('tx1')
        .get()
    );
  });

  test('owner can create a valid transaction', async () => {
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').add(validTxData())
    );
  });

  test('owner can delete a transaction', async () => {
    await seedTransaction(UID_A, 'p1', 'tx1', validTxData());
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').doc('tx1')
        .delete()
    );
  });

  test('owner cannot create transaction with amount = 0', async () => {
    const db = authedDb(UID_A);
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').add({ ...validTxData(), amount: 0 })
    );
  });

  test('owner cannot create transaction with negative amount', async () => {
    const db = authedDb(UID_A);
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').add({ ...validTxData(), amount: -50 })
    );
  });

  test('owner cannot create transaction with invalid direction', async () => {
    const db = authedDb(UID_A);
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').add({ ...validTxData(), direction: 'invalid' })
    );
  });

  test('owner cannot create transaction without a date', async () => {
    const db = authedDb(UID_A);
    const { date, ...noDate } = validTxData();
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').add(noDate)
    );
  });

  test('unauthenticated user cannot read transactions', async () => {
    await seedTransaction(UID_A, 'p1', 'tx1', validTxData());
    const db = unauthedDb();
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').doc('tx1')
        .get()
    );
  });

  test('user B cannot read user A transactions', async () => {
    await seedTransaction(UID_A, 'p1', 'tx1', validTxData());
    const db = authedDb(UID_B);
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('people').doc('p1')
        .collection('transactions').doc('tx1')
        .get()
    );
  });
});

// ─── Settlements sub-collection ───────────────────────────────────────────────

describe('Settlements — /users/{uid}/settlements/{settlementId}', () => {
  test('owner can read and write settlements', async () => {
    const db = authedDb(UID_A);
    await assertSucceeds(
      db.collection('users').doc(UID_A)
        .collection('settlements').add({ personId: 'p1', amount: 100, settledAt: new Date() })
    );
  });

  test('user B cannot write to user A settlements', async () => {
    const db = authedDb(UID_B);
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('settlements').add({ personId: 'p1', amount: 100 })
    );
  });

  test('unauthenticated user cannot read settlements', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx: any) => {
      await ctx.firestore()
        .collection('users').doc(UID_A)
        .collection('settlements').doc('s1')
        .set({ personId: 'p1', amount: 100 });
    });
    const db = unauthedDb();
    await assertFails(
      db.collection('users').doc(UID_A)
        .collection('settlements').doc('s1')
        .get()
    );
  });
});
