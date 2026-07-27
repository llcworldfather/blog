export type DialogTone = 'default' | 'danger' | 'success';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: DialogTone;
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  tone?: DialogTone;
}

function ensureStyles(): void {
  if (document.getElementById('admin-dialog-style')) return;
  const style = document.createElement('style');
  style.id = 'admin-dialog-style';
  style.textContent = `
    .admin-dialog-root {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .admin-dialog-backdrop {
      position: absolute; inset: 0;
      background: rgba(43, 38, 32, 0.38);
      backdrop-filter: blur(2px);
    }
    .admin-dialog {
      position: relative; width: min(420px, 100%);
      background: var(--paper-alt, #fbf8f2);
      border: 1px solid var(--line, #cbbfa6);
      border-radius: 4px;
      box-shadow: 0 18px 40px rgba(43, 38, 32, 0.16);
      padding: 28px 28px 22px;
      animation: adminDialogIn 0.22s ease;
    }
    @keyframes adminDialogIn {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }
    .admin-dialog-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; letter-spacing: 0.16em;
      color: var(--ink-faint, #9c927e);
      text-transform: uppercase; margin: 0 0 10px;
    }
    .admin-dialog-title {
      font-family: 'Noto Serif SC', serif;
      font-size: 22px; font-weight: 700;
      color: var(--ink, #2b2620); margin: 0 0 12px; line-height: 1.35;
    }
    .admin-dialog-message {
      font-size: 15px; line-height: 1.7;
      color: var(--ink-soft, #6b6252); margin: 0 0 28px;
    }
    .admin-dialog-actions {
      display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;
    }
    .admin-dialog-btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px; padding: 9px 18px;
      border-radius: 3px; cursor: pointer;
      border: 1px solid var(--line, #cbbfa6);
      background: transparent; color: var(--ink-soft, #6b6252);
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
    .admin-dialog-btn:hover { color: var(--accent, #5b4b8a); border-color: var(--accent-soft, #8477ac); }
    .admin-dialog-btn-primary {
      background: var(--ink, #2b2620); color: var(--paper, #f1ece1); border-color: var(--ink, #2b2620);
    }
    .admin-dialog-btn-primary:hover { background: var(--accent, #5b4b8a); border-color: var(--accent, #5b4b8a); color: #fff; }
    .admin-dialog-btn-danger {
      background: #b33a2b; color: #fff; border-color: #b33a2b;
    }
    .admin-dialog-btn-danger:hover { background: #962f22; border-color: #962f22; color: #fff; }
    .admin-dialog-btn-success {
      background: var(--moss, #748052); color: #fff; border-color: var(--moss, #748052);
    }
    .admin-dialog-btn-success:hover { background: #5f6a3f; border-color: #5f6a3f; color: #fff; }
  `;
  document.head.appendChild(style);
}

function mountDialog(options: {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  tone: DialogTone;
}): Promise<boolean> {
  ensureStyles();

  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'admin-dialog-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');

    const primaryClass =
      options.tone === 'danger'
        ? 'admin-dialog-btn admin-dialog-btn-danger'
        : options.tone === 'success'
          ? 'admin-dialog-btn admin-dialog-btn-success'
          : 'admin-dialog-btn admin-dialog-btn-primary';

    const label = options.cancelText ? 'CONFIRM' : 'NOTICE';

    root.innerHTML =
      '<div class="admin-dialog-backdrop" data-action="cancel"></div>' +
      '<div class="admin-dialog">' +
        '<p class="admin-dialog-label">' + label + '</p>' +
        '<h3 class="admin-dialog-title"></h3>' +
        '<p class="admin-dialog-message"></p>' +
        '<div class="admin-dialog-actions">' +
          (options.cancelText
            ? '<button type="button" class="admin-dialog-btn" data-action="cancel"></button>'
            : '') +
          '<button type="button" class="' + primaryClass + '" data-action="confirm"></button>' +
        '</div>' +
      '</div>';

    root.querySelector('.admin-dialog-title')!.textContent = options.title;
    root.querySelector('.admin-dialog-message')!.textContent = options.message;
    const confirmBtn = root.querySelector('[data-action="confirm"]') as HTMLButtonElement;
    confirmBtn.textContent = options.confirmText;
    const cancelBtn = root.querySelector('.admin-dialog-actions [data-action="cancel"]') as HTMLButtonElement | null;
    if (cancelBtn && options.cancelText) cancelBtn.textContent = options.cancelText;

    const close = (result: boolean) => {
      document.removeEventListener('keydown', onKey);
      root.remove();
      resolve(result);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };

    root.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement | null)?.closest('[data-action]')?.getAttribute('data-action');
      if (action === 'confirm') close(true);
      if (action === 'cancel') close(false);
    });

    document.addEventListener('keydown', onKey);
    document.body.appendChild(root);
    confirmBtn.focus();
  });
}

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return mountDialog({
    title: options.title ?? '请确认',
    message: options.message,
    confirmText: options.confirmText ?? '确定',
    cancelText: options.cancelText ?? '取消',
    tone: options.tone ?? 'default',
  });
}

export function showAlert(options: AlertOptions): Promise<void> {
  return mountDialog({
    title: options.title ?? '提示',
    message: options.message,
    confirmText: options.confirmText ?? '知道了',
    tone: options.tone ?? 'default',
  }).then(() => undefined);
}
