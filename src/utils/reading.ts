import type { Post } from './posts';

/**
 * 中文友好的阅读时长 / 字数估算
 * CJK 按字计，英文按词计；约 400 字/分钟
 */
export function getReadingStats(markdown: string): {
  words: number;
  minutes: number;
  label: string;
} {
  const text = String(markdown ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/[#>*_~\-|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const latinWords = (text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[a-zA-Z0-9]+/g) || [])
    .length;
  const words = cjk + latinWords;
  const minutes = Math.max(1, Math.ceil(words / 400));

  return {
    words,
    minutes,
    label: `约 ${minutes} 分钟 · ${words} 字`,
  };
}

export function formatPostDate(date: Date, withYear = true): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const mon = months[date.getMonth()];
  return withYear ? `${mon} ${day}, ${date.getFullYear()}` : `${mon} ${day}`;
}

/** 按标签重合度推荐相关文章 */
export function getRelatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const tagSet = new Set(current.tags);
  if (tagSet.size === 0) return [];

  return all
    .filter((p) => p.slug !== current.slug && p.status === 'published')
    .map((p) => ({
      post: p,
      score: p.tags.reduce((n, t) => n + (tagSet.has(t) ? 1 : 0), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.getTime() - a.post.date.getTime())
    .slice(0, limit)
    .map((x) => x.post);
}

/** 上一篇（更早）/ 下一篇（更新）— 按时间线阅读 */
export function getAdjacentPosts(
  currentSlug: string,
  all: Post[]
): { prev: Post | null; next: Post | null } {
  const posts = [...all].sort((a, b) => b.date.getTime() - a.date.getTime());
  const index = posts.findIndex((p) => p.slug === currentSlug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: posts[index + 1] ?? null, // 更早
    next: posts[index - 1] ?? null, // 更新
  };
}

export interface ArchiveGroup {
  year: number;
  months: {
    key: string; // YYYY-MM
    year: number;
    month: number;
    label: string;
    posts: Post[];
  }[];
}

const CN_MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

/** 按年 → 月聚合（新→旧） */
export function groupPostsByMonth(posts: Post[]): ArchiveGroup[] {
  const sorted = [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
  const yearMap = new Map<number, Map<string, Post[]>>();

  for (const post of sorted) {
    const year = post.date.getFullYear();
    const month = post.date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const months = yearMap.get(year)!;
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(post);
  }

  return [...yearMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, monthPosts]) => {
          const month = Number(key.split('-')[1]) - 1;
          return {
            key,
            year,
            month,
            label: CN_MONTHS[month],
            posts: monthPosts,
          };
        }),
    }));
}

/** 简易全文匹配（标题/摘要/正文/标签） */
export function searchPosts(posts: Post[], query: string, limit = 30): Post[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return posts
    .map((post) => {
      const hay = [post.title, post.excerpt, post.content, post.tags.join(' '), post.mood]
        .join('\n')
        .toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (!hay.includes(term)) return { post, score: -1 };
        if (post.title.toLowerCase().includes(term)) score += 8;
        if (post.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
        if (post.excerpt.toLowerCase().includes(term)) score += 3;
        score += 1;
      }
      return { post, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.getTime() - a.post.date.getTime())
    .slice(0, limit)
    .map((x) => x.post);
}
