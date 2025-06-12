/// <reference path="../types/chrome.d.ts" />

interface StorageData {
  writingPurpose: string;
}

// Content script for grammar checking
class GrammarChecker {
  private writingPurpose: string = '';
  private observer: MutationObserver | null = null;
  private isMinimized: boolean = false;
  private activeElement: HTMLElement | null = null;

  constructor() {
    this.initializeFromStorage();
    this.injectStyles();
    this.initializeMessageListener();
  }

  private async initializeFromStorage(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['writingPurpose']);
      if (result.writingPurpose) {
        this.writingPurpose = result.writingPurpose;
        this.initializeChecker();
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  }

  private injectStyles(): void {
    const styles = document.createElement('style');
    styles.textContent = `
      .grammar-icon {
        position: fixed;
        bottom: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10000;
      }

      .grammar-icon img {
        width: 24px;
        height: 24px;
      }

      .suggestion-popup {
        position: fixed;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
        width: 300px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      .suggestion-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .suggestion-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .suggestion-content {
        padding: 16px;
      }

      .suggestion-type {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #6b6b6b;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .suggestion-text {
        font-size: 14px;
        color: #1a1a1a;
        margin-bottom: 16px;
      }

      .suggestion-actions {
        display: flex;
        gap: 8px;
        padding: 8px 16px 16px;
      }

      .btn-accept {
        background: #15C39A;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }

      .btn-dismiss {
        background: transparent;
        color: #6b6b6b;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }

      .btn-accept:hover {
        background: #0E9373;
      }

      .btn-dismiss:hover {
        background: #f5f5f5;
      }

      .close-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
      }

      .error-icon {
        color: #d93025;
      }
    `;
    document.head.appendChild(styles);
  }

  private initializeMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_GRAMMAR_CHECK') {
        this.writingPurpose = message.writingPurpose;
        this.initializeChecker();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  private initializeChecker(): void {
    this.createFloatingIcon();
    this.startObserving();
    
    // Immediately check all existing text inputs
    this.checkExistingInputs();
  }

  private checkExistingInputs(): void {
    // Find all text inputs, textareas, and contenteditable elements
    const textInputs = document.querySelectorAll<HTMLElement>(
      'input[type="text"], textarea, [contenteditable="true"]'
    );

    textInputs.forEach(input => {
      this.checkGrammar(input);
    });
  }

  private createFloatingIcon(): void {
    const icon = document.createElement('div');
    icon.className = 'grammar-icon';
    icon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="#15C39A" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path fill="#15C39A" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    `;
    
    icon.addEventListener('click', () => this.toggleSuggestionPopup());
    document.body.appendChild(icon);
  }

  private createSuggestionPopup(suggestion: { type: string; text: string; correction: string }): void {
    const existingPopup = document.querySelector('.suggestion-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.className = 'suggestion-popup';
    popup.innerHTML = `
      <div class="suggestion-header">
        <div class="suggestion-title">Review suggestion</div>
        <button class="close-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12.7 4.7l-1.4-1.4L8 6.6 4.7 3.3 3.3 4.7 6.6 8l-3.3 3.3 1.4 1.4L8 9.4l3.3 3.3 1.4-1.4L9.4 8l3.3-3.3z" fill="#6b6b6b"/>
          </svg>
        </button>
      </div>
      <div class="suggestion-content">
        <div class="suggestion-type">
          <span class="error-icon">●</span>
          <span>Correctness - ${suggestion.type}</span>
        </div>
        <div class="suggestion-text">
          <span style="text-decoration: line-through;">${suggestion.text}</span>
          <span style="color: #15C39A;"> ${suggestion.correction}</span>
        </div>
      </div>
      <div class="suggestion-actions">
        <button class="btn-accept">Accept</button>
        <button class="btn-dismiss">Dismiss</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Add event listeners
    popup.querySelector('.close-button')?.addEventListener('click', () => popup.remove());
    popup.querySelector('.btn-accept')?.addEventListener('click', () => {
      this.applySuggestion(suggestion);
      popup.remove();
    });
    popup.querySelector('.btn-dismiss')?.addEventListener('click', () => popup.remove());
  }

  private toggleSuggestionPopup(): void {
    const existingPopup = document.querySelector('.suggestion-popup');
    if (existingPopup) {
      existingPopup.remove();
    } else {
      // For testing, show a dummy suggestion
      this.createSuggestionPopup({
        type: 'Capitalize the word',
        text: 'dont',
        correction: "Don't"
      });
    }
  }

  private startObserving(): void {
    // Create a mutation observer to watch for new text inputs
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check for new nodes
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // If the node itself is a text input
            if (node.matches('input[type="text"], textarea, [contenteditable="true"]')) {
              this.checkGrammar(node);
            }
            // Check for text inputs within the added node
            const textInputs = node.querySelectorAll<HTMLElement>(
              'input[type="text"], textarea, [contenteditable="true"]'
            );
            textInputs.forEach(input => this.checkGrammar(input));
          }
        });

        // Check for text changes in existing nodes
        if (mutation.type === 'characterData' && mutation.target instanceof Node) {
          this.checkGrammar(mutation.target);
        }
      });
    });

    // Start observing the entire document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });

    // Add input event listeners for immediate feedback
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="text"], textarea, [contenteditable="true"]')) {
        this.checkGrammar(target);
      }
    });
  }

  private checkGrammar(element: Node): void {
    const text = this.getTextContent(element);
    if (!text || text.trim().length === 0) return;

    // Store the active element when checking grammar
    if (element instanceof HTMLElement) {
      this.activeElement = element;
    }

    // For testing, check for common mistakes
    if (text.toLowerCase().includes('dont')) {
      this.createSuggestionPopup({
        type: 'Capitalize the word',
        text: 'dont',
        correction: "Don't"
      });
    }
  }

  private applySuggestion(suggestion: { text: string; correction: string }): void {
    if (!this.activeElement) return;

    if (this.activeElement instanceof HTMLInputElement || this.activeElement instanceof HTMLTextAreaElement) {
      // For input and textarea elements
      const currentText = this.activeElement.value;
      this.activeElement.value = currentText.replace(suggestion.text, suggestion.correction);
      
      // Trigger input event to notify any listeners
      const event = new Event('input', { bubbles: true });
      this.activeElement.dispatchEvent(event);
    } else if (this.activeElement.isContentEditable) {
      // For contenteditable elements
      const currentText = this.activeElement.textContent || '';
      this.activeElement.textContent = currentText.replace(suggestion.text, suggestion.correction);
      
      // Trigger input event to notify any listeners
      const event = new InputEvent('input', { bubbles: true });
      this.activeElement.dispatchEvent(event);
    }
  }

  private getTextContent(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      return node.value || '';
    }
    
    if (node instanceof HTMLElement && node.isContentEditable) {
      return node.textContent || '';
    }
    
    return '';
  }
}

// Initialize the grammar checker
new GrammarChecker();

// Content script to handle communication between landing page and extension

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_USER_DATA') {
        // Try to get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                sendResponse({ user });
            } catch (error) {
                console.error('Error parsing user data:', error);
                sendResponse({ user: null });
            }
        } else {
            sendResponse({ user: null });
        }
        return true; // Required for async response
    }
}); 