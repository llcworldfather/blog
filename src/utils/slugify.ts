// 将中文/英文标签转为 URL 安全的 slug
export function slugify(str: string): string {
  // 保留中文字符、字母、数字，其余转为连字符
  const cleaned = str
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return cleaned || encodeURIComponent(str.trim());
}