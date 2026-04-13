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
exports.shopierWebhook = exports.createShopierCheckout = exports.prepareShopierBatchOrders = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const shopierCrypto_1 = require("./shopierCrypto");
const escrow_1 = require("./escrow");
const db = admin.firestore();
const SHOPIER_PAY_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';
function getPaymentBatchRef(id) {
    return db.collection('paymentBatches').doc(id);
}
function requireShopierEnv() {
    const apiKey = process.env.SHOPIER_API_KEY || '';
    const apiSecret = process.env.SHOPIER_API_SECRET || '';
    const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX || '1';
    if (!apiKey || !apiSecret) {
        throw new https_1.HttpsError('failed-precondition', 'Shopier: SHOPIER_API_KEY ve SHOPIER_API_SECRET Firebase Functions ortamında tanımlı olmalı.');
    }
    return { apiKey, apiSecret, websiteIndex };
}
/** Sepet satırları → siparişler + toplu ödeme kaydı (Shopier) */
exports.prepareShopierBatchOrders = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { items } = (request.data || {});
    if (!Array.isArray(items) || items.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'items required');
    }
    if (items.length > 100)
        throw new https_1.HttpsError('invalid-argument', 'too many items');
    let totalCents = 0;
    for (const it of items) {
        const p = Number(it.price);
        if (!Number.isFinite(p) || p <= 0)
            throw new https_1.HttpsError('invalid-argument', 'invalid price');
        totalCents += Math.round(p * 100);
    }
    if (totalCents <= 0)
        throw new https_1.HttpsError('invalid-argument', 'invalid total');
    const batchId = db.collection('paymentBatches').doc().id;
    const newBatchRef = getPaymentBatchRef(batchId);
    await db.runTransaction(async (tx) => {
        const lines = [];
        for (const it of items) {
            const amountCents = Math.round(Number(it.price) * 100);
            const orderRef = db.collection('orders').doc();
            tx.set(orderRef, {
                productId: it.productId,
                productTitle: it.productTitle,
                productImage: it.productImage || '',
                image: it.productImage || '',
                buyerId: uid,
                sellerId: it.sellerId || '',
                sellerName: it.sellerName || 'Satıcı',
                price: Number(it.price),
                amountCents,
                status: 'awaiting_payment',
                escrowStatus: 'none',
                paymentStatus: 'pending',
                paymentProvider: 'shopier',
                batchId: newBatchRef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            lines.push({ orderId: orderRef.id, amountCents });
        }
        tx.set(newBatchRef, {
            buyerId: uid,
            orderIds: lines.map((l) => l.orderId),
            lines,
            totalCents,
            currency: 0,
            status: 'pending',
            provider: 'shopier',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    return { batchId: newBatchRef.id };
});
/** Shopier POST form alanları (imza sunucuda) */
exports.createShopierCheckout = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const { batchId } = (request.data || {});
    if (!batchId || typeof batchId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'batchId required');
    }
    const { apiKey, apiSecret, websiteIndex } = requireShopierEnv();
    const batchSnap = await getPaymentBatchRef(batchId).get();
    if (!batchSnap.exists)
        throw new https_1.HttpsError('not-found', 'batch not found');
    const batch = batchSnap.data();
    if (batch.buyerId !== uid)
        throw new https_1.HttpsError('permission-denied', 'not owner');
    if (batch.status !== 'pending')
        throw new https_1.HttpsError('failed-precondition', 'batch not pending');
    const totalCents = Number(batch.totalCents);
    if (!Number.isInteger(totalCents) || totalCents <= 0) {
        throw new https_1.HttpsError('failed-precondition', 'invalid batch total');
    }
    const totalStr = (totalCents / 100).toFixed(2);
    const currency = Number(batch.currency ?? 0);
    const randomNr = Math.floor(100000 + Math.random() * 900000);
    const platformOrderId = batchId;
    const data = `${randomNr}${platformOrderId}${totalStr}${currency}`;
    const signature = (0, shopierCrypto_1.signShopierForm)(data, apiSecret);
    const user = await admin.auth().getUser(uid);
    const email = user.email || 'musteri@example.com';
    const display = user.displayName || 'Musteri';
    const [firstName, ...rest] = display.split(/\s+/);
    const surname = rest.length ? rest.join(' ') : 'User';
    const appPublic = process.env.APP_PUBLIC_URL || 'https://localhost:5173';
    const callbackUrl = process.env.SHOPIER_CALLBACK_URL || '';
    if (!callbackUrl) {
        throw new https_1.HttpsError('failed-precondition', 'SHOPIER_CALLBACK_URL ayarlayın (shopierWebhook HTTPS URL).');
    }
    const fields = {
        API_key: apiKey,
        website_index: String(websiteIndex),
        platform_order_id: platformOrderId,
        product_name: `Sepet (${batch.orderIds?.length || 0} kalem)`,
        product_type: '1',
        buyer_name: firstName,
        buyer_surname: surname,
        buyer_email: email,
        buyer_phone: '05000000000',
        billing_address: 'Turkey',
        billing_city: 'Istanbul',
        billing_country: 'Turkey',
        billing_postcode: '34000',
        shipping_address: 'Turkey',
        shipping_city: 'Istanbul',
        shipping_country: 'Turkey',
        shipping_postcode: '34000',
        total_order_value: totalStr,
        currency: String(currency),
        platform: '0',
        is_in_frame: '0',
        current_language: '0',
        modul_version: '1.0.0',
        random_nr: String(randomNr),
        signature,
        callback: callbackUrl,
    };
    const returnUrl = `${appPublic.replace(/\/$/, '')}/odeme/shopier/sonuc?batchId=${encodeURIComponent(batchId)}`;
    fields.return_url = returnUrl;
    const intentRef = db.collection('paymentIntents').doc();
    await intentRef.set({
        userId: uid,
        batchId,
        amountCents: totalCents,
        currency: 'TRY',
        provider: 'shopier',
        status: 'requires_action',
        randomNr,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await getPaymentBatchRef(batchId).update({ shopierIntentId: intentRef.id });
    return {
        actionUrl: SHOPIER_PAY_URL,
        fields,
        batchId,
    };
});
exports.shopierWebhook = (0, https_1.onRequest)(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const apiSecret = process.env.SHOPIER_API_SECRET || '';
    if (!apiSecret) {
        res.status(500).json({ ok: false, error: 'SHOPIER_API_SECRET missing' });
        return;
    }
    const body = req.body;
    const flat = {};
    for (const [k, v] of Object.entries(body || {})) {
        flat[k] = typeof v === 'string' ? v : v != null ? String(v) : '';
    }
    if (!(0, shopierCrypto_1.verifyShopierReturnSignature)(flat, apiSecret)) {
        res.status(401).json({ ok: false, error: 'invalid signature' });
        return;
    }
    const platformOrderId = String(flat.platform_order_id || '');
    const status = String(flat.status || '').toLowerCase();
    if (!platformOrderId) {
        res.status(400).json({ ok: false, error: 'platform_order_id required' });
        return;
    }
    if (status !== 'success') {
        await getPaymentBatchRef(platformOrderId).set({ status: 'failed', raw: flat }, { merge: true });
        res.json({ ok: true, ignored: true });
        return;
    }
    try {
        await db.runTransaction(async (tx) => {
            const bRef = getPaymentBatchRef(platformOrderId);
            const bSnap = await tx.get(bRef);
            if (!bSnap.exists)
                throw new Error('batch not found');
            const batch = bSnap.data();
            if (batch.status === 'paid')
                return;
            const lines = (batch.lines || []);
            if (!Array.isArray(lines) || lines.length === 0)
                throw new Error('no lines');
            const buyerId = String(batch.buyerId || '');
            const orderRefs = lines.map((l) => db.collection('orders').doc(l.orderId));
            const orderSnaps = [];
            for (const ref of orderRefs) {
                orderSnaps.push(await tx.get(ref));
            }
            for (let i = 0; i < lines.length; i++) {
                const os = orderSnaps[i];
                if (!os.exists)
                    throw new Error('order not found');
                const order = os.data();
                (0, escrow_1.applyEscrowHoldInTransaction)(tx, db, {
                    orderRef: orderRefs[i],
                    order,
                    buyerUserId: buyerId,
                    amountCents: lines[i].amountCents,
                });
            }
            tx.update(bRef, {
                status: 'paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                shopierPaymentId: flat.payment_id || '',
            });
        });
        res.json({ ok: true });
    }
    catch (e) {
        console.error('shopierWebhook', e);
        res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
});
