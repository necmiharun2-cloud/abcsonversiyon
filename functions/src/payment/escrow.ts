import * as admin from 'firebase-admin';
import type { DocumentReference, Firestore, Transaction } from 'firebase-admin/firestore';

/**
 * Tek sipariş için ödeme sonrası escrow (satıcıda tutulan bakiye).
 * mockCapturePayment ve Shopier webhook ortak kullanır.
 */
export function applyEscrowHoldInTransaction(
  tx: Transaction,
  db: Firestore,
  params: {
    orderRef: DocumentReference;
    order: Record<string, unknown>;
    buyerUserId: string;
    amountCents: number;
    intentRef?: DocumentReference;
  }
): void {
  const { orderRef, order, buyerUserId, amountCents, intentRef } = params;
  if (String(order.buyerId || '') !== buyerUserId) {
    throw new Error('buyer mismatch');
  }
  const sellerId = String(order.sellerId || '');
  if (!sellerId || !Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error('invalid order for escrow');
  }

  if (intentRef) {
    tx.update(intentRef, {
      status: 'captured',
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  tx.update(orderRef, {
    paymentStatus: 'captured',
    status: 'paid',
    escrowStatus: 'held',
    amountCents,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  tx.set(
    db.collection('users').doc(sellerId),
    { balanceHeldCents: admin.firestore.FieldValue.increment(amountCents) },
    { merge: true }
  );
}
