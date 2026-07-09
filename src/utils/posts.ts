// 文章数据访问模块 — 基于 Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'posts';

export interface Post {
  id?: string;
  slug: string;
  title: string;
  date: Date;
  mood: '晴' | '多云' | '雨' | '夜' | '风' | '雪' | '雾';
  tags: string[];
  excerpt: string;
  content: string; // Markdown 正文
  createdAt?: ReturnType<typeof serverTimestamp>;
  updatedAt?: ReturnType<typeof serverTimestamp>;
}

export interface PostInput {
  slug: string;
  title: string;
  date: Date;
  mood: Post['mood'];
  tags: string[];
  excerpt: string;
  content: string;
}

// Firestore 文档 → Post 对象
function toPost(id: string, data: DocumentData): Post {
  return {
    id,
    slug: data.slug,
    title: data.title,
    date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
    mood: data.mood,
    tags: data.tags ?? [],
    excerpt: data.excerpt ?? '',
    content: data.content ?? '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * 获取全部文章（按日期倒序）
 */
export async function getAllPosts(): Promise<Post[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

/**
 * 获取最新 N 篇文章
 */
export async function getRecentPosts(limit = 5): Promise<Post[]> {
  const all = await getAllPosts();
  return all.slice(0, limit);
}

/**
 * 按 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toPost(d.id, d.data());
}

/**
 * 按 id 获取单篇文章
 */
export async function getPostById(id: string): Promise<Post | null> {
  const ref = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toPost(snap.id, snap.data());
}

/**
 * 按标签获取文章
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('tags', 'array-contains', tag),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

/**
 * 获取所有标签及计数
 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts();
  const map = new Map<string, number>();
  posts.forEach((p) => {
    p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1));
  });
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 创建文章
 */
export async function createPost(input: PostInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION_NAME), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * 更新文章
 */
export async function updatePost(id: string, input: Partial<PostInput>): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/**
 * 删除文章
 */
export async function deletePost(id: string): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
}