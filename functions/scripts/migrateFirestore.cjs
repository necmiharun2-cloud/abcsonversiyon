'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PAGE_SIZE = Number(process.env.MIGRATION_PAGE_SIZE || 300);

function loadServiceAccount(filePath) {
  if (!filePath) return null;
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Service account file not found: ${absolutePath}`);
  }
  const raw = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(raw);
}

function createApp(name, serviceAccount) {
  return admin.initializeApp(
    { credential: admin.credential.cert(serviceAccount) },
    name
  );
}

function parseRootCollections() {
  const raw = process.env.ROOT_COLLECTIONS || '';
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

async function migrateDocumentRecursive(sourceDocRef, targetDocRef, stats) {
  const sourceDoc = await sourceDocRef.get();
  if (!sourceDoc.exists) return;

  await targetDocRef.set(sourceDoc.data());
  stats.docsCopied += 1;

  const sourceSubcollections = await sourceDocRef.listCollections();
  for (const sourceSubcollection of sourceSubcollections) {
    const targetSubcollection = targetDocRef.collection(sourceSubcollection.id);
    await migrateCollection(sourceSubcollection, targetSubcollection, stats);
  }
}

async function migrateCollection(sourceCollectionRef, targetCollectionRef, stats) {
  let lastDoc = null;

  while (true) {
    let q = sourceCollectionRef
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE);

    if (lastDoc) {
      q = q.startAfter(lastDoc.id);
    }

    const snap = await q.get();
    if (snap.empty) break;

    for (const sourceDoc of snap.docs) {
      const targetDocRef = targetCollectionRef.doc(sourceDoc.id);
      await migrateDocumentRecursive(sourceDoc.ref, targetDocRef, stats);
    }

    lastDoc = snap.docs[snap.docs.length - 1];
  }
}

async function main() {
  const sourceCredPath =
    process.env.SOURCE_GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.SOURCE_SERVICE_ACCOUNT_JSON;
  const targetCredPath =
    process.env.TARGET_GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.TARGET_SERVICE_ACCOUNT_JSON;

  if (!sourceCredPath || !targetCredPath) {
    throw new Error(
      'Set SOURCE_GOOGLE_APPLICATION_CREDENTIALS and TARGET_GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  const sourceServiceAccount = loadServiceAccount(sourceCredPath);
  const targetServiceAccount = loadServiceAccount(targetCredPath);

  const sourceApp = createApp('sourceApp', sourceServiceAccount);
  const targetApp = createApp('targetApp', targetServiceAccount);

  const sourceDb = sourceApp.firestore();
  const targetDb = targetApp.firestore();

  const requestedRoots = parseRootCollections();
  const allRoots = await sourceDb.listCollections();
  const rootCollections = requestedRoots.length
    ? allRoots.filter((c) => requestedRoots.includes(c.id))
    : allRoots;

  if (rootCollections.length === 0) {
    console.log('No root collections found to migrate.');
    return;
  }

  const stats = { docsCopied: 0 };

  for (const sourceRoot of rootCollections) {
    console.log(`Migrating collection: ${sourceRoot.id}`);
    const targetRoot = targetDb.collection(sourceRoot.id);
    await migrateCollection(sourceRoot, targetRoot, stats);
  }

  console.log(`Migration complete. Documents copied: ${stats.docsCopied}`);
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled(admin.apps.map((app) => app.delete()));
  });
