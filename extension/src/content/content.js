(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'https://www.typesmart.io';
  
  // Supported sites configuration
  const SITE_CONFIG = {
    'linkedin.com': {
      selectors: ['div[contenteditable="true"]', '[data-test-id="editor-container"] textarea', '.ql-editor'],
      tool: 'linkedin'
    },
    'gmail.com': {
      selectors: ['div[role="textbox"][contenteditable="true"]', '.Am.Al.editable'],
      tool: 'email'
    },
    'mail.google.com': {
      selectors: ['div[role="textbox"][contenteditable="true"]', '.Am.Al.editable'],
      tool: 'email'
    },
    'twitter.com': {
      selectors: ['div[contenteditable="true"][data-testid="tweetTextarea_0"]', '[data-testid="tweetTextarea_1"]'],
      tool: 'linkedin'
    },
    'x.com': {
      selectors: ['div[contenteditable="true"][data-testid="tweetTextarea_0"]', '[data-testid="tweetTextarea_1"]'],
      tool: 'linkedin'
    },
    'facebook.com': {
      selectors: ['div[contenteditable="true"]', '[role="textbox"]'],
      tool: 'linkedin'
    },
    'default': {
      selectors: ['textarea', 'input[type="text"]', '[contenteditable="true"]'],
      tool: 'email'
    }
  };

  // Get current site config
  function getSiteConfig() {
    const hostname = window.location.hostname;
    for (const [domain, config] of Object.entries(SITE_CONFIG)) {
      if (hostname.includes(domain)) {
        return config;
      }
    }
    return SITE_CONFIG.default;
  }

  // Create TypeSmart button
  function createTypeSmartButton(targetElement) {
    const button = document.createElement('div');
    button.className = 'typesmart-extension-button';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span>TypeSmart</span>
    `;
    button.title = 'Rewrite with TypeSmart AI';
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTypeSmartPanel(targetElement);
    });

    return button;
  }

  // Show TypeSmart panel
  function showTypeSmartPanel(targetElement) {
    // Remove existing panel
    const existingPanel = document.querySelector('.typesmart-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.className = 'typesmart-panel';
    
    const text = getTextFromElement(targetElement);
    const siteConfig = getSiteConfig();

    panel.innerHTML = `
      <div class="typesmart-panel-header">
        <span class="typesmart-panel-title">✨ TypeSmart AI</span>
        <button class="typesmart-panel-close">&times;</button>
      </div>
      <div class="typesmart-panel-content">
        <div class="typesmart-original">
          <label>Original:</label>
          <div class="typesmart-text-preview">${escapeHtml(text)}</div>
        </div>
        <div class="typesmart-tones">
          <label>Choose Tone:</label>
          <div class="typesmart-tone-buttons">
            <button data-tone="professional" class="active">Professional</button>
            <button data-tone="friendly">Friendly</button>
            <button data-tone="assertive">Assertive</button>
            <button data-tone="apologetic">Apologetic</button>
            <button data-tone="enthusiastic">Enthusiastic</button>
          </div>
        </div>
        <button class="typesmart-generate-btn">
          <span class="typesmart-spinner" style="display:none;"></span>
          <span class="typesmart-btn-text">✨ Generate with AI</span>
        </button>
        <div class="typesmart-result" style="display:none;">
          <label>Result:</label>
          <div class="typesmart-result-text"></div>
          <div class="typesmart-result-actions">
            <button class="typesmart-insert-btn">Insert</button>
            <button class="typesmart-copy-btn">Copy</button>
            <button class="typesmart-regenerate-btn">Try Again</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Position panel near target element
    const rect = targetElement.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = `${rect.bottom + 10}px`;
    panel.style.left = `${Math.min(rect.left, window.innerWidth - 380)}px`;
    panel.style.zIndex = '999999';

    // Event listeners
    panel.querySelector('.typesmart-panel-close').addEventListener('click', () => {
      panel.remove();
    });

    // Tone selection
    const toneButtons = panel.querySelectorAll('.typesmart-tone-buttons button');
    let selectedTone = 'professional';
    toneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        toneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTone = btn.dataset.tone;
      });
    });

    // Generate
    panel.querySelector('.typesmart-generate-btn').addEventListener('click', async () => {
      const generateBtn = panel.querySelector('.typesmart-generate-btn');
      const spinner = panel.querySelector('.typesmart-spinner');
      const btnText = panel.querySelector('.typesmart-btn-text');
      const resultDiv = panel.querySelector('.typesmart-result');
      const resultText = panel.querySelector('.typesmart-result-text');

      generateBtn.disabled = true;
      spinner.style.display = 'inline-block';
      btnText.textContent = 'Generating...';

      try {
        const result = await generateWithTypeSmart(text, selectedTone, siteConfig.tool);
        resultText.textContent = result;
        resultDiv.style.display = 'block';
      } catch (error) {
        resultText.textContent = 'Error: ' + error.message;
        resultDiv.style.display = 'block';
      } finally {
        generateBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = '✨ Generate with AI';
      }
    });

    // Insert result
    panel.querySelector('.typesmart-insert-btn').addEventListener('click', () => {
      const resultText = panel.querySelector('.typesmart-result-text').textContent;
      setTextToElement(targetElement, resultText);
      panel.remove();
    });

    // Copy result
    panel.querySelector('.typesmart-copy-btn').addEventListener('click', () => {
      const resultText = panel.querySelector('.typesmart-result-text').textContent;
      navigator.clipboard.writeText(resultText);
      panel.querySelector('.typesmart-copy-btn').textContent = 'Copied!';
      setTimeout(() => {
        panel.querySelector('.typesmart-copy-btn').textContent = 'Copy';
      }, 2000);
    });

    // Regenerate
    panel.querySelector('.typesmart-regenerate-btn').addEventListener('click', () => {
      panel.querySelector('.typesmart-result').style.display = 'none';
      panel.querySelector('.typesmart-generate-btn').click();
    });

    // Close when clicking outside
    const closeOnClickOutside = (e) => {
      if (!panel.contains(e.target) && !e.target.closest('.typesmart-extension-button')) {
        panel.remove();
        document.removeEventListener('click', closeOnClickOutside);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeOnClickOutside);
    }, 100);
  }

  // Generate with TypeSmart API
  async function generateWithTypeSmart(text, tone, tool) {
    const { apiKey } = await chrome.storage.sync.get(['apiKey']);
    
    if (!apiKey) {
      throw new Error('Please set your TypeSmart API key in the extension options');
    }

    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        tool,
        input: text,
        tone
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate');
    }

    const data = await response.json();
    return data.output;
  }

  // Get text from element
  function getTextFromElement(element) {
    if (element.isContentEditable) {
      return element.innerText || element.textContent || '';
    }
    return element.value || '';
  }

  // Set text to element
  function setTextToElement(element, text) {
    if (element.isContentEditable) {
      element.innerText = text;
      element.textContent = text;
    } else {
      element.value = text;
    }
    
    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Add TypeSmart buttons to text fields
  function addTypeSmartButtons() {
    const siteConfig = getSiteConfig();
    const selectors = siteConfig.selectors;

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        // Skip if already has button
        if (element.dataset.typesmartEnabled) return;
        
        // Skip small inputs
        const rect = element.getBoundingClientRect();
        if (rect.height < 40) return;

        element.dataset.typesmartEnabled = 'true';

        // Create wrapper if needed
        let wrapper = element.parentElement;
        if (!wrapper.classList.contains('typesmart-wrapper')) {
          wrapper = document.createElement('div');
          wrapper.className = 'typesmart-wrapper';
          wrapper.style.position = 'relative';
          element.parentNode.insertBefore(wrapper, element);
          wrapper.appendChild(element);
        }

        // Add button
        const button = createTypeSmartButton(element);
        wrapper.appendChild(button);

        // Reposition button on resize
        const repositionButton = () => {
          const rect = element.getBoundingClientRect();
          button.style.top = '8px';
          button.style.right = '8px';
        };
        
        repositionButton();
        window.addEventListener('resize', repositionButton);
      });
    });
  }

  // Context menu handler
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'typesmartContextMenu') {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable || activeElement.tagName === 'INPUT')) {
        showTypeSmartPanel(activeElement);
      } else {
        // Show notification
        showNotification('Please click on a text field first');
      }
    }
  });

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'typesmart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize
  function init() {
    addTypeSmartButtons();
    
    // Watch for new elements
    const observer = new MutationObserver(() => {
      addTypeSmartButtons();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
