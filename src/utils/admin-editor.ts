import { marked } from 'marked';
import type { PostStatus } from './posts';

marked.setOptions({ gfm: true, breaks: true });

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeTextarea(value: unknown): string {
  return String(value ?? '').replace(/<\/textarea/gi, '&lt;/textarea');
}

export function markdownEditorHtml(content = ''): string {
  return (
    '<div class="form-row md-editor">' +
      '<div class="md-toolbar">' +
        '<span class="md-label">正文 (Markdown)</span>' +
        '<div class="md-tabs" role="tablist">' +
          '<button type="button" class="md-tab is-active" data-tab="write" role="tab" aria-selected="true">编写</button>' +
          '<button type="button" class="md-tab" data-tab="preview" role="tab" aria-selected="false">预览</button>' +
        '</div>' +
      '</div>' +
      '<div class="md-pane is-active" data-pane="write">' +
        '<textarea id="content" name="content" rows="18" placeholder="支持 Markdown 语法…">' +
          escapeTextarea(content) +
        '</textarea>' +
      '</div>' +
      '<div class="md-pane" data-pane="preview" hidden>' +
        '<div class="prose md-preview" id="content-preview"><p class="md-preview-empty">暂无内容可预览</p></div>' +
      '</div>' +
    '</div>'
  );
}

export function initMarkdownTabs(root: ParentNode = document): void {
  const editor = root.querySelector('.md-editor') as HTMLElement | null;
  if (!editor) return;

  const tabs = editor.querySelectorAll<HTMLButtonElement>('.md-tab');
  const panes = editor.querySelectorAll<HTMLElement>('.md-pane');
  const textarea = editor.querySelector<HTMLTextAreaElement>('#content');
  const preview = editor.querySelector<HTMLElement>('#content-preview');

  const getActiveTab = () =>
    (editor.querySelector('.md-tab.is-active') as HTMLElement | null)?.dataset.tab || 'write';

  const syncPreviewSize = () => {
    if (!textarea || !preview) return;
    const h = Math.max(textarea.offsetHeight, 360);
    preview.style.minHeight = h + 'px';
    preview.style.height = h + 'px';
  };

  const renderPreview = () => {
    if (!textarea || !preview) return;
    const md = textarea.value.trim();
    if (!md) {
      preview.innerHTML = '<p class="md-preview-empty">暂无内容可预览</p>';
      return;
    }
    preview.innerHTML = marked.parse(md) as string;
  };

  const switchTab = (name: string) => {
    const tab = editor.querySelector<HTMLButtonElement>(`.md-tab[data-tab="${name}"]`);
    if (!tab) return;

    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panes.forEach((pane) => {
      const active = pane.dataset.pane === name;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
    });

    if (name === 'preview') {
      syncPreviewSize();
      renderPreview();
      preview?.setAttribute('tabindex', '-1');
      preview?.focus();
    } else {
      textarea?.focus();
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab) switchTab(tab.dataset.tab);
    });
  });

  // 在编辑器内按 Tab / Shift+Tab 切换「编写 ↔ 预览」
  editor.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (!target || !editor.contains(target)) return;
    // 工具栏按钮上保留默认焦点移动
    if (target.classList.contains('md-tab')) return;

    e.preventDefault();
    const current = getActiveTab();
    if (e.shiftKey) {
      switchTab(current === 'preview' ? 'write' : 'preview');
    } else {
      switchTab(current === 'write' ? 'preview' : 'write');
    }
  });
}

export function collectPostPayload(status: PostStatus) {
  const titleEl = document.getElementById('title') as HTMLInputElement | null;
  const slugEl = document.getElementById('slug') as HTMLInputElement | null;
  const dateEl = document.getElementById('date') as HTMLInputElement | null;
  const moodEl = document.getElementById('mood') as HTMLSelectElement | null;
  const tagsEl = document.getElementById('tags') as HTMLInputElement | null;
  const excerptEl = document.getElementById('excerpt') as HTMLTextAreaElement | null;
  const contentEl = document.getElementById('content') as HTMLTextAreaElement | null;

  const title = (titleEl?.value ?? '').trim();
  let slug = (slugEl?.value ?? '').trim();
  if (!slug && title) {
    slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '')
      .slice(0, 60);
  }
  if (!slug) {
    slug = 'draft-' + Date.now();
  }

  const tags = (tagsEl?.value ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    title: title || (status === 'draft' ? '未命名草稿' : title),
    slug,
    date: dateEl?.value || new Date().toISOString().split('T')[0],
    mood: (moodEl?.value || '晴') as string,
    tags,
    excerpt: excerptEl?.value ?? '',
    content: contentEl?.value ?? '',
    status,
  };
}

export function validatePostPayload(
  body: ReturnType<typeof collectPostPayload>,
  status: PostStatus
): string | null {
  if (status === 'published') {
    if (!body.title || body.title === '未命名草稿') return '发布前请填写标题';
    if (!body.slug) return '发布前请填写 URL 标识';
    if (!body.date) return '发布前请填写日期';
    if (!body.mood) return '发布前请选择心情';
    if (!body.content.trim()) return '发布前请填写正文';
    if (!body.excerpt.trim()) return '发布前请填写摘要';
  } else if (!body.title) {
    return '请至少填写一个标题再保存草稿';
  }
  return null;
}
