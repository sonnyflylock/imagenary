// Form auto-fill — injected into the page by background.js
// Scans for form fields, receives AI-mapped values, fills them.

(function () {
  const FORMFILL_ID = 'imagenary-formfill';

  // ── Scan all visible form fields ──
  function scanFormFields() {
    const fields = [];
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"]), textarea, select'
    );

    inputs.forEach((el, idx) => {
      // Skip invisible elements
      if (el.offsetParent === null && el.type !== 'hidden') return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const label = getFieldLabel(el);
      const descriptor = {
        index: idx,
        id: el.id || '',
        name: el.name || '',
        type: el.type || el.tagName.toLowerCase(),
        placeholder: el.placeholder || '',
        label: label,
        ariaLabel: el.getAttribute('aria-label') || '',
        autocomplete: el.getAttribute('autocomplete') || '',
        tagName: el.tagName.toLowerCase(),
        // For select elements, include options
        options: el.tagName === 'SELECT'
          ? Array.from(el.options).map(o => ({ value: o.value, text: o.textContent.trim() }))
          : undefined,
      };

      // Build a human-readable description for the AI
      descriptor.description = buildDescription(descriptor);
      fields.push(descriptor);
    });

    return fields;
  }

  // ── Get the label text for a form field ──
  function getFieldLabel(el) {
    // 1. Explicit <label for="...">
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label) return label.textContent.trim();
    }

    // 2. Wrapping <label>
    const parent = el.closest('label');
    if (parent) {
      const clone = parent.cloneNode(true);
      clone.querySelectorAll('input, textarea, select').forEach(c => c.remove());
      const text = clone.textContent.trim();
      if (text) return text;
    }

    // 3. aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent.trim();
    }

    // 4. Previous sibling text
    let prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
      const text = prev.textContent.trim();
      if (text && text.length < 80) return text;
    }

    // 5. Nearby text in parent
    const parentEl = el.parentElement;
    if (parentEl) {
      for (const child of parentEl.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (text && text.length < 80) return text;
        }
      }
    }

    return '';
  }

  function buildDescription(f) {
    const parts = [];
    if (f.label) parts.push(`label: "${f.label}"`);
    if (f.placeholder) parts.push(`placeholder: "${f.placeholder}"`);
    if (f.name) parts.push(`name: "${f.name}"`);
    if (f.ariaLabel) parts.push(`aria: "${f.ariaLabel}"`);
    if (f.autocomplete) parts.push(`autocomplete: "${f.autocomplete}"`);
    parts.push(`type: ${f.type}`);
    if (f.options) parts.push(`options: [${f.options.slice(0, 10).map(o => o.text).join(', ')}]`);
    return parts.join(', ');
  }

  // ── Fill fields with mapped values ──
  function fillFields(mappings) {
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"]), textarea, select'
    );

    let filled = 0;

    for (const [key, value] of Object.entries(mappings)) {
      if (value === null || value === undefined || value === '') continue;

      let el = null;

      // Try by index first (most reliable)
      const idx = parseInt(key, 10);
      if (!isNaN(idx) && inputs[idx]) {
        el = inputs[idx];
      }

      // Try by id
      if (!el && typeof key === 'string') {
        el = document.getElementById(key);
      }

      // Try by name
      if (!el && typeof key === 'string') {
        el = document.querySelector(`[name="${CSS.escape(key)}"]`);
      }

      if (!el) continue;

      // Set value with proper event dispatch for React/Vue/Angular
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;

      if (el.tagName === 'SELECT') {
        // Find matching option
        const option = Array.from(el.options).find(o =>
          o.value.toLowerCase() === String(value).toLowerCase() ||
          o.textContent.trim().toLowerCase() === String(value).toLowerCase()
        );
        if (option) {
          el.value = option.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        }
      } else if (el.tagName === 'TEXTAREA') {
        if (nativeTextareaValueSetter) {
          nativeTextareaValueSetter.call(el, value);
        } else {
          el.value = value;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        filled++;
      } else if (el.type === 'checkbox') {
        const shouldCheck = value === true || value === 'true' || value === '1' || value === 'yes';
        if (el.checked !== shouldCheck) {
          el.click();
          filled++;
        }
      } else if (el.type === 'radio') {
        if (!el.checked) {
          el.click();
          filled++;
        }
      } else {
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(el, value);
        } else {
          el.value = value;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        // Also dispatch for React controlled components
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        filled++;
      }
    }

    return filled;
  }

  // ── Message handler ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'scanFormFields') {
      const fields = scanFormFields();
      sendResponse({ fields });
      return false;
    }

    if (msg.action === 'fillFormFields') {
      const filled = fillFields(msg.mappings);
      sendResponse({ filled });
      return false;
    }
  });

  // If invoked with immediate scan request, respond
  const fields = scanFormFields();
  chrome.runtime.sendMessage({ action: 'formFieldsScanned', fields });
})();
