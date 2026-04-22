// Content script that runs on imagenary.ai/ext-auth
// Grabs the Supabase token from the page and sends it to the extension background

function checkForToken() {
  const el = document.getElementById('imagenary-ext-token');
  if (el && el.dataset.token) {
    try {
      const tokenData = JSON.parse(el.dataset.token);
      chrome.runtime.sendMessage({
        action: 'saveToken',
        ...tokenData
      });
    } catch (e) {
      console.error('Failed to parse token data:', e);
    }
  }
}

// Check immediately and also poll for a couple seconds (page may still be loading)
checkForToken();
const interval = setInterval(checkForToken, 500);
setTimeout(() => clearInterval(interval), 10000);

// Also listen for the custom event
window.addEventListener('imagenary-ext-token', (e) => {
  chrome.runtime.sendMessage({
    action: 'saveToken',
    ...e.detail
  });
});
