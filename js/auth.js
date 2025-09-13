document.addEventListener('DOMContentLoaded', () => {
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
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            loadingOverlay.style.display = 'flex';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    alert(error.message);
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
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            loadingOverlay.style.display = 'flex';

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    alert(error.message);
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
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            alert(error.message);
        })
        .finally(() => {
            loadingOverlay.style.display = 'none';
        });
}
