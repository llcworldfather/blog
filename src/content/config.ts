import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    mood: z.enum(['晴', '多云', '雨', '夜', '风', '雪', '雾']),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
  }),
});

export const collections = { posts };