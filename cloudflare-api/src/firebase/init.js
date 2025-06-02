import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export function initFirebase(env) {
  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  return getFirestore(app);
}