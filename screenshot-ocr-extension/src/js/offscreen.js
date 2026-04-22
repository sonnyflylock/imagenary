// Offscreen document for clipboard write (works even when page blocks injection)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'clipboard-write') {
    const ta = document.getElementById('t');
    ta.value = msg.text;
    ta.select();
    document.execCommand('copy');
  }
});
