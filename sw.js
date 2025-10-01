// AuraPlan Service Worker
const CACHE_NAME = 'auraplan-v1.0.0';
const OFFLINE_URL = 'offline.html';

// Files to cache for offline functionality
const urlsToCache = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/calendar.html',
    '/goals.html',
    '/analytics.html',
    '/login.html',
    '/styles/landing.css',
    '/styles/auth.css',
    '/styles/dashboard.css',
    '/styles/calendar.css',
    '/styles/goals.css',
    '/styles/analytics.css',
    '/js/landing.js',
    '/js/dashboard.js',
    '/js/calendar.js',
    '/js/goals.js',
    '/js/analytics.js',
    '/js/local-storage.js',
    '/js/notifications.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Cache populated');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Skip Firebase requests (let them fail naturally for proper offline handling)
    if (event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('firebase.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If network fails, try to serve offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-tasks') {
        event.waitUntil(syncTasks());
    } else if (event.tag === 'background-sync-goals') {
        event.waitUntil(syncGoals());
    }
});

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push received', event);
    
    const options = {
        body: 'You have pending tasks to complete!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Tasks',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close notification',
                icon: '/images/xmark.png'
            }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'AuraPlan Reminder';
    }

    event.waitUntil(
        self.registration.showNotification('AuraPlan Reminder', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click received', event);
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the dashboard
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.matchAll().then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Background task sync
async function syncTasks() {
    try {
        console.log('Service Worker: Syncing tasks...');
        
        // Get pending tasks from IndexedDB or localStorage
        const pendingTasks = await getPendingTasks();
        
        if (pendingTasks.length === 0) {
            console.log('Service Worker: No pending tasks to sync');
            return;
        }

        // Sync with Firebase
        const response = await fetch('/api/sync-tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tasks: pendingTasks })
        });

        if (response.ok) {
            console.log('Service Worker: Tasks synced successfully');
            await clearPendingTasks();
        } else {
            throw new Error('Sync failed');
        }
    } catch (error) {
        console.error('Service Worker: Task sync failed', error);
        throw error;
    }
}

// Background goals sync
async function syncGoals() {
    try {
        console.log('Service Worker: Syncing goals...');
        
        const pendingGoals = await getPendingGoals();
        
        if (pendingGoals.length === 0) {
            console.log('Service Worker: No pending goals to sync');
            return;
        }

        const response = await fetch('/api/sync-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ goals: pendingGoals })
        });

        if (response.ok) {
            console.log('Service Worker: Goals synced successfully');
            await clearPendingGoals();
        } else {
            throw new Error('Sync failed');
        }
    } catch (error) {
        console.error('Service Worker: Goals sync failed', error);
        throw error;
    }
}

// Helper functions for offline data management
async function getPendingTasks() {
    // This would typically use IndexedDB for more robust offline storage
    // For now, we'll simulate with an empty array
    return [];
}

async function getPendingGoals() {
    return [];
}

async function clearPendingTasks() {
    // Clear synced tasks from local storage
    console.log('Service Worker: Cleared pending tasks');
}

async function clearPendingGoals() {
    // Clear synced goals from local storage
    console.log('Service Worker: Cleared pending goals');
}

// Periodic background sync for reminders
self.addEventListener('periodicsync', event => {
    if (event.tag === 'daily-reminder') {
        event.waitUntil(sendDailyReminder());
    }
});

async function sendDailyReminder() {
    try {
        // Check if user has pending tasks
        const hasPendingTasks = await checkPendingTasks();
        
        if (hasPendingTasks) {
            await self.registration.showNotification('Daily Reminder', {
                body: 'Don\'t forget to check your tasks for today!',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'daily-reminder',
                requireInteraction: false,
                silent: false
            });
        }
    } catch (error) {
        console.error('Service Worker: Daily reminder failed', error);
    }
}

async function checkPendingTasks() {
    // Check localStorage for pending tasks
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        return tasks.some(task => !task.completed);
    } catch (error) {
        console.error('Service Worker: Error checking pending tasks', error);
        return false;
    }
}

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        scheduleNotification(event.data.payload);
    }
});

// Schedule a notification
function scheduleNotification(payload) {
    const { title, body, delay } = payload;
    
    setTimeout(() => {
        self.registration.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            tag: 'scheduled-notification'
        });
    }, delay);
}

// Cache update strategy
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});