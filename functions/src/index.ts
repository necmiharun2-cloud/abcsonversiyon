import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { applyEscrowHoldInTransaction } from './payment/escrow';

setGlobalOptions({ region: 'europe-west1' });

admin.initializeApp();
const db = admin.firestore();

export { prepareShopierBatchOrders, createShopierCheckout, shopierWebhook } from './payment/shopierHandlers';
export {
  sendVerificationEmail,
  verifyEmailCode,
  resendVerificationEmail,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  checkEmailVerificationStatus,
  sendWelcomeEmail,
  testSMTPConnection,
} from './email';

// SSR for SEO
export { ssr, botSsr } from './ssr';

// -----------------------------------------------------------------------------
// Mock Payment Intent + Webhook (provider erişimi gelene kadar)
// -----------------------------------------------------------------------------
export const createPaymentIntent = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { orderId, amountCents } = (request.data || {}) as { orderId?: string; amountCents?: number };
  if (!orderId || typeof orderId !== 'string') throw new HttpsError('invalid-argument', 'orderId required');
  if (!Number.isInteger(amountCents) || (amountCents as number) <= 0) throw new HttpsError('invalid-argument', 'amountCents must be positive int');
  const amountCentsNum = amountCents as number;

  const intentRef = db.collection('paymentIntents').doc();
  await intentRef.set({
    userId: uid,
    orderId,
    amount: amountCentsNum / 100,
    amountCents: amountCentsNum,
    currency: 'TRY',
    method: 'card',
    status: 'requires_action',
    provider: 'mock',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // mock yönlendirme linki (frontend bunu kullanıp "ödemeyi tamamla" simüle edebilir)
  return { intentId: intentRef.id };
}) as unknown as (request: CallableRequest) => Promise<{ intentId: string }>;

export const mockPaymentWebhook = onRequest(async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { intentId, status } = (req.body || {}) as { intentId?: string; status?: string };
  if (!intentId || typeof intentId !== 'string') return res.status(400).send('intentId required');
  if (!status || typeof status !== 'string') return res.status(400).send('status required');

  const intentRef = db.collection('paymentIntents').doc(intentId);
  const intentSnap = await intentRef.get();
  if (!intentSnap.exists) return res.status(404).send('intent not found');

  const intent = intentSnap.data() as any;
  const orderId = String(intent.orderId || '');
  if (!orderId) return res.status(400).send('intent missing orderId');

  // paid -> escrow hold
  if (status === 'captured') {
    await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
      tx.update(intentRef, { status: 'captured', capturedAt: admin.firestore.FieldValue.serverTimestamp() });
      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) throw new Error('order not found');
      const order = orderSnap.data() as any;
      if (order.buyerId !== intent.userId) throw new Error('buyer mismatch');

      tx.update(orderRef, {
        paymentStatus: 'captured',
        status: 'paid',
        escrowStatus: 'held',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // hold funds for seller (held ledger)
      const sellerId = String(order.sellerId || '');
      const amountCents = Number(intent.amountCents || 0);
      if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0) throw new Error('invalid order');

      const sellerRef = db.collection('users').doc(sellerId);
      tx.set(
        sellerRef,
        {
          balanceHeldCents: admin.firestore.FieldValue.increment(amountCents)
        },
        { merge: true }
      );
    });
  } else if (status === 'failed') {
    await intentRef.update({ status: 'failed' });
  }

  return res.json({ ok: true });
});

export const mockCapturePayment = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { intentId } = (request.data || {}) as { intentId?: string };
  if (!intentId || typeof intentId !== 'string') throw new HttpsError('invalid-argument', 'intentId required');

  const intentRef = db.collection('paymentIntents').doc(intentId);

  await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    const intentSnap = await tx.get(intentRef);
    if (!intentSnap.exists) throw new HttpsError('not-found', 'intent not found');
    const intent = intentSnap.data() as any;
    if (intent.userId !== uid) throw new HttpsError('permission-denied', 'not owner');

    const orderId = String(intent.orderId || '');
    if (!orderId) throw new HttpsError('failed-precondition', 'intent missing orderId');

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError('not-found', 'order not found');
    const order = orderSnap.data() as Record<string, unknown>;
    if (order.buyerId !== uid) throw new HttpsError('permission-denied', 'buyer mismatch');

    const amountCents = Number(intent.amountCents || order.amountCents || Math.round(Number(order.price || 0) * 100));
    const sellerId = String(order.sellerId || '');
    if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0) {
      throw new HttpsError('failed-precondition', 'invalid order');
    }

    applyEscrowHoldInTransaction(tx, db, {
      orderRef,
      order,
      buyerUserId: uid,
      amountCents,
      intentRef,
    });
  });

  return { status: 'captured' as const };
});

// -----------------------------------------------------------------------------
// Order actions: confirm delivery / dispute (client direct write yerine)
// -----------------------------------------------------------------------------
export const confirmDelivery = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { orderId } = (request.data || {}) as { orderId?: string };
  if (!orderId || typeof orderId !== 'string') throw new HttpsError('invalid-argument', 'orderId required');

  await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError('not-found', 'order not found');
    const order = orderSnap.data() as any;
    if (order.buyerId !== uid) throw new HttpsError('permission-denied', 'not buyer');
    if (order.status === 'disputed') throw new HttpsError('failed-precondition', 'order disputed');
    if (order.escrowStatus !== 'held') throw new HttpsError('failed-precondition', 'escrow not held');

    const sellerId = String(order.sellerId || '');
    const amountCents = Number(order.amountCents || Math.round(Number(order.price || 0) * 100));
    if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0) throw new HttpsError('failed-precondition', 'invalid order amount');

    const sellerRef = db.collection('users').doc(sellerId);
    tx.set(
      sellerRef,
      {
        balanceHeldCents: admin.firestore.FieldValue.increment(-amountCents),
        balanceAvailableCents: admin.firestore.FieldValue.increment(amountCents)
      },
      { merge: true }
    );

    tx.update(orderRef, {
      status: 'completed',
      escrowStatus: 'released',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    tx.set(db.collection('transactions').doc(), {
      userId: sellerId,
      type: 'escrow_release',
      amount: amountCents / 100,
      amountCents,
      direction: 'credit',
      refId: orderId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: { buyerId: uid }
    });
  });

  return { ok: true };
});

export const openDispute = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { orderId, reason } = (request.data || {}) as { orderId?: string; reason?: string };
  if (!orderId || typeof orderId !== 'string') throw new HttpsError('invalid-argument', 'orderId required');

  await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError('not-found', 'order not found');
    const order = orderSnap.data() as any;

    const isBuyer = order.buyerId === uid;
    const isSeller = order.sellerId === uid;
    if (!isBuyer && !isSeller) throw new HttpsError('permission-denied', 'not participant');

    if (order.status === 'completed') throw new HttpsError('failed-precondition', 'order completed');

    tx.update(orderRef, {
      status: 'disputed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    tx.set(db.collection('disputes').doc(), {
      orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      reason: String(reason || 'Uyuşmazlık bildirildi.'),
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  return { ok: true };
});

export const markDelivered = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { orderId } = (request.data || {}) as { orderId?: string };
  if (!orderId || typeof orderId !== 'string') throw new HttpsError('invalid-argument', 'orderId required');

  await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError('not-found', 'order not found');
    const order = orderSnap.data() as any;
    if (String(order.sellerId || '') !== uid) throw new HttpsError('permission-denied', 'not seller');
    if (order.status === 'disputed') throw new HttpsError('failed-precondition', 'order disputed');

    tx.update(orderRef, {
      status: 'delivered',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deliveredAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  return { ok: true };
});

// -----------------------------------------------------------------------------
// SMS OTP (mock): provider erişimi gelene kadar emulator-friendly
// -----------------------------------------------------------------------------
export const smsSend = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { phone } = (request.data || {}) as { phone?: string };
  const clean = String(phone || '').replace(/[^\d+]/g, '').trim();
  if (clean.length < 8) throw new HttpsError('invalid-argument', 'phone required');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const otpRef = db.collection('smsOtps').doc();
  await otpRef.set({
    userId: uid,
    phone: clean,
    code,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000)
  });

  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  return { ok: true, devCode: isEmulator ? code : null };
});

export const smsVerify = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const { phone, code } = (request.data || {}) as { phone?: string; code?: string };
  const clean = String(phone || '').replace(/[^\d+]/g, '').trim();
  const c = String(code || '').trim();
  if (clean.length < 8) throw new HttpsError('invalid-argument', 'phone required');
  if (!/^\d{6}$/.test(c)) throw new HttpsError('invalid-argument', 'code must be 6 digits');

  // Find latest OTP for this user+phone
  const snap = await db
    .collection('smsOtps')
    .where('userId', '==', uid)
    .where('phone', '==', clean)
    .orderBy('expiresAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) throw new HttpsError('failed-precondition', 'otp not found');
  const doc0 = snap.docs[0];
  const otp = doc0.data() as any;
  if (otp.code !== c) throw new HttpsError('permission-denied', 'invalid code');
  if (otp.expiresAt?.toMillis && otp.expiresAt.toMillis() < Date.now()) throw new HttpsError('deadline-exceeded', 'code expired');

  await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    tx.delete(doc0.ref);
    tx.set(
      db.collection('users').doc(uid),
      { smsVerified: true, phone: clean, withdrawEnabled: true },
      { merge: true }
    );
  });

  return { ok: true };
});

