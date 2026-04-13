"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsVerify = exports.smsSend = exports.markDelivered = exports.openDispute = exports.confirmDelivery = exports.mockCapturePayment = exports.mockPaymentWebhook = exports.createPaymentIntent = exports.testSMTPConnection = exports.sendWelcomeEmail = exports.checkEmailVerificationStatus = exports.verifyPasswordResetCode = exports.sendPasswordResetEmail = exports.resendVerificationEmail = exports.verifyEmailCode = exports.sendVerificationEmail = exports.shopierWebhook = exports.createShopierCheckout = exports.prepareShopierBatchOrders = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const escrow_1 = require("./payment/escrow");
(0, v2_1.setGlobalOptions)({ region: 'europe-west1' });
admin.initializeApp();
const db = admin.firestore();
var shopierHandlers_1 = require("./payment/shopierHandlers");
Object.defineProperty(exports, "prepareShopierBatchOrders", { enumerable: true, get: function () { return shopierHandlers_1.prepareShopierBatchOrders; } });
Object.defineProperty(exports, "createShopierCheckout", { enumerable: true, get: function () { return shopierHandlers_1.createShopierCheckout; } });
Object.defineProperty(exports, "shopierWebhook", { enumerable: true, get: function () { return shopierHandlers_1.shopierWebhook; } });
var email_1 = require("./email");
Object.defineProperty(exports, "sendVerificationEmail", { enumerable: true, get: function () { return email_1.sendVerificationEmail; } });
Object.defineProperty(exports, "verifyEmailCode", { enumerable: true, get: function () { return email_1.verifyEmailCode; } });
Object.defineProperty(exports, "resendVerificationEmail", { enumerable: true, get: function () { return email_1.resendVerificationEmail; } });
Object.defineProperty(exports, "sendPasswordResetEmail", { enumerable: true, get: function () { return email_1.sendPasswordResetEmail; } });
Object.defineProperty(exports, "verifyPasswordResetCode", { enumerable: true, get: function () { return email_1.verifyPasswordResetCode; } });
Object.defineProperty(exports, "checkEmailVerificationStatus", { enumerable: true, get: function () { return email_1.checkEmailVerificationStatus; } });
Object.defineProperty(exports, "sendWelcomeEmail", { enumerable: true, get: function () { return email_1.sendWelcomeEmail; } });
Object.defineProperty(exports, "testSMTPConnection", { enumerable: true, get: function () { return email_1.testSMTPConnection; } });
// -----------------------------------------------------------------------------
// Mock Payment Intent + Webhook (provider erişimi gelene kadar)
// -----------------------------------------------------------------------------
exports.createPaymentIntent = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { orderId, amountCents } = (request.data || {});
    if (!orderId || typeof orderId !== 'string')
        throw new https_1.HttpsError('invalid-argument', 'orderId required');
    if (!Number.isInteger(amountCents) || amountCents <= 0)
        throw new https_1.HttpsError('invalid-argument', 'amountCents must be positive int');
    const amountCentsNum = amountCents;
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
});
exports.mockPaymentWebhook = (0, https_1.onRequest)(async (req, res) => {
    if (req.method !== 'POST')
        return res.status(405).send('Method Not Allowed');
    const { intentId, status } = (req.body || {});
    if (!intentId || typeof intentId !== 'string')
        return res.status(400).send('intentId required');
    if (!status || typeof status !== 'string')
        return res.status(400).send('status required');
    const intentRef = db.collection('paymentIntents').doc(intentId);
    const intentSnap = await intentRef.get();
    if (!intentSnap.exists)
        return res.status(404).send('intent not found');
    const intent = intentSnap.data();
    const orderId = String(intent.orderId || '');
    if (!orderId)
        return res.status(400).send('intent missing orderId');
    // paid -> escrow hold
    if (status === 'captured') {
        await db.runTransaction(async (tx) => {
            tx.update(intentRef, { status: 'captured', capturedAt: admin.firestore.FieldValue.serverTimestamp() });
            const orderRef = db.collection('orders').doc(orderId);
            const orderSnap = await tx.get(orderRef);
            if (!orderSnap.exists)
                throw new Error('order not found');
            const order = orderSnap.data();
            if (order.buyerId !== intent.userId)
                throw new Error('buyer mismatch');
            tx.update(orderRef, {
                paymentStatus: 'captured',
                status: 'paid',
                escrowStatus: 'held',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // hold funds for seller (held ledger)
            const sellerId = String(order.sellerId || '');
            const amountCents = Number(intent.amountCents || 0);
            if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0)
                throw new Error('invalid order');
            const sellerRef = db.collection('users').doc(sellerId);
            tx.set(sellerRef, {
                balanceHeldCents: admin.firestore.FieldValue.increment(amountCents)
            }, { merge: true });
        });
    }
    else if (status === 'failed') {
        await intentRef.update({ status: 'failed' });
    }
    return res.json({ ok: true });
});
exports.mockCapturePayment = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { intentId } = (request.data || {});
    if (!intentId || typeof intentId !== 'string')
        throw new https_1.HttpsError('invalid-argument', 'intentId required');
    const intentRef = db.collection('paymentIntents').doc(intentId);
    await db.runTransaction(async (tx) => {
        const intentSnap = await tx.get(intentRef);
        if (!intentSnap.exists)
            throw new https_1.HttpsError('not-found', 'intent not found');
        const intent = intentSnap.data();
        if (intent.userId !== uid)
            throw new https_1.HttpsError('permission-denied', 'not owner');
        const orderId = String(intent.orderId || '');
        if (!orderId)
            throw new https_1.HttpsError('failed-precondition', 'intent missing orderId');
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists)
            throw new https_1.HttpsError('not-found', 'order not found');
        const order = orderSnap.data();
        if (order.buyerId !== uid)
            throw new https_1.HttpsError('permission-denied', 'buyer mismatch');
        const amountCents = Number(intent.amountCents || order.amountCents || Math.round(Number(order.price || 0) * 100));
        const sellerId = String(order.sellerId || '');
        if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0) {
            throw new https_1.HttpsError('failed-precondition', 'invalid order');
        }
        (0, escrow_1.applyEscrowHoldInTransaction)(tx, db, {
            orderRef,
            order,
            buyerUserId: uid,
            amountCents,
            intentRef,
        });
    });
    return { status: 'captured' };
});
// -----------------------------------------------------------------------------
// Order actions: confirm delivery / dispute (client direct write yerine)
// -----------------------------------------------------------------------------
exports.confirmDelivery = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { orderId } = (request.data || {});
    if (!orderId || typeof orderId !== 'string')
        throw new https_1.HttpsError('invalid-argument', 'orderId required');
    await db.runTransaction(async (tx) => {
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists)
            throw new https_1.HttpsError('not-found', 'order not found');
        const order = orderSnap.data();
        if (order.buyerId !== uid)
            throw new https_1.HttpsError('permission-denied', 'not buyer');
        if (order.status === 'disputed')
            throw new https_1.HttpsError('failed-precondition', 'order disputed');
        if (order.escrowStatus !== 'held')
            throw new https_1.HttpsError('failed-precondition', 'escrow not held');
        const sellerId = String(order.sellerId || '');
        const amountCents = Number(order.amountCents || Math.round(Number(order.price || 0) * 100));
        if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0)
            throw new https_1.HttpsError('failed-precondition', 'invalid order amount');
        const sellerRef = db.collection('users').doc(sellerId);
        tx.set(sellerRef, {
            balanceHeldCents: admin.firestore.FieldValue.increment(-amountCents),
            balanceAvailableCents: admin.firestore.FieldValue.increment(amountCents)
        }, { merge: true });
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
exports.openDispute = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { orderId, reason } = (request.data || {});
    if (!orderId || typeof orderId !== 'string')
        throw new https_1.HttpsError('invalid-argument', 'orderId required');
    await db.runTransaction(async (tx) => {
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists)
            throw new https_1.HttpsError('not-found', 'order not found');
        const order = orderSnap.data();
        const isBuyer = order.buyerId === uid;
        const isSeller = order.sellerId === uid;
        if (!isBuyer && !isSeller)
            throw new https_1.HttpsError('permission-denied', 'not participant');
        if (order.status === 'completed')
            throw new https_1.HttpsError('failed-precondition', 'order completed');
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
exports.markDelivered = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { orderId } = (request.data || {});
    if (!orderId || typeof orderId !== 'string')
        throw new https_1.HttpsError('invalid-argument', 'orderId required');
    await db.runTransaction(async (tx) => {
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists)
            throw new https_1.HttpsError('not-found', 'order not found');
        const order = orderSnap.data();
        if (String(order.sellerId || '') !== uid)
            throw new https_1.HttpsError('permission-denied', 'not seller');
        if (order.status === 'disputed')
            throw new https_1.HttpsError('failed-precondition', 'order disputed');
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
exports.smsSend = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { phone } = (request.data || {});
    const clean = String(phone || '').replace(/[^\d+]/g, '').trim();
    if (clean.length < 8)
        throw new https_1.HttpsError('invalid-argument', 'phone required');
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
exports.smsVerify = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { phone, code } = (request.data || {});
    const clean = String(phone || '').replace(/[^\d+]/g, '').trim();
    const c = String(code || '').trim();
    if (clean.length < 8)
        throw new https_1.HttpsError('invalid-argument', 'phone required');
    if (!/^\d{6}$/.test(c))
        throw new https_1.HttpsError('invalid-argument', 'code must be 6 digits');
    // Find latest OTP for this user+phone
    const snap = await db
        .collection('smsOtps')
        .where('userId', '==', uid)
        .where('phone', '==', clean)
        .orderBy('expiresAt', 'desc')
        .limit(1)
        .get();
    if (snap.empty)
        throw new https_1.HttpsError('failed-precondition', 'otp not found');
    const doc0 = snap.docs[0];
    const otp = doc0.data();
    if (otp.code !== c)
        throw new https_1.HttpsError('permission-denied', 'invalid code');
    if (otp.expiresAt?.toMillis && otp.expiresAt.toMillis() < Date.now())
        throw new https_1.HttpsError('deadline-exceeded', 'code expired');
    await db.runTransaction(async (tx) => {
        tx.delete(doc0.ref);
        tx.set(db.collection('users').doc(uid), { smsVerified: true, phone: clean, withdrawEnabled: true }, { merge: true });
    });
    return { ok: true };
});
