interface User {
  name: string;
  email: string;
  picture?: string;
}

interface GoogleAuthResult {
  token: string;
  user: User;
}

// Replace this with your actual Chrome extension ID
const EXTENSION_ID = 'your-extension-id';

class LandingPageManager {
  private user: User | null = null;
  private readonly loginModal: HTMLElement;
  private readonly successModal: HTMLElement;
  private readonly loginBtn: HTMLElement;
  private readonly signupBtn: HTMLElement;
  private readonly heroSignup: HTMLElement;
  private readonly closeModal: HTMLElement;
  private readonly googleSignIn: HTMLElement;
  private readonly proceedToExtension: HTMLElement;
  private readonly installExtension: HTMLElement;
  private readonly userNameDisplay: HTMLElement;
  private readonly extensionStatus: HTMLElement;

  constructor() {
    // Initialize DOM elements
    this.loginModal = document.getElementById('loginModal')!;
    this.successModal = document.getElementById('successModal')!;
    this.loginBtn = document.getElementById('loginBtn')!;
    this.signupBtn = document.getElementById('signupBtn')!;
    this.heroSignup = document.getElementById('heroSignup')!;
    this.closeModal = document.getElementById('closeModal')!;
    this.googleSignIn = document.getElementById('googleSignIn')!;
    this.proceedToExtension = document.getElementById('proceedToExtension')!;
    this.installExtension = document.getElementById('installExtension')!;
    this.userNameDisplay = document.getElementById('userNameDisplay')!;
    this.extensionStatus = document.getElementById('extensionStatus')!;

    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.checkUserStatus();
    this.checkExtensionStatus();
  }

  private setupEventListeners(): void {
    // Login buttons
    this.loginBtn.addEventListener('click', () => this.showLoginModal());
    this.signupBtn.addEventListener('click', () => this.showLoginModal());
    this.heroSignup.addEventListener('click', () => this.showLoginModal());
    
    // Modal controls
    this.closeModal.addEventListener('click', () => this.hideLoginModal());
    this.googleSignIn.addEventListener('click', () => this.handleGoogleSignIn());
    
    // Success modal
    this.proceedToExtension.addEventListener('click', () => this.handleExtensionInstall());
    
    // Extension install
    this.installExtension.addEventListener('click', () => this.handleExtensionInstall());

    // Click outside modal to close
    this.loginModal.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'loginModal') {
        this.hideLoginModal();
      }
    });
  }

  private showLoginModal(): void {
    this.loginModal.classList.remove('hidden');
    // Add animation classes
    this.loginModal.querySelector('.bg-white')?.classList.add('animate-fade-in');
  }

  private hideLoginModal(): void {
    this.loginModal.classList.add('hidden');
    // Remove animation classes for next time
    this.loginModal.querySelector('.bg-white')?.classList.remove('animate-fade-in');
  }

  private async handleGoogleSignIn(): Promise<void> {
    const button = this.googleSignIn;
    
    try {
      // Show loading state with Tailwind classes
      button.innerHTML = `
        <div class="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3"></div>
        <span class="text-gray-700 font-medium">Signing in...</span>
      `;

      // Simulate Google OAuth (replace with real implementation)
      const result = await this.authenticateWithGoogle();
      
      if (result) {
        await this.handleSuccessfulLogin(result.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.showError('Login failed. Please try again.');
      this.resetSignInButton();
    }
  }

  private async authenticateWithGoogle(): Promise<GoogleAuthResult> {
    // This is a mock implementation. Replace with real Google OAuth
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_token',
          user: {
            email: 'user@example.com',
            name: 'Test User',
            picture: 'https://via.placeholder.com/150'
          }
        });
      }, 2000);
    });
  }

  private async handleSuccessfulLogin(user: User): Promise<void> {
    this.user = user;
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Hide login modal
    this.hideLoginModal();
    
    // Show success modal with animation
    this.userNameDisplay.textContent = user.name;
    this.successModal.classList.remove('hidden');
    this.successModal.querySelector('.bg-white')?.classList.add('animate-fade-in');
    
    // Update UI for logged-in state
    this.updateUIForLoggedInUser();
  }

  private updateUIForLoggedInUser(): void {
    if (!this.user) return;

    // Hide login button, update signup button
    this.loginBtn.classList.add('hidden');
    this.signupBtn.textContent = `Welcome, ${this.user.name.split(' ')[0]}!`;
    this.signupBtn.classList.remove('btn-primary');
    this.signupBtn.classList.add('btn-secondary');
    
    // Show extension status
    this.extensionStatus.classList.remove('hidden');
    this.checkExtensionStatus();
  }

  private checkUserStatus(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.updateUIForLoggedInUser();
    }
  }

  private async checkExtensionStatus(): Promise<void> {
    try {
      // Check if extension is installed
      const isInstalled = await this.isExtensionInstalled(EXTENSION_ID);
      
      const notInstalledEl = document.getElementById('extensionNotInstalled');
      const installedEl = document.getElementById('extensionInstalled');
      
      if (isInstalled) {
        notInstalledEl?.classList.add('hidden');
        installedEl?.classList.remove('hidden');
      } else {
        notInstalledEl?.classList.remove('hidden');
        installedEl?.classList.add('hidden');
      }
    } catch (error) {
      console.error('Failed to check extension status:', error);
    }
  }

  private async isExtensionInstalled(extensionId: string): Promise<boolean> {
    // This is a mock implementation. Replace with actual extension check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 100);
    });
  }

  private async handleExtensionInstall(): Promise<void> {
    // For development, show instructions for loading unpacked extension
    const instructionsModal = document.createElement('div');
    instructionsModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    instructionsModal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">Development Mode Installation</h3>
        <ol class="list-decimal pl-5 space-y-2 mb-6 text-gray-600">
          <li>Open Chrome and go to <code class="bg-gray-100 px-2 py-1 rounded">chrome://extensions</code></li>
          <li>Enable "Developer mode" in the top right</li>
          <li>Click "Load unpacked" button</li>
          <li>Select the <code class="bg-gray-100 px-2 py-1 rounded">dist</code> folder from this project</li>
        </ol>
        <div class="flex justify-end">
          <button class="text-gray-500 hover:text-gray-700 mr-4" onclick="this.parentElement.parentElement.parentElement.remove()">
            Close
          </button>
          <button class="bg-grammarly-green text-white px-4 py-2 rounded hover:bg-grammarly-dark-green" onclick="window.open('chrome://extensions')">
            Open Extensions Page
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(instructionsModal);

    // Add click handler to close modal when clicking outside
    instructionsModal.addEventListener('click', (e: MouseEvent) => {
      if (e.target === instructionsModal) {
        instructionsModal.remove();
      }
    });
  }

  private showError(message: string): void {
    // Create and show error notification with Tailwind classes
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  private resetSignInButton(): void {
    this.googleSignIn.innerHTML = `
      <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span class="text-gray-700 font-medium">Continue with Google</span>
    `;
  }
}

// Initialize the landing page manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LandingPageManager();
}); 