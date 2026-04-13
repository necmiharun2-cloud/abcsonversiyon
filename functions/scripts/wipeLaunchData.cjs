/**
 * Canlıya çıkmadan önce Firestore + Auth içeriğini temizler.
 *
 * Gerekli: Firebase Console → Project settings → Service accounts → Generate new private key
 * PowerShell:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
 *   cd functions
 *   node scripts/wipeLaunchData.cjs
 *
 * İsteğe bağlı — bu e-postalı Auth kullanıcılarını silme (Firestore dokümanları yine silinir):
 *   $env:KEEP_AUTH_EMAILS="admin@example.com,other@example.com"
 */

'use strict';

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

function requireCredentials() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      'GOOGLE_APPLICATION_CREDENTIALS ayarlı değil. Servis hesabı JSON yolunu ortam değişkeni olarak verin.'
    );
    process.exit(1);
  }
}

async function deleteAllInCollection(db, colRef) {
  while (true) {
    const snap = await colRef.limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function deletePostsWithComments(db) {
  const posts = db.collection('posts');
  while (true) {
    const snap = await posts.limit(100).get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await deleteAllInCollection(db, doc.ref.collection('comments'));
      await doc.ref.delete();
    }
  }
}

async function deleteChatsWithMessages(db) {
  const chats = db.collection('chats');
  while (true) {
    const snap = await chats.limit(100).get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await deleteAllInCollection(db, doc.ref.collection('messages'));
      await doc.ref.delete();
    }
  }
}

async function deleteUsersWithSubcollections(db) {
  const users = db.collection('users');
  while (true) {
    const snap = await users.limit(100).get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await deleteAllInCollection(db, doc.ref.collection('banks'));
      await deleteAllInCollection(db, doc.ref.collection('accessLogs'));
      await doc.ref.delete();
    }
  }
}

/** Alt koleksiyonu olmayan (veya bilinmeyen) kök koleksiyonlar */
const FLAT_ROOT_COLLECTIONS = [
  'groupPosts',
  'products',
  'listings',
  'groups',
  'favorites',
  'followers',
  'orders',
  'notifications',
  'reviews',
  'supportTickets',
  'supportTicketReplies',
  'withdrawals',
  'transactions',
  'disputes',
  'kycRequests',
  'userBans',
  'gifts',
  'donations',
  'epinStocks',
  'storeApplications',
  'outboxEmails',
  'outboxSms',
  'adminLogs',
];

function parseKeepEmails() {
  const raw = process.env.KEEP_AUTH_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function deleteAllAuthUsersExcept(auth, keepEmails) {
  let nextPageToken;
  let deleted = 0;
  let skipped = 0;
  do {
    const res = await auth.listUsers(1000, nextPageToken);
    for (const u of res.users) {
      const email = (u.email || '').toLowerCase();
      if (email && keepEmails.has(email)) {
        skipped++;
        console.log(`  (atlandı) Auth: ${email}`);
        continue;
      }
      await auth.deleteUser(u.uid);
      deleted++;
    }
    nextPageToken = res.pageToken;
  } while (nextPageToken);
  return { deleted, skipped };
}

async function main() {
  requireCredentials();

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  const db = getFirestore();
  const auth = getAuth();
  const keepEmails = parseKeepEmails();

  console.log('1/4 posts (+ yorumlar) siliniyor...');
  await deletePostsWithComments(db);

  console.log('2/4 düz koleksiyonlar siliniyor...');
  for (const name of FLAT_ROOT_COLLECTIONS) {
    console.log(`  → ${name}`);
    await deleteAllInCollection(db, db.collection(name));
  }

  console.log('3/4 chats (+ mesajlar) siliniyor...');
  await deleteChatsWithMessages(db);

  console.log('4/4 users (+ banks, accessLogs) siliniyor...');
  await deleteUsersWithSubcollections(db);

  console.log('Firebase Auth kullanıcıları siliniyor...');
  const { deleted, skipped } = await deleteAllAuthUsersExcept(auth, keepEmails);
  console.log(`Auth: ${deleted} silindi, ${skipped} korundu (KEEP_AUTH_EMAILS).`);

  console.log('Bitti. Storage’daki görseller ayrı; Firebase Console → Storage’dan bucket temizliği gerekirse oradan yapın.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
