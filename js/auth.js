document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
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
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    auth.signInAnonymously()
        .then(() => {
            showMessage('Signed in as guest! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            showMessage(getErrorMessage(error.code), 'error');
        })
        .finally(() => {
            loadingOverlay.style.display = 'none';
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
        default:
            return 'An error occurred. Please try again.';
    }
}
