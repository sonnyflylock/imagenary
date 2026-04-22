// Region selection overlay — injected programmatically by background.js
// User draws a rectangle, coordinates are sent back to background for cropping.

(function () {
  // Remove any existing overlay
  const existing = document.getElementById('imagenary-select-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'imagenary-select-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    zIndex: '2147483647', cursor: 'crosshair',
    background: 'rgba(0,0,0,0.25)',
  });

  const selection = document.createElement('div');
  Object.assign(selection.style, {
    position: 'fixed', border: '2px solid #25af97',
    background: 'rgba(37,175,151,0.15)', display: 'none',
    pointerEvents: 'none', borderRadius: '2px',
  });
  overlay.appendChild(selection);

  const hint = document.createElement('div');
  hint.textContent = 'Click and drag to select area \u00b7 Esc to cancel';
  Object.assign(hint.style, {
    position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 18px',
    borderRadius: '8px', fontSize: '14px', fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none', whiteSpace: 'nowrap',
  });
  overlay.appendChild(hint);

  let startX, startY, isDrawing = false;

  function cleanup() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }

  overlay.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    isDrawing = true;
    selection.style.display = 'block';
    selection.style.left = startX + 'px';
    selection.style.top = startY + 'px';
    selection.style.width = '0';
    selection.style.height = '0';
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    selection.style.left = x + 'px';
    selection.style.top = y + 'px';
    selection.style.width = w + 'px';
    selection.style.height = h + 'px';
  });

  overlay.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    // Remove overlay before capture so it doesn't appear in screenshot
    cleanup();

    if (w < 10 || h < 10) {
      chrome.runtime.sendMessage({ action: 'regionCancelled' });
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    // Small delay to let the overlay fully repaint away
    requestAnimationFrame(() => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'regionSelected',
          rect: {
            x: Math.round(x * dpr),
            y: Math.round(y * dpr),
            w: Math.round(w * dpr),
            h: Math.round(h * dpr),
          },
        });
      }, 50);
    });
  });

  function onKey(e) {
    if (e.key === 'Escape') {
      cleanup();
      chrome.runtime.sendMessage({ action: 'regionCancelled' });
    }
  }
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
})();
