import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

type FirebaseConfigShape = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const rawConfig: FirebaseConfigShape = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim(),
};

const requiredKeys: (keyof FirebaseConfigShape)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingConfig = requiredKeys.filter((key) => !rawConfig[key]);

export const missingFirebaseConfigKeys = missingConfig;
export const isConfigValid = missingConfig.length === 0;

if (!isConfigValid && import.meta.env.DEV) {
  const missingList = missingConfig.join(', ');
  console.warn(`[Firebase] Missing configuration values: ${missingList}. Update your .env.local with your Firebase web app settings.`);
}

const sanitizedConfig = Object.fromEntries(
  Object.entries(rawConfig).filter(([, value]) => value)
) as FirebaseOptions;

const firebaseConfig: FirebaseOptions | null = isConfigValid ? sanitizedConfig : null;

const firebaseApp: FirebaseApp | null = firebaseConfig
  ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig))
  : null;

export const app = firebaseApp;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
