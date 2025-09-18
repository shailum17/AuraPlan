document.addEventListener('DOMContentLoaded', () => {
    // AOS Initialization
    AOS.init({
        duration: 1000,
        once: true,
    });

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Check if user is logged in and update CTA buttons
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            const ctaButtons = document.querySelectorAll('.cta-button');
            if (user) {
                ctaButtons.forEach(btn => {
                    btn.href = 'dashboard.html';
                    btn.textContent = btn.textContent.includes('Start') ? 'Go to Dashboard' : 'Dashboard';
                });
            }
        });
    }
});
