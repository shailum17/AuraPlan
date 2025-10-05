/**
 * Navigation Components JavaScript for AuraPlan
 * Handles desktop sidebar, mobile navigation, hamburger menu, and breadcrumbs
 */

class NavigationManager {
    constructor() {
        this.sidebar = null;
        this.mobileNav = null;
        this.hamburgerMenu = null;
        this.breadcrumb = null;
        this.overlay = null;
        
        this.isDesktop = window.innerWidth >= 1024;
        this.isMobile = window.innerWidth <= 767;
        this.sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        
        this.init();
    }
    
    init() {
        this.createNavigationElements();
        this.bindEvents();
        this.handleResize();
        this.updateActiveStates();
        
        // Initialize sidebar state
        if (this.isDesktop && this.sidebarCollapsed) {
            this.collapseSidebar();
        }
    }
    
    createNavigationElements() {
        this.createSidebar();
        this.createMobileBottomNav();
        this.createHamburgerMenu();
        this.createBreadcrumb();
        this.createOverlay();
    }
    
    createSidebar() {
        // Check if sidebar already exists
        if (document.querySelector('.sidebar-nav')) return;
        
        const sidebar = document.createElement('nav');
        sidebar.className = 'sidebar-nav';
        sidebar.setAttribute('aria-label', 'Main navigation');
        
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <a href="/" class="sidebar-logo" aria-label="AuraPlan Home">
                    <div class="sidebar-logo-icon">
                        <i class="fas fa-graduation-cap" aria-hidden="true"></i>
                    </div>
                    <span class="sidebar-logo-text">AuraPlan</span>
                </a>
                <button class="sidebar-toggle" aria-label="Toggle sidebar" aria-expanded="true">
                    <i class="fas fa-chevron-left" aria-hidden="true"></i>
                </button>
            </div>
            
            <div class="sidebar-menu" role="navigation">
                <div class="menu-section">
                    <div class="menu-section-title">Main</div>
                    <div class="menu-item">
                        <a href="/dashboard.html" class="menu-link" data-page="dashboard">
                            <div class="menu-icon">
                                <i class="fas fa-home" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Dashboard</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a href="/goals.html" class="menu-link" data-page="goals">
                            <div class="menu-icon">
                                <i class="fas fa-target" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Goals</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a href="/calendar.html" class="menu-link" data-page="calendar">
                            <div class="menu-icon">
                                <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Calendar</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a href="/analytics.html" class="menu-link" data-page="analytics">
                            <div class="menu-icon">
                                <i class="fas fa-chart-bar" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Analytics</span>
                        </a>
                    </div>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">Study Tools</div>
                    <div class="menu-item">
                        <a href="#" class="menu-link" data-submenu="study-tools">
                            <div class="menu-icon">
                                <i class="fas fa-book" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Study Materials</span>
                            <i class="menu-arrow fas fa-chevron-right" aria-hidden="true"></i>
                        </a>
                        <div class="submenu">
                            <a href="#" class="submenu-link">Notes</a>
                            <a href="#" class="submenu-link">Flashcards</a>
                            <a href="#" class="submenu-link">Practice Tests</a>
                        </div>
                    </div>
                    <div class="menu-item">
                        <a href="#" class="menu-link">
                            <div class="menu-icon">
                                <i class="fas fa-clock" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Time Tracking</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a href="#" class="menu-link">
                            <div class="menu-icon">
                                <i class="fas fa-users" aria-hidden="true"></i>
                            </div>
                            <span class="menu-text">Study Groups</span>
                            <span class="menu-badge">3</span>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-footer">
                <div class="sidebar-user" role="button" tabindex="0" aria-label="User menu">
                    <div class="sidebar-avatar">
                        <i class="fas fa-user" aria-hidden="true"></i>
                    </div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">Student User</div>
                        <div class="sidebar-user-role">Premium Plan</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    }
    
    createMobileBottomNav() {
        // Check if mobile nav already exists
        if (document.querySelector('.mobile-bottom-nav')) return;
        
        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-bottom-nav';
        mobileNav.setAttribute('aria-label', 'Mobile navigation');
        
        mobileNav.innerHTML = `
            <div class="mobile-nav-container">
                <a href="/dashboard.html" class="mobile-nav-item" data-page="dashboard">
                    <div class="mobile-nav-icon">
                        <i class="fas fa-home" aria-hidden="true"></i>
                    </div>
                    <span class="mobile-nav-text">Home</span>
                </a>
                <a href="/goals.html" class="mobile-nav-item" data-page="goals">
                    <div class="mobile-nav-icon">
                        <i class="fas fa-target" aria-hidden="true"></i>
                    </div>
                    <span class="mobile-nav-text">Goals</span>
                </a>
                <a href="/calendar.html" class="mobile-nav-item" data-page="calendar">
                    <div class="mobile-nav-icon">
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                    </div>
                    <span class="mobile-nav-text">Calendar</span>
                </a>
                <a href="/analytics.html" class="mobile-nav-item" data-page="analytics">
                    <div class="mobile-nav-icon">
                        <i class="fas fa-chart-bar" aria-hidden="true"></i>
                    </div>
                    <span class="mobile-nav-text">Analytics</span>
                    <span class="mobile-nav-badge">2</span>
                </a>
                <a href="/profile.html" class="mobile-nav-item" data-page="profile">
                    <div class="mobile-nav-icon">
                        <i class="fas fa-user" aria-hidden="true"></i>
                    </div>
                    <span class="mobile-nav-text">Profile</span>
                </a>
            </div>
        `;
        
        document.body.appendChild(mobileNav);
        this.mobileNav = mobileNav;
    }
    
    createHamburgerMenu() {
        // Check if hamburger menu already exists
        if (document.querySelector('.hamburger-menu')) return;
        
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger-menu';
        
        hamburger.innerHTML = `
            <button class="hamburger-toggle" aria-label="Toggle menu" aria-expanded="false">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
            <div class="hamburger-dropdown" role="menu">
                <a href="/settings.html" class="hamburger-menu-item" role="menuitem">
                    <div class="hamburger-menu-icon">
                        <i class="fas fa-cog" aria-hidden="true"></i>
                    </div>
                    <span class="hamburger-menu-text">Settings</span>
                </a>
                <a href="/profile.html" class="hamburger-menu-item" role="menuitem">
                    <div class="hamburger-menu-icon">
                        <i class="fas fa-user" aria-hidden="true"></i>
                    </div>
                    <span class="hamburger-menu-text">Profile</span>
                </a>
                <a href="#" class="hamburger-menu-item" role="menuitem">
                    <div class="hamburger-menu-icon">
                        <i class="fas fa-question-circle" aria-hidden="true"></i>
                    </div>
                    <span class="hamburger-menu-text">Help & Support</span>
                </a>
                <a href="#" class="hamburger-menu-item" role="menuitem">
                    <div class="hamburger-menu-icon">
                        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                    </div>
                    <span class="hamburger-menu-text">Sign Out</span>
                </a>
            </div>
        `;
        
        // Add to header if it exists, otherwise create a container
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
            header.appendChild(hamburger);
        } else {
            document.body.appendChild(hamburger);
        }
        
        this.hamburgerMenu = hamburger;
    }
    
    createBreadcrumb() {
        // Check if breadcrumb already exists
        if (document.querySelector('.breadcrumb-nav')) return;
        
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb-nav';
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        
        breadcrumb.innerHTML = `
            <ol class="breadcrumb-list">
                <li class="breadcrumb-item">
                    <a href="/" class="breadcrumb-link">
                        <i class="fas fa-home breadcrumb-icon" aria-hidden="true"></i>
                        Home
                    </a>
                    <span class="breadcrumb-separator" aria-hidden="true">/</span>
                </li>
            </ol>
        `;
        
        // Add to main content area if it exists
        const mainContent = document.querySelector('.main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.insertBefore(breadcrumb, mainContent.firstChild);
        }
        
        this.breadcrumb = breadcrumb;
        this.updateBreadcrumb();
    }
    
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }
    
    bindEvents() {
        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Submenu toggles
        const submenuLinks = document.querySelectorAll('[data-submenu]');
        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(link.closest('.menu-item'));
            });
        });
        
        // Hamburger menu toggle
        const hamburgerToggle = document.querySelector('.hamburger-toggle');
        if (hamburgerToggle) {
            hamburgerToggle.addEventListener('click', () => this.toggleHamburgerMenu());
        }
        
        // Mobile overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileMenus());
        }
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close menus on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // User menu click
        const sidebarUser = document.querySelector('.sidebar-user');
        if (sidebarUser) {
            sidebarUser.addEventListener('click', () => this.toggleUserMenu());
            sidebarUser.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleUserMenu();
                }
            });
        }
    }
    
    toggleSidebar() {
        if (!this.sidebar) return;
        
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        const toggle = this.sidebar.querySelector('.sidebar-toggle');
        const toggleIcon = toggle?.querySelector('i');
        
        if (isCollapsed) {
            this.sidebar.classList.remove('collapsed');
            if (toggleIcon) toggleIcon.className = 'fas fa-chevron-left';
            toggle?.setAttribute('aria-expanded', 'true');
            localStorage.setItem('sidebar-collapsed', 'false');
        } else {
            this.sidebar.classList.add('collapsed');
            if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right';
            toggle?.setAttribute('aria-expanded', 'false');
            localStorage.setItem('sidebar-collapsed', 'true');
        }
        
        this.sidebarCollapsed = !isCollapsed;
        
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: { collapsed: this.sidebarCollapsed }
        }));
    }
    
    collapseSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('collapsed');
        const toggle = this.sidebar.querySelector('.sidebar-toggle');
        const toggleIcon = toggle?.querySelector('i');
        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right';
        toggle?.setAttribute('aria-expanded', 'false');
    }
    
    toggleSubmenu(menuItem) {
        if (!menuItem) return;
        
        const isExpanded = menuItem.classList.contains('expanded');
        const submenuLink = menuItem.querySelector('[data-submenu]');
        
        // Close other submenus
        document.querySelectorAll('.menu-item.expanded').forEach(item => {
            if (item !== menuItem) {
                item.classList.remove('expanded');
                const link = item.querySelector('[data-submenu]');
                link?.setAttribute('aria-expanded', 'false');
            }
        });
        
        if (isExpanded) {
            menuItem.classList.remove('expanded');
            submenuLink?.setAttribute('aria-expanded', 'false');
        } else {
            menuItem.classList.add('expanded');
            submenuLink?.setAttribute('aria-expanded', 'true');
        }
    }
    
    toggleHamburgerMenu() {
        if (!this.hamburgerMenu) return;
        
        const isActive = this.hamburgerMenu.classList.contains('active');
        const toggle = this.hamburgerMenu.querySelector('.hamburger-toggle');
        
        if (isActive) {
            this.hamburgerMenu.classList.remove('active');
            toggle?.setAttribute('aria-expanded', 'false');
        } else {
            this.hamburgerMenu.classList.add('active');
            toggle?.setAttribute('aria-expanded', 'true');
        }
    }
    
    toggleUserMenu() {
        // Placeholder for user menu functionality
        console.log('User menu clicked');
        // You can implement a dropdown menu or modal here
    }
    
    closeMobileMenus() {
        // Close hamburger menu
        if (this.hamburgerMenu) {
            this.hamburgerMenu.classList.remove('active');
            const toggle = this.hamburgerMenu.querySelector('.hamburger-toggle');
            toggle?.setAttribute('aria-expanded', 'false');
        }
        
        // Close mobile sidebar
        if (this.sidebar) {
            this.sidebar.classList.remove('mobile-open');
        }
        
        // Hide overlay
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }
    
    handleResize() {
        const wasDesktop = this.isDesktop;
        const wasMobile = this.isMobile;
        
        this.isDesktop = window.innerWidth >= 1024;
        this.isMobile = window.innerWidth <= 767;
        
        // Close mobile menus when switching to desktop
        if (!wasDesktop && this.isDesktop) {
            this.closeMobileMenus();
        }
        
        // Update navigation visibility
        this.updateNavigationVisibility();
    }
    
    updateNavigationVisibility() {
        // This is handled by CSS media queries, but we can add JS logic if needed
        if (this.isDesktop && this.sidebarCollapsed) {
            this.collapseSidebar();
        }
    }
    
    handleKeyboard(e) {
        // Escape key closes menus
        if (e.key === 'Escape') {
            this.closeMobileMenus();
        }
        
        // Tab navigation for accessibility
        if (e.key === 'Tab') {
            // Handle focus management if needed
        }
    }
    
    handleOutsideClick(e) {
        // Close hamburger menu if clicking outside
        if (this.hamburgerMenu && 
            this.hamburgerMenu.classList.contains('active') &&
            !this.hamburgerMenu.contains(e.target)) {
            this.toggleHamburgerMenu();
        }
    }
    
    updateActiveStates() {
        const currentPage = this.getCurrentPage();
        
        // Update sidebar active states
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === currentPage) {
                link.classList.add('active');
            }
        });
        
        // Update mobile nav active states
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    updateBreadcrumb() {
        if (!this.breadcrumb) return;
        
        const breadcrumbList = this.breadcrumb.querySelector('.breadcrumb-list');
        if (!breadcrumbList) return;
        
        const currentPage = this.getCurrentPage();
        const pageTitle = this.getPageTitle(currentPage);
        
        // Clear existing breadcrumb items except home
        const homeItem = breadcrumbList.querySelector('.breadcrumb-item');
        breadcrumbList.innerHTML = '';
        breadcrumbList.appendChild(homeItem);
        
        // Add current page if not home
        if (currentPage && currentPage !== 'home' && currentPage !== 'index') {
            const currentItem = document.createElement('li');
            currentItem.className = 'breadcrumb-item';
            currentItem.innerHTML = `
                <span class="breadcrumb-link current">${pageTitle}</span>
            `;
            breadcrumbList.appendChild(currentItem);
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('.html', '') || 'index';
    }
    
    getPageTitle(page) {
        const titles = {
            'dashboard': 'Dashboard',
            'goals': 'Goals',
            'calendar': 'Calendar',
            'analytics': 'Analytics',
            'profile': 'Profile',
            'settings': 'Settings',
            'index': 'Home'
        };
        return titles[page] || page.charAt(0).toUpperCase() + page.slice(1);
    }
    
    // Public API methods
    setActivePage(page) {
        // Update active states programmatically
        document.querySelectorAll('.menu-link, .mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
        
        this.updateBreadcrumb();
    }
    
    addBreadcrumbItem(text, href = null) {
        if (!this.breadcrumb) return;
        
        const breadcrumbList = this.breadcrumb.querySelector('.breadcrumb-list');
        const item = document.createElement('li');
        item.className = 'breadcrumb-item';
        
        if (href) {
            item.innerHTML = `
                <a href="${href}" class="breadcrumb-link">${text}</a>
                <span class="breadcrumb-separator" aria-hidden="true">/</span>
            `;
        } else {
            item.innerHTML = `
                <span class="breadcrumb-link current">${text}</span>
            `;
        }
        
        breadcrumbList.appendChild(item);
    }
    
    showNotificationBadge(page, count) {
        // Show notification badge on navigation items
        const menuLink = document.querySelector(`[data-page="${page}"]`);
        if (menuLink) {
            let badge = menuLink.querySelector('.menu-badge, .mobile-nav-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = menuLink.classList.contains('menu-link') ? 'menu-badge' : 'mobile-nav-badge';
                menuLink.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    hideNotificationBadge(page) {
        const menuLink = document.querySelector(`[data-page="${page}"]`);
        if (menuLink) {
            const badge = menuLink.querySelector('.menu-badge, .mobile-nav-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}