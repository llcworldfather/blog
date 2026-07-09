// 订阅者数据访问模块 — 基于 Firestore
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'subscribers';

export interface Subscriber {
  email: string;
  createdAt?: ReturnType<typeof serverTimestamp>;
}

/**
 * 添加订阅者（若邮箱已存在则跳过）
 * @returns 'success' | 'exists' | 'error'
 */
export async function addSubscriber(email: string): Promise<'success' | 'exists' | 'error'> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'error';
  }

  try {
    // 检查是否已订阅
    const q = query(collection(db, COLLECTION_NAME), where('email', '==', trimmed));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return 'exists';
    }

    await addDoc(collection(db, COLLECTION_NAME), {
      email: trimmed,
      createdAt: serverTimestamp(),
    } satisfies Subscriber);

    return 'success';
  } catch (e) {
    console.error('添加订阅者失败:', e);
    return 'error';
  }
}