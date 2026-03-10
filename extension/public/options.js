// Options page script for TypeSmart Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const { apiKey, showButton, contextMenu } = await chrome.storage.sync.get([
    'apiKey',
    'showButton',
    'contextMenu'
  ]);
  
  if (apiKey) {
    document.getElementById('api-key').value = apiKey;
  }
  
  document.getElementById('show-button').checked = showButton !== false;
  document.getElementById('context-menu').checked = contextMenu !== false;
  
  // Save button handler
  document.getElementById('save-btn').addEventListener('click', async () => {
    const saveBtn = document.getElementById('save-btn');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
    // Reset messages
    successMessage.classList.remove('show');
    errorMessage.classList.remove('show');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      const apiKey = document.getElementById('api-key').value.trim();
      const showButton = document.getElementById('show-button').checked;
      const contextMenu = document.getElementById('context-menu').checked;
      
      // Validate API key format
      if (apiKey && !apiKey.startsWith('ts_')) {
        throw new Error('Invalid API key format. It should start with "ts_"');
      }
      
      // Save to storage
      await chrome.storage.sync.set({
        apiKey,
        showButton,
        contextMenu
      });
      
      // Show success
      successMessage.classList.add('show');
      
      // Update context menu based on preference
      if (contextMenu) {
        chrome.contextMenus.update('typesmart-rewrite', { visible: true });
      } else {
        chrome.contextMenus.update('typesmart-rewrite', { visible: false });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 3000);
      
    } catch (error) {
      errorMessage.textContent = '✗ ' + error.message;
      errorMessage.classList.add('show');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  });
});
