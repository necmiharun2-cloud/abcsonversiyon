import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA4MAZEtGB5Xz1ySn6Mm5RCJhjUQi8OTcs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sosyal-490917.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sosyal-490917',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sosyal-490917.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '644583868772',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:644583868772:web:218ded8206d1bb9ba65271',
};

export const missingFirebaseEnvKeys: string[] = [];

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');
