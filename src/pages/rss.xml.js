import rss from '@astrojs/rss';
import { getAllPosts } from '../utils/posts';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';

export const prerender = false;

export async function GET(context) {
  const posts = await getAllPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: post.date,
      link: `/posts/${post.slug}/`,
      categories: post.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
