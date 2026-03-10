// Background script for TypeSmart Extension

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'typesmart-rewrite',
    title: '✨ TypeSmart this',
    contexts: ['editable']
  });

  chrome.contextMenus.create({
    id: 'typesmart-separator',
    type: 'separator',
    contexts: ['editable']
  });

  chrome.contextMenus.create({
    id: 'typesmart-settings',
    title: '⚙️ TypeSmart Settings',
    contexts: ['editable']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'typesmart-rewrite') {
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'typesmartContextMenu' });
  } else if (info.menuItemId === 'typesmart-settings') {
    // Open options page
    chrome.runtime.openOptionsPage();
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generate') {
    handleGeneration(request.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }
});

// Handle API generation
async function handleGeneration(data) {
  const { apiKey } = await chrome.storage.sync.get(['apiKey']);
  
  if (!apiKey) {
    throw new Error('API key not configured. Please set it in extension options.');
  }

  const response = await fetch('https://www.typesmart.io/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Generation failed');
  }

  return await response.json();
}

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-typesmart') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'typesmartShortcut' });
      }
    });
  }
});
