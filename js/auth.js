document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js loaded');
    console.log('Firebase available:', typeof firebase !== 'undefined');
    console.log('Auth available:', typeof auth !== 'undefined');
    
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User already logged in:', user);
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            console.log('No user logged in');
        }
    });

    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinBtn = document.querySelector('[data-tab="signin"]');
    const signupBtn = document.querySelector('[data-tab="signup"]');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Tab switching
    signinBtn.addEventListener('click', () => {
        signinBtn.classList.add('active');
        signupBtn.classList.remove('active');
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
    });

    signupBtn.addEventListener('click', () => {
        signupBtn.classList.add('active');
        signinBtn.classList.remove('active');
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
    });

    // Sign In
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signin-email').value.trim();
            const password = document.getElementById('signin-password').value;

            // Basic validation
            if (!email || !password) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            loadingOverlay.style.display = 'flex';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    showMessage('Sign in successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                })
                .catch(error => {
                    showMessage(getErrorMessage(error.code), 'error');
                })
                .finally(() => {
                    loadingOverlay.style.display = 'none';
                });
        });
    }

    // Sign Up
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validation
            if (!email || !password || !confirmPassword) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('Password must be at least 6 characters long.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", 'error');
                return;
            }

            loadingOverlay.style.display = 'flex';

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    showMessage('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                })
                .catch(error => {
                    showMessage(getErrorMessage(error.code), 'error');
                })
                .finally(() => {
                    loadingOverlay.style.display = 'none';
                });
        });
    }
});

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function signInAnonymously() {
    console.log('signInAnonymously function called');
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded');
        showMessage('Firebase is not loaded. Please refresh the page.', 'error');
        return;
    }
    
    // Check if auth is available
    if (!auth) {
        console.error('Firebase Auth is not initialized');
        showMessage('Authentication service is not available. Please refresh the page.', 'error');
        return;
    }
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    console.log('Attempting anonymous sign in...');
    
    auth.signInAnonymously()
        .then((userCredential) => {
            console.log('Anonymous sign in successful:', userCredential);
            showMessage('Signed in as guest! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Anonymous sign in error:', error);
            let errorMessage = getErrorMessage(error.code);
            
            // Add specific error handling for anonymous auth
            if (error.code === 'auth/operation-not-allowed') {
                // If anonymous auth is not enabled, provide a fallback
                console.log('Anonymous auth not enabled, using fallback guest mode');
                showMessage('Entering guest mode...', 'success');
                
                // Set a flag in localStorage to indicate guest mode
                localStorage.setItem('guestMode', 'true');
                localStorage.setItem('guestUser', JSON.stringify({
                    uid: 'guest-' + Date.now(),
                    displayName: 'Guest User',
                    email: null,
                    isAnonymous: true
                }));
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                return;
            }
            
            showMessage(errorMessage, 'error');
        })
        .finally(() => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        });
}

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert message at the top of the auth card
    const authCard = document.querySelector('.auth-card');
    const authHeader = document.querySelector('.auth-header');
    authCard.insertBefore(messageDiv, authHeader.nextSibling);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/operation-not-allowed':
            return 'This authentication method is not enabled. Please contact support.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        default:
            return `An error occurred: ${errorCode}. Please try again.`;
    }
}
