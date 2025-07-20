/// <reference path="../types/chrome.d.ts" />

// Popup TypeScript logic
interface User {
  email: string;
  name: string;
  picture?: string;
}

interface StorageData {
  writingPurpose: string;
}

class PopupManager {
  private onboardingPage: HTMLElement;
  private nextBtn: HTMLButtonElement;

  constructor() {
    this.onboardingPage = document.getElementById('onboardingPage')!;
    this.nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
    this.init();
  }

  private async init() {
    this.showMainInterface();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Handle radio button selections
    const radioButtons = document.querySelectorAll('input[name="writingPurpose"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.updateSelectedOption(target);
        }
      });
    });

    this.nextBtn.addEventListener('click', () => this.handleNext());
  }

  private updateSelectedOption(selectedInput: HTMLInputElement): void {
    // Remove selection styling from all options
    document.querySelectorAll('.option-card').forEach(card => {
      const div = card.querySelector('div');
      if (div) {
        div.classList.remove('border-grammarly-green', 'bg-grammarly-light-green', 'border-2');
        div.classList.add('border', 'hover:shadow-md');
      }
    });

    // Add selection styling to the chosen option
    const selectedCard = selectedInput.closest('.option-card');
    if (selectedCard) {
      const div = selectedCard.querySelector('div');
      if (div) {
        div.classList.remove('border', 'hover:shadow-md');
        div.classList.add('border-2', 'border-grammarly-green', 'bg-grammarly-light-green');
      }
    }
  }

  private showMainInterface(): void {
    // Hide any login-related elements if they exist
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
      loginPage.classList.add('hidden');
    }
    
    // Show the main interface
    this.onboardingPage.classList.remove('hidden');
  }

  private async handleNext() {
    const selectedPurpose = document.querySelector('input[name="writingPurpose"]:checked') as HTMLInputElement;
    
    if (!selectedPurpose) {
      this.showError('Please select an option to continue.');
      return;
    }

    // Store the user's selection
    // Persist the selection so it is immediately available to all content scripts
    await chrome.storage.local.set({ writingPurpose: selectedPurpose.value });
    // Also keep the existing structure if needed elsewhere
    await this.storeUserPreferences({ writingPurpose: selectedPurpose.value });
    
    // Show loading state
    this.nextBtn.disabled = true;
    this.nextBtn.innerHTML = `
      <div class="flex items-center">
        <div class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>Initializing...</span>
      </div>
    `;

    try {
      // Send message to background script to initialize grammar checking
      chrome.runtime.sendMessage(
        { type: 'INITIALIZE_GRAMMAR_CHECKER', writingPurpose: selectedPurpose.value },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            this.showError('Failed to initialize grammar checker. Please try again.');
            this.resetButton();
            return;
          }
          // Close the popup - background script will handle tab initialization
          window.close();
        }
      );
    } catch (error) {
      console.error('Error:', error);
      this.showError('An error occurred. Please try again.');
      this.resetButton();
    }
  }

  private resetButton(): void {
    this.nextBtn.disabled = false;
    this.nextBtn.innerHTML = `
      <span>Continue</span>
      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    `;
  }

  private showError(message: string): void {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg text-sm';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  private async storeUserPreferences(preferences: { writingPurpose: string }): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ preferences }, () => {
        resolve();
      });
    });
  }
}

// Initialize popup
new PopupManager();

document.addEventListener('DOMContentLoaded', async () => {
  // Check if writing purpose is already selected
  const result = await chrome.storage.local.get(['writingPurpose']);
  
  if (result.writingPurpose) {
    // If already selected, hide the selection UI and show current selection
    showCurrentSelection(result.writingPurpose);
  } else {
    // Show the selection UI
    showSelectionUI();
  }
});

function showSelectionUI() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-4';
  container.innerHTML = `
    <div class="flex items-center gap-2">
      <img src="../assets/logo.png" alt="Grammar Extension" class="w-8 h-8">
      <h1 class="text-xl font-semibold">Grammar Extension</h1>
    </div>
    
    <p class="text-gray-600">Select your primary writing purpose:</p>
    
    <div class="writing-purpose-options space-y-3">
      <div class="option cursor-pointer p-3 rounded-lg border hover:border-emerald-500" data-purpose="academic">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📚</span>
          <div>
            <h3 class="font-medium">Academic Writing</h3>
            <p class="text-sm text-gray-600">Essays, research papers, and scholarly work</p>
          </div>
        </div>
      </div>

      <div class="option cursor-pointer p-3 rounded-lg border hover:border-emerald-500" data-purpose="business">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💼</span>
          <div>
            <h3 class="font-medium">Business Communication</h3>
            <p class="text-sm text-gray-600">Emails, reports, and professional documents</p>
          </div>
        </div>
      </div>

      <div class="option cursor-pointer p-3 rounded-lg border hover:border-emerald-500" data-purpose="creative">
        <div class="flex items-center gap-3">
          <span class="text-2xl">✨</span>
          <div>
            <h3 class="font-medium">Creative Writing</h3>
            <p class="text-sm text-gray-600">Stories, blogs, and creative content</p>
          </div>
        </div>
      </div>
    </div>

    <button id="continue" class="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
      Continue
    </button>
  `;

  document.body.appendChild(container);

  // Add selection functionality
  let selectedOption: string | null = null;
  const options = document.querySelectorAll('.option');
  const continueButton = document.getElementById('continue');

  options.forEach(option => {
    option.addEventListener('click', () => {
      // Remove previous selection
      options.forEach(opt => opt.classList.remove('border-emerald-500'));
      
      // Add new selection
      option.classList.add('border-emerald-500');
      selectedOption = option.getAttribute('data-purpose');
      
      // Enable continue button
      if (continueButton) {
        continueButton.removeAttribute('disabled');
      }
    });
  });

  // Handle continue button click
  continueButton?.addEventListener('click', async () => {
    if (selectedOption) {
      // Store the selection
      await chrome.storage.local.set({ writingPurpose: selectedOption });
      
      // Initialize grammar checking in all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { 
            type: 'START_GRAMMAR_CHECK',
            writingPurpose: selectedOption 
          });
        }
      });

      // Update popup UI to show current selection
      showCurrentSelection(selectedOption);
    }
  });
}

function showCurrentSelection(writingPurpose: string) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-4';
  
  const purposeDisplay = {
    academic: {
      icon: '📚',
      title: 'Academic Writing',
      description: 'Essays, research papers, and scholarly work'
    },
    business: {
      icon: '💼',
      title: 'Business Communication',
      description: 'Emails, reports, and professional documents'
    },
    creative: {
      icon: '✨',
      title: 'Creative Writing',
      description: 'Stories, blogs, and creative content'
    }
  };

  const purpose = purposeDisplay[writingPurpose as keyof typeof purposeDisplay];

  container.innerHTML = `
    <div class="flex items-center gap-2">
      <img src="../assets/logo.png" alt="Grammar Extension" class="w-8 h-8">
      <h1 class="text-xl font-semibold">Grammar Extension</h1>
    </div>
    
    <div class="border rounded-lg p-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl">${purpose.icon}</span>
        <div>
          <h3 class="font-medium">${purpose.title}</h3>
          <p class="text-sm text-gray-600">${purpose.description}</p>
        </div>
      </div>
    </div>

    <button id="change-purpose" class="w-full border border-emerald-500 text-emerald-500 py-2 px-4 rounded-lg mt-4 hover:bg-emerald-50">
      Change Writing Purpose
    </button>
  `;

  // Clear existing content
  document.body.innerHTML = '';
  document.body.appendChild(container);

  // Handle change button click
  document.getElementById('change-purpose')?.addEventListener('click', async () => {
    // Clear stored purpose
    await chrome.storage.local.remove(['writingPurpose']);
    
    // Show selection UI again
    document.body.innerHTML = '';
    showSelectionUI();
  });
} 