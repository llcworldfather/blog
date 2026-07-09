import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';

// Hero.astro
const hero = `---
import { getAllPosts } from '../utils/posts';

const posts = await getAllPosts();
const postCount = posts.length;

const now = new Date();
const dateStr = \`\${now.getFullYear()} 年 \${now.getMonth() + 1} 月 \${now.getDate()} 日\`;
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const weekday = weekdays[now.getDay()];
---

<section class="hero" id="top">
  <div class="wrap">
    <div class="today">
      <svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </svg>
      <span>{dateStr} · 星期{weekday} · 第 {postCount} 篇手记</span>
    </div>
    <h1>把普通的日子，<br />写成<em>值得回头看</em>的句子。</h1>
    <p class="lede">这里记录一些不重要的小事：一杯放凉的茶、地铁上的一段对话、深夜突然想通的道理。没有主题，只有生活本身。</p>
    <a href="/posts" class="cta">开始阅读 →</a>
  </div>
</section>
`;

const heroPath = 'E:/blog/src/components/Hero.astro';
if (existsSync(heroPath)) unlinkSync(heroPath);
writeFileSync(heroPath, hero, 'utf8');
console.log('Hero.astro written:', readFileSync(heroPath, 'utf8').substring(0, 60));

// index.astro
const indexPage = `---
import { getAllPosts } from '../utils/posts';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import EntryCard from '../components/EntryCard.astro';
import About from '../components/About.astro';
import Subscribe from '../components/Subscribe.astro';

const posts = await getAllPosts();
const recentPosts = posts.slice(0, 5);
---

<BaseLayout>
  <Hero />

  <section class="entries" id="entries">
    <div class="wrap">
      <div class="section-label">最新手记</div>
      <div class="entry-list">
        {recentPosts.map((entry) => <EntryCard entry={entry} />)}
      </div>
    </div>
  </section>

  <About />
  <Subscribe />
</BaseLayout>
`;

writeFileSync('E:/blog/src/pages/index.astro', indexPage, 'utf8');
console.log('index.astro written');

// posts/index.astro
const postsIndex = `---
import { getAllPosts } from '../../utils/posts';
import BaseLayout from '../../layouts/BaseLayout.astro';
import EntryCard from '../../components/EntryCard.astro';
import Subscribe from '../../components/Subscribe.astro';

const posts = await getAllPosts();
---

<BaseLayout title="随笔" description="所有手记的完整列表">
  <section class="entries" id="entries">
    <div class="wrap">
      <div class="section-label">全部手记 · {posts.length} 篇</div>
      <div class="entry-list">
        {posts.map((entry) => <EntryCard entry={entry} />)}
      </div>
    </div>
  </section>

  <Subscribe />
</BaseLayout>
`;

writeFileSync('E:/blog/src/pages/posts/index.astro', postsIndex, 'utf8');
console.log('posts/index.astro written');

// posts/[slug].astro
const postDetail = `---
import { getAllPosts, getPostBySlug } from '../../utils/posts';
import BaseLayout from '../../layouts/BaseLayout.astro';
import MoodIcon from '../../components/MoodIcon.astro';
import Subscribe from '../../components/Subscribe.astro';
import { slugify } from '../../utils/slugify';
import { marked } from 'marked';

export const prerender = false;

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const htmlContent = marked.parse(post.content);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateLabel = \`\${months[post.date.getMonth()]} \${String(post.date.getDate()).padStart(2, '0')}, \${post.date.getFullYear()}\`;
---

<BaseLayout title={post.title} description={post.excerpt}>
  <article class="article">
    <div class="wrap">
      <a href="/posts" class="back">← 返回手记列表</a>

      <header class="article-header">
        <span class="mood-icon" title={post.mood} style="position:static; width:40px; height:40px; margin-bottom:18px;">
          <MoodIcon mood={post.mood} size={20} />
        </span>
        <span class="entry-date"><span class="num">{dateLabel}</span> · {post.mood}</span>
        <h1>{post.title}</h1>
        <div class="entry-foot">
          {
            post.tags.map((tag) => (
              <a href={\`/tags/\${slugify(tag)}\`} class="tag">{tag}</a>
            ))
          }
        </div>
      </header>

      <div class="prose" set:html={htmlContent} />
    </div>
  </article>

  <Subscribe />
</BaseLayout>
`;

writeFileSync('E:/blog/src/pages/posts/[slug].astro', postDetail, 'utf8');
console.log('posts/[slug].astro written');

// tags/index.astro
const tagsIndex = `---
import { getAllTags } from '../../utils/posts';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { slugify } from '../../utils/slugify';

export const prerender = false;

const tags = await getAllTags();
---

<BaseLayout title="标签" description="按标签浏览所有手记">
  <section class="tag-page">
    <div class="wrap">
      <h1>标签归档</h1>
      <p class="tag-sub">共 {tags.length} 个标签</p>

      <div class="tag-cloud">
        {
          tags.map(([tag, count]) => (
            <a href={\`/tags/\${slugify(tag)}\`}>
              {tag}<span class="count">{count}</span>
            </a>
          ))
        }
      </div>
    </div>
  </section>
</BaseLayout>
`;

writeFileSync('E:/blog/src/pages/tags/index.astro', tagsIndex, 'utf8');
console.log('tags/index.astro written');

// tags/[tag].astro
const tagDetail = `---
import { getAllTags, getPostsByTag } from '../../utils/posts';
import BaseLayout from '../../layouts/BaseLayout.astro';
import EntryCard from '../../components/EntryCard.astro';
import { slugify } from '../../utils/slugify';

export const prerender = false;

export async function getStaticPaths() {
  const tags = await getAllTags();
  return tags.map(([tag]) => ({
    params: { tag: slugify(tag) },
    props: { tag },
  }));
}

const { tag } = Astro.props;
const posts = await getPostsByTag(tag);
---

<BaseLayout title={\`标签：\${tag}\`} description={\`标签「\${tag}」下的所有手记\`}>
  <section class="tag-page">
    <div class="wrap">
      <h1>#{tag}</h1>
      <p class="tag-sub">共 {posts.length} 篇手记</p>

      <div class="entry-list">
        {posts.map((entry) => <EntryCard entry={entry} />)}
      </div>
    </div>
  </section>
</BaseLayout>
`;

writeFileSync('E:/blog/src/pages/tags/[tag].astro', tagDetail, 'utf8');
console.log('tags/[tag].astro written');

// rss.xml.js
const rss = `import rss from '@astrojs/rss';
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
      link: \`/posts/\${post.slug}/\`,
      categories: post.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
`;

writeFileSync('E:/blog/src/pages/rss.xml.js', rss, 'utf8');
console.log('rss.xml.js written');

console.log('\\nAll pages updated to use Firestore!');