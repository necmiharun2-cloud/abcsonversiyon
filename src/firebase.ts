import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBhwH32oAKMRKD69ueTBfNwN6fI-EhqkxU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'itemtrcom.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'itemtrcom',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'itemtrcom.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '373427907680',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:373427907680:web:e3f5739fd827abb79b2705',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-1Q093L50J0',
};

export const missingFirebaseEnvKeys: string[] = [];

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');
