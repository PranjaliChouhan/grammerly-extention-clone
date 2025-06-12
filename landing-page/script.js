// Landing Page JavaScript
class LandingPageManager {
    constructor() {
        this.user = null;
        this.extensionId = 'YOUR_EXTENSION_ID'; // Will be generated when extension is uploaded
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUserStatus();
        this.checkExtensionStatus();
    }

    setupEventListeners() {
        // Login buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('signupBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('heroSignup').addEventListener('click', () => this.showLoginModal());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideLoginModal());
        document.getElementById('googleSignIn').addEventListener('click', () => this.handleGoogleSignIn());
        
        // Success modal
        document.getElementById('proceedToExtension').addEventListener('click', () => this.handleExtensionInstall());
        
        // Extension install
        document.getElementById('installExtension').addEventListener('click', () => this.handleExtensionInstall());

        // Click outside modal to close
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                this.hideLoginModal();
            }
        });
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.add('hidden');
    }

    async handleGoogleSignIn() {
        const button = document.getElementById('googleSignIn');
        
        try {
            // Show loading state
            button.innerHTML = `
                <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #666; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
                <span style="color: #374151; font-weight: 500;">Signing in...</span>
            `;

            // Simulate Google OAuth (replace with real implementation)
            await this.simulateGoogleAuth();
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed. Please try again.');
            this.resetSignInButton();
        }
    }

    async simulateGoogleAuth() {
        // For testing - replace with real Google OAuth
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = {
                    email: 'user@example.com',
                    name: 'Test User',
                    picture: 'https://via.placeholder.com/150'
                };
                
                this.handleSuccessfulLogin(mockUser);
                resolve();
            }, 2000);
        });
    }

    handleSuccessfulLogin(user) {
        this.user = user;
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        // Hide login modal
        this.hideLoginModal();
        
        // Show success modal
        document.getElementById('userNameDisplay').textContent = user.name;
        document.getElementById('successModal').classList.remove('hidden');
        
        // Update UI for logged-in state
        this.updateUIForLoggedInUser();
    }

    updateUIForLoggedInUser() {
        // Hide login buttons, show user info
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('signupBtn').textContent = `Welcome, ${this.user.name.split(' ')[0]}!`;
        document.getElementById('signupBtn').classList.remove('btn-primary');
        document.getElementById('signupBtn').classList.add('btn-secondary');
        
        // Show extension status
        document.getElementById('extensionStatus').classList.remove('hidden');
    }

    checkUserStatus() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
            this.updateUIForLoggedInUser();
        }
    }

    checkExtensionStatus() {
        // Try to communicate with extension
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(this.extensionId, { action: 'ping' }, (response) => {
                if (response && response.success) {
                    this.showExtensionInstalled();
                } else {
                    this.showExtensionNotInstalled();
                }
            });
        } else {
            this.showExtensionNotInstalled();
        }
    }

    showExtensionInstalled() {
        document.getElementById('extensionNotInstalled').classList.add('hidden');
        document.getElementById('extensionInstalled').classList.remove('hidden');
    }

    showExtensionNotInstalled() {
        document.getElementById('extensionInstalled').classList.add('hidden');
        document.getElementById('extensionNotInstalled').classList.remove('hidden');
    }

    handleExtensionInstall() {
        // Hide success modal
        document.getElementById('successModal').classList.add('hidden');
        
        // For Chrome Web Store (replace with actual store URL)
        const storeUrl = 'https://chrome.google.com/webstore/detail/your-extension-id';
        
        // For development/testing - guide to load unpacked
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.showDevInstallInstructions();
        } else {
            window.open(storeUrl, '_blank');
        }
    }

    showDevInstallInstructions() {
        const instructions = `
            <div style="max-width: 500px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h3 style="color: #15C39A; margin-bottom: 16px;">Development Installation</h3>
                <ol style="text-align: left; line-height: 1.8; color: #374151;">
                    <li>Open Chrome and go to <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">chrome://extensions/</code></li>
                    <li>Enable "Developer mode" (toggle in top-right)</li>
                    <li>Click "Load unpacked"</li>
                    <li>Select the <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">dist</code> folder from the project</li>
                    <li>Pin the extension to your toolbar</li>
                </ol>
                <button onclick="this.parentElement.remove()" style="margin-top: 16px; background: #15C39A; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Got it!</button>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        overlay.innerHTML = instructions;
        
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    resetSignInButton() {
        const button = document.getElementById('googleSignIn');
        button.innerHTML = `
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style="color: #374151; font-weight: 500;">Continue with Google</span>
        `;
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPageManager();
});

// Integration with Extension (for when it's installed)
window.extensionAPI = {
    // Called by extension when it's ready
    onExtensionReady: () => {
        if (window.landingPageManager) {
            window.landingPageManager.showExtensionInstalled();
        }
    },
    
    // Pass user data to extension
    getUserData: () => {
        return JSON.parse(localStorage.getItem('user') || 'null');
    }
}; 