// Popup script for TypeSmart Extension

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  
  // Check if API key is configured
  const { apiKey } = await chrome.storage.sync.get(['apiKey']);
  
  if (!apiKey) {
    renderApiSetup(app);
  } else {
    renderDashboard(app);
  }
});

function renderApiSetup(container) {
  container.innerHTML = `
    <div class="header">
      <div class="logo">✨ TypeSmart</div>
      <div class="tagline">AI Writing Assistant</div>
    </div>
    <div class="api-setup">
      <p>Connect your TypeSmart account to start using the extension on any website.</p>
      <button class="setup-btn" id="setup-btn">Set Up Extension</button>
    </div>
  `;
  
  document.getElementById('setup-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

function renderDashboard(container) {
  container.innerHTML = `
    <div class="header">
      <div class="logo">✨ TypeSmart</div>
      <div class="tagline">AI Writing Assistant</div>
    </div>
    <div class="content">
      <div class="status-card">
        <div class="status-label">Status</div>
        <div class="status-value connected">● Connected</div>
      </div>
      
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <button class="action-btn primary" id="open-dashboard">
            Open Dashboard
          </button>
          <button class="action-btn" id="view-history">
            History
          </button>
          <button class="action-btn" id="custom-tones">
            Custom Tones
          </button>
          <button class="action-btn" id="help">
            Help & Tips
          </button>
        </div>
      </div>
      
      <button class="settings-btn" id="settings">
        ⚙️ Settings
      </button>
    </div>
  `;
  
  // Event listeners
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.typesmart.io/dashboard' });
  });
  
  document.getElementById('view-history').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.typesmart.io/dashboard#history' });
  });
  
  document.getElementById('custom-tones').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.typesmart.io/dashboard#tones' });
  });
  
  document.getElementById('help').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.typesmart.io/help' });
  });
  
  document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
