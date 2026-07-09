// Firebase 初始化与配置
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDbcza3N64-X6T4DhsKGTuGCvx3mmrxzeE',
  authDomain: 'blog-be5f3.firebaseapp.com',
  projectId: 'blog-be5f3',
  storageBucket: 'blog-be5f3.firebasestorage.app',
  messagingSenderId: '252389607357',
  appId: '1:252389607357:web:857fd1b3f59dabd25db4d4',
  measurementId: 'G-RP26Y1QPSP',
};

// 初始化 Firebase App
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Analytics 仅在浏览器环境且支持时初始化
export let analytics: Analytics | null = null;

export async function initAnalytics(): Promise<Analytics | null> {
  if (import.meta.env.PROD) {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      return analytics;
    }
  }
  return null;
}

// 初始化 Firestore
export const db: Firestore = getFirestore(app);
