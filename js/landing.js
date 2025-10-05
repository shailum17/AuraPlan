document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS with modern settings
    AOS.init({
        duration: 600,
        once: true,
        offset: 50,
        easing: 'ease-out-cubic',
        delay: 0
    });

    // Mobile Navigation
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileClose = document.querySelector('.mobile-menu-close');
    const body = document.body;

    const openMobileMenu = () => {
        mobileOverlay.classList.add('active');
        body.style.overflow = 'hidden';
    };

    const closeMobileMenu = () => {
        mobileOverlay.classList.remove('active');
        body.style.overflow = '';
    };

    if (mobileToggle) {
        mobileToggle.addEventListener('click', openMobileMenu);
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                closeMobileMenu();
            }
        });
    }

    // Close mobile menu when clicking nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effects
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');
    
    const updateHeader = () => {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class for styling
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', updateHeader, { passive: true });

    // Demo video modal
    const demoBtn = document.querySelector('.demo-btn');
    const demoModal = document.getElementById('demo-modal');
    const modalClose = document.querySelector('.modal-close');

    if (demoBtn && demoModal) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            demoModal.classList.add('active');
            body.style.overflow = 'hidden';
        });
    }

    if (modalClose && demoModal) {
        modalClose.addEventListener('click', () => {
            demoModal.classList.remove('active');
            body.style.overflow = '';
        });
    }

    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                demoModal.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }

    // Pricing toggle
    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');
    const monthlyNotes = document.querySelectorAll('.monthly-note');
    const annualNotes = document.querySelectorAll('.annual-note');

    if (pricingToggle) {
        pricingToggle.addEventListener('change', () => {
            const isAnnual = pricingToggle.checked;
            
            monthlyPrices.forEach(price => {
                price.style.display = isAnnual ? 'none' : 'inline';
            });
            
            annualPrices.forEach(price => {
                price.style.display = isAnnual ? 'inline' : 'none';
            });
            
            monthlyNotes.forEach(note => {
                note.style.display = isAnnual ? 'none' : 'block';
            });
            
            annualNotes.forEach(note => {
                note.style.display = isAnnual ? 'block' : 'none';
            });
        });
    }

    // Animated counters for stats
    const animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    };

    // Intersection Observer for animations and counters
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counters
                if (entry.target.classList.contains('stat-number')) {
                    const text = entry.target.textContent;
                    const number = parseInt(text.replace(/\D/g, ''));
                    if (number) {
                        animateCounter(entry.target, number);
                    }
                }
                
                // Add animation class
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animations
    document.querySelectorAll('.stat-number, .proof-number, .feature-card, .testimonial-card, .pricing-card, .step-item').forEach(el => {
        observer.observe(el);
    });

    // Progress ring animation
    const progressRing = document.querySelector('.progress-fill');
    if (progressRing) {
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressRing.style.strokeDashoffset = 'calc(283 - (283 * 75) / 100)';
                    progressObserver.unobserve(entry.target);
                }
            });
        });
        
        progressObserver.observe(progressRing);
    }

    // Add SVG gradient for progress ring
    const progressSvg = document.querySelector('.progress-svg');
    if (progressSvg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#6366F1');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#8B5CF6');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        progressSvg.appendChild(defs);
    }

    // Enhanced button interactions
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-ghost').forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('btn-ghost')) {
                button.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }, { passive: true });
    }

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mobileOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
            if (demoModal && demoModal.classList.contains('active')) {
                demoModal.classList.remove('active');
                body.style.overflow = '';
            }
        }
    });

    // Check authentication state and update UI
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            const ctaButtons = document.querySelectorAll('.btn-primary');
            if (user) {
                ctaButtons.forEach(btn => {
                    if (btn.href && btn.href.includes('login.html')) {
                        btn.href = 'dashboard.html';
                        btn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Go to Dashboard';
                    }
                });
            }
        });
    }

    // Performance optimization
    const prefetchLinks = document.querySelectorAll('a[href="login.html"], a[href="dashboard.html"]');
    prefetchLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = link.href;
            document.head.appendChild(linkElement);
        }, { once: true });
    });

    // Add loading animation to buttons on click
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.href && !this.href.includes('#')) {
                this.style.opacity = '0.8';
                this.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    this.style.opacity = '';
                    this.style.pointerEvents = '';
                }, 2000);
            }
        });
    });

    console.log('🚀 AuraPlan landing page loaded successfully!');
});
