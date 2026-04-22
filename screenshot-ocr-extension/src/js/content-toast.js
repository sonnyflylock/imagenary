// Injected modal overlay for showing extraction progress and results

(function () {
  const ID = 'imagenary-modal';

  // Remove existing modal if any
  const existing = document.getElementById(ID);
  if (existing) existing.remove();

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = ID;
  Object.assign(backdrop.style, {
    position: 'fixed',
    top: '0', left: '0', width: '100%', height: '100%',
    zIndex: '2147483647',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.25s',
    opacity: '0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  });

  // Modal card
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: '#ffffff',
    color: '#1e293b',
    borderRadius: '16px',
    width: '440px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s',
    transform: 'scale(0.95)',
  });

  // ── Header ──
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '20px 24px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
  });

  const titleRow = document.createElement('div');
  Object.assign(titleRow.style, { display: 'flex', alignItems: 'center', gap: '10px' });

  const statusIcon = document.createElement('div');
  Object.assign(statusIcon.style, {
    width: '24px', height: '24px',
    border: '2.5px solid #e2e8f0',
    borderTopColor: '#25af97',
    borderRadius: '50%',
    animation: 'imagenary-spin 0.6s linear infinite',
    flexShrink: '0',
  });

  const title = document.createElement('div');
  title.textContent = 'Extracting text...';
  Object.assign(title.style, { fontSize: '16px', fontWeight: '600' });

  titleRow.appendChild(statusIcon);
  titleRow.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  Object.assign(closeBtn.style, {
    background: 'none', border: 'none', fontSize: '24px',
    cursor: 'pointer', color: '#94a3b8', lineHeight: '1',
    padding: '0 0 0 12px',
  });
  closeBtn.addEventListener('click', dismiss);

  header.appendChild(titleRow);
  header.appendChild(closeBtn);

  // ── Body (result area) ──
  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '20px 24px',
    flex: '1',
    overflowY: 'auto',
    display: 'none',
  });

  const textarea = document.createElement('textarea');
  textarea.readOnly = true;
  textarea.placeholder = 'Extracted text will appear here...';
  Object.assign(textarea.style, {
    width: '100%', minHeight: '140px', maxHeight: '300px',
    padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontFamily: 'inherit', fontSize: '13px', lineHeight: '1.6',
    resize: 'vertical', background: '#f8fafc', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
  });
  textarea.addEventListener('focus', () => { textarea.style.borderColor = '#25af97'; });
  textarea.addEventListener('blur', () => { textarea.style.borderColor = '#e2e8f0'; });
  body.appendChild(textarea);

  // Copy button row
  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center',
  });

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy to Clipboard';
  Object.assign(copyBtn.style, {
    background: '#25af97', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer',
  });
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
    });
  });

  const fillBtn = document.createElement('button');
  fillBtn.textContent = 'Fill Form';
  Object.assign(fillBtn.style, {
    background: '#fff', color: '#25af97', border: '1.5px solid #25af97',
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
  });
  fillBtn.addEventListener('mouseenter', () => {
    fillBtn.style.background = '#25af97';
    fillBtn.style.color = '#fff';
  });
  fillBtn.addEventListener('mouseleave', () => {
    if (!fillBtn.dataset.active) {
      fillBtn.style.background = '#fff';
      fillBtn.style.color = '#25af97';
    }
  });
  fillBtn.addEventListener('click', () => {
    fillBtn.dataset.active = '1';
    fillBtn.style.background = '#25af97';
    fillBtn.style.color = '#fff';
    fillBtn.textContent = 'Scanning form...';
    fillBtn.disabled = true;
    chrome.runtime.sendMessage({ action: 'fillForm', text: textarea.value });
  });

  const copiedBadge = document.createElement('span');
  copiedBadge.textContent = '\u2713 Auto-copied to clipboard';
  Object.assign(copiedBadge.style, {
    fontSize: '12px', color: '#25af97', fontWeight: '500',
  });

  actions.appendChild(copyBtn);
  actions.appendChild(fillBtn);
  actions.appendChild(copiedBadge);
  body.appendChild(actions);

  // ── Footer (promo/ad) ──
  const footer = document.createElement('div');
  Object.assign(footer.style, {
    padding: '14px 24px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
  });

  const footerLeft = document.createElement('span');
  footerLeft.style.color = '#64748b';

  const footerRight = document.createElement('a');
  footerRight.href = 'https://www.imagenary.ai';
  footerRight.target = '_blank';
  footerRight.textContent = 'ScreenScribe by Imagenary AI \u2192';
  Object.assign(footerRight.style, {
    color: '#25af97', textDecoration: 'none', fontWeight: '600',
  });

  footer.appendChild(footerLeft);
  footer.appendChild(footerRight);

  // Assemble
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  backdrop.appendChild(modal);

  // Keyframes
  const style = document.createElement('style');
  style.textContent = `@keyframes imagenary-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);

  document.body.appendChild(backdrop);

  // Animate in
  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  });

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) dismiss();
  });

  // Close on Esc
  function onKey(e) { if (e.key === 'Escape') dismiss(); }
  document.addEventListener('keydown', onKey);

  function dismiss() {
    backdrop.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => { backdrop.remove(); style.remove(); }, 250);
    document.removeEventListener('keydown', onKey);
  }

  // Listen for result from background
  chrome.runtime.onMessage.addListener(function handler(msg) {
    if (msg.action === 'toast-result') {
      chrome.runtime.onMessage.removeListener(handler);

      // Stop spinner, show result
      statusIcon.style.animation = 'none';
      statusIcon.style.border = 'none';

      if (msg.error && msg.exhausted) {
        // ── Upsell screen ──
        statusIcon.style.display = 'none';
        title.textContent = '';
        header.style.borderBottom = 'none';
        header.style.padding = '12px 24px 0';

        body.style.display = 'block';
        body.innerHTML = '';
        Object.assign(body.style, { textAlign: 'center', padding: '24px 32px 16px' });

        const emoji = document.createElement('div');
        emoji.textContent = '\u{1F389}';
        emoji.style.fontSize = '48px';
        body.appendChild(emoji);

        const h = document.createElement('div');
        h.textContent = 'You used all 10 free extractions!';
        Object.assign(h.style, {
          fontSize: '20px', fontWeight: '700', marginTop: '12px', color: '#1e293b',
        });
        body.appendChild(h);

        const sub = document.createElement('div');
        sub.textContent = 'Sign in to get 10 more free — or upgrade for unlimited.';
        Object.assign(sub.style, {
          fontSize: '14px', color: '#64748b', marginTop: '8px', lineHeight: '1.5',
        });
        body.appendChild(sub);

        // Sign in button (primary CTA)
        const signInBtn = document.createElement('a');
        signInBtn.href = 'https://www.imagenary.ai/signin?next=/ext-auth';
        signInBtn.target = '_blank';
        signInBtn.textContent = 'Sign in — 10 more free';
        Object.assign(signInBtn.style, {
          display: 'block', marginTop: '20px', padding: '12px 24px',
          background: '#25af97', color: '#fff', borderRadius: '10px',
          fontSize: '15px', fontWeight: '600', textDecoration: 'none',
          textAlign: 'center', transition: 'background 0.15s',
        });
        signInBtn.addEventListener('mouseenter', () => { signInBtn.style.background = '#1e9882'; });
        signInBtn.addEventListener('mouseleave', () => { signInBtn.style.background = '#25af97'; });
        body.appendChild(signInBtn);

        // Divider
        const divider = document.createElement('div');
        Object.assign(divider.style, {
          display: 'flex', alignItems: 'center', gap: '12px',
          marginTop: '16px', fontSize: '12px', color: '#94a3b8',
        });
        const line1 = document.createElement('div');
        Object.assign(line1.style, { flex: '1', height: '1px', background: '#e2e8f0' });
        const orText = document.createElement('span');
        orText.textContent = 'or upgrade';
        const line2 = document.createElement('div');
        Object.assign(line2.style, { flex: '1', height: '1px', background: '#e2e8f0' });
        divider.appendChild(line1);
        divider.appendChild(orText);
        divider.appendChild(line2);
        body.appendChild(divider);

        // Plans
        const plans = document.createElement('div');
        Object.assign(plans.style, {
          display: 'flex', gap: '12px', marginTop: '16px', textAlign: 'left',
        });

        const planData = [
          { name: '50 Pack', price: '$4.99', desc: '50 extractions, never expire', link: 'https://www.imagenary.ai/pricing' },
          { name: 'Unlimited', price: '$9.99/mo', desc: 'Unlimited extractions + priority', link: 'https://www.imagenary.ai/pricing' },
        ];

        planData.forEach(p => {
          const card = document.createElement('a');
          card.href = p.link;
          card.target = '_blank';
          Object.assign(card.style, {
            flex: '1', padding: '14px', borderRadius: '10px',
            border: '1px solid #e2e8f0', background: '#fff',
            textDecoration: 'none', color: 'inherit',
            display: 'block', cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          });
          card.addEventListener('mouseenter', () => {
            card.style.borderColor = '#25af97';
            card.style.boxShadow = '0 2px 12px rgba(37,175,151,0.15)';
          });
          card.addEventListener('mouseleave', () => {
            card.style.borderColor = '#e2e8f0';
            card.style.boxShadow = 'none';
          });

          const name = document.createElement('div');
          name.textContent = p.name;
          Object.assign(name.style, { fontSize: '13px', fontWeight: '600' });

          const price = document.createElement('div');
          price.textContent = p.price;
          Object.assign(price.style, { fontSize: '18px', fontWeight: '700', color: '#25af97', marginTop: '4px' });

          const desc = document.createElement('div');
          desc.textContent = p.desc;
          Object.assign(desc.style, { fontSize: '11px', color: '#64748b', marginTop: '4px' });

          card.appendChild(name);
          card.appendChild(price);
          card.appendChild(desc);
          plans.appendChild(card);
        });
        body.appendChild(plans);

        // BYOM hint
        const byom = document.createElement('div');
        byom.innerHTML = 'Or <a href="#" style="color:#25af97;text-decoration:underline;">bring your own API key</a> in Settings for unlimited free use.';
        Object.assign(byom.style, { fontSize: '12px', color: '#94a3b8', marginTop: '14px' });
        byom.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({ action: 'openSettings' });
          dismiss();
        });
        body.appendChild(byom);

        // Footer
        footerLeft.textContent = '';
        footerRight.href = 'https://www.imagenary.ai/screenscribe';
        footerRight.textContent = 'ScreenScribe by Imagenary AI \u2192';

      } else if (msg.error) {
        statusIcon.textContent = '\u2717';
        Object.assign(statusIcon.style, {
          color: '#ef4444', fontSize: '20px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        });
        title.textContent = msg.error;
        title.style.color = '#ef4444';
      } else {
        statusIcon.textContent = '\u2713';
        Object.assign(statusIcon.style, {
          color: '#25af97', fontSize: '20px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        });
        title.textContent = 'Text Extracted';

        body.style.display = 'block';
        textarea.value = msg.text;

        // Footer promo
        if (msg.remaining === Infinity || msg.remaining === undefined) {
          footerLeft.textContent = 'Powered by';
        } else if (msg.remaining <= 0) {
          footerLeft.textContent = 'Last free extraction!';
          footerRight.href = 'https://www.imagenary.ai/pricing';
          footerRight.textContent = 'Get More \u2192';
        } else {
          footerLeft.textContent = msg.remaining + ' free extraction' + (msg.remaining === 1 ? '' : 's') + ' remaining';
        }
      }
    }
  });

  // Listen for form fill results
  chrome.runtime.onMessage.addListener(function fillHandler(msg) {
    if (msg.action === 'formFillResult') {
      if (msg.status === 'mapping') {
        fillBtn.textContent = `Mapping ${msg.fieldCount} fields...`;
      } else if (msg.success) {
        fillBtn.textContent = `Filled ${msg.filled} field${msg.filled === 1 ? '' : 's'}`;
        fillBtn.style.background = '#25af97';
        fillBtn.style.color = '#fff';
        fillBtn.style.borderColor = '#25af97';
        setTimeout(() => {
          fillBtn.textContent = 'Fill Form';
          fillBtn.disabled = false;
          delete fillBtn.dataset.active;
          fillBtn.style.background = '#fff';
          fillBtn.style.color = '#25af97';
        }, 3000);
      } else if (msg.error) {
        fillBtn.textContent = msg.error;
        fillBtn.style.background = '#fff';
        fillBtn.style.color = '#ef4444';
        fillBtn.style.borderColor = '#ef4444';
        setTimeout(() => {
          fillBtn.textContent = 'Fill Form';
          fillBtn.disabled = false;
          delete fillBtn.dataset.active;
          fillBtn.style.background = '#fff';
          fillBtn.style.color = '#25af97';
          fillBtn.style.borderColor = '#25af97';
        }, 3000);
      }
    }
  });

  // Safety net
  setTimeout(() => {
    if (document.getElementById(ID)) dismiss();
  }, 60000);
})();
