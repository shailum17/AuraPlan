// Notification Manager
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.notifications = new Map();
        this.reminders = new Map();
        this.init();
    }

    async init() {
        // Request notification permission
        if ('Notification' in window) {
            this.permission = await this.requestPermission();
        }

        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered for notifications');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        // Load existing reminders from storage
        this.loadReminders();
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        const permission = await Notification.requestPermission();
        return permission;
    }

    showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'auraplan-notification',
            requireInteraction: false,
            silent: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // Auto-close after 5 seconds if not requiring interaction
            if (!defaultOptions.requireInteraction) {
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }

            // Handle notification clicks
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (options.onClick) {
                    options.onClick(event);
                }
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    scheduleReminder(taskId, task, reminderMinutes) {
        if (!task.dueDate || !task.dueTime) {
            console.warn('Task must have due date and time for reminders');
            return false;
        }

        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        const reminderTime = new Date(dueDateTime.getTime() - (reminderMinutes * 60 * 1000));
        const now = new Date();

        if (reminderTime <= now) {
            console.warn('Reminder time is in the past');
            return false;
        }

        const timeoutId = setTimeout(() => {
            this.showTaskReminder(task);
            this.reminders.delete(taskId);
            this.saveReminders();
        }, reminderTime.getTime() - now.getTime());

        const reminderData = {
            taskId,
            timeoutId,
            reminderTime: reminderTime.toISOString(),
            reminderMinutes,
            task: { ...task }
        };

        this.reminders.set(taskId, reminderData);
        this.saveReminders();
        
        console.log(`Reminder scheduled for task "${task.title}" at ${reminderTime}`);
        return true;
    }

    showTaskReminder(task) {
        const notification = this.showNotification(
            `⏰ Reminder: ${task.title}`,
            {
                body: task.description || 'Task is due soon!',
                icon: '/favicon.ico',
                tag: `task-reminder-${task.id}`,
                requireInteraction: true,
                actions: [
                    { action: 'complete', title: 'Mark Complete' },
                    { action: 'snooze', title: 'Snooze 15min' }
                ],
                onClick: () => {
                    // Focus on the task
                    window.location.href = `dashboard.html#task-${task.id}`;
                }
            }
        );

        // Play notification sound if enabled
        this.playNotificationSound();

        return notification;
    }

    cancelReminder(taskId) {
        const reminder = this.reminders.get(taskId);
        if (reminder) {
            clearTimeout(reminder.timeoutId);
            this.reminders.delete(taskId);
            this.saveReminders();
            console.log(`Reminder cancelled for task ${taskId}`);
            return true;
        }
        return false;
    }

    updateReminder(taskId, task, reminderMinutes) {
        this.cancelReminder(taskId);
        return this.scheduleReminder(taskId, task, reminderMinutes);
    }

    snoozeReminder(taskId, snoozeMinutes = 15) {
        const reminder = this.reminders.get(taskId);
        if (!reminder) return false;

        this.cancelReminder(taskId);
        
        const newReminderTime = new Date(Date.now() + (snoozeMinutes * 60 * 1000));
        const task = reminder.task;
        
        // Update task due time to reflect snooze
        const snoozedTask = {
            ...task,
            dueDate: newReminderTime.toISOString().split('T')[0],
            dueTime: newReminderTime.toTimeString().slice(0, 5)
        };

        return this.scheduleReminder(taskId, snoozedTask, 0);
    }

    showUpcomingTasksNotification() {
        if (!localStorageManager) return;

        const tasks = localStorageManager.getTasks();
        const now = new Date();
        const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

        const upcomingTasks = tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate <= in24Hours && dueDate >= now;
        });

        if (upcomingTasks.length > 0) {
            const taskTitles = upcomingTasks.slice(0, 3).map(task => task.title).join(', ');
            const moreCount = upcomingTasks.length > 3 ? ` and ${upcomingTasks.length - 3} more` : '';
            
            this.showNotification(
                `📚 ${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due soon`,
                {
                    body: `${taskTitles}${moreCount}`,
                    tag: 'upcoming-tasks',
                    onClick: () => {
                        window.location.href = 'dashboard.html';
                    }
                }
            );
        }
    }

    showDailyProgressNotification() {
        if (!localStorageManager) return;

        const stats = localStorageManager.getTaskStats();
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        let message = '';
        let emoji = '';

        if (completionRate >= 80) {
            emoji = '🎉';
            message = `Great job! You've completed ${completionRate}% of your tasks.`;
        } else if (completionRate >= 50) {
            emoji = '💪';
            message = `Keep going! You're ${completionRate}% done with your tasks.`;
        } else {
            emoji = '🚀';
            message = `Let's boost productivity! ${stats.pending} tasks remaining.`;
        }

        this.showNotification(
            `${emoji} Daily Progress Update`,
            {
                body: message,
                tag: 'daily-progress',
                onClick: () => {
                    window.location.href = 'analytics.html';
                }
            }
        );
    }

    showMotivationalNotification() {
        const motivationalMessages = [
            "🌟 You're doing great! Keep up the excellent work!",
            "📚 Every small step counts towards your goals!",
            "💡 Focus on progress, not perfection!",
            "🎯 You're closer to your goals than you think!",
            "🔥 Stay consistent, success is on the way!",
            "⭐ Believe in yourself - you've got this!",
            "🌈 Turn your dreams into plans, and plans into reality!",
            "🚀 Your future self will thank you for today's efforts!"
        ];

        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        
        this.showNotification(
            "Daily Motivation",
            {
                body: randomMessage,
                tag: 'daily-motivation',
                icon: '/favicon.ico'
            }
        );
    }

    playNotificationSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => {
                // Fallback to system sound or vibration
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                }
            });
        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    // Storage management
    saveReminders() {
        const remindersData = Array.from(this.reminders.entries()).map(([taskId, reminder]) => ({
            taskId,
            reminderTime: reminder.reminderTime,
            reminderMinutes: reminder.reminderMinutes,
            task: reminder.task
        }));
        
        localStorage.setItem('auraplan_reminders', JSON.stringify(remindersData));
    }

    loadReminders() {
        try {
            const remindersData = localStorage.getItem('auraplan_reminders');
            if (!remindersData) return;

            const reminders = JSON.parse(remindersData);
            const now = new Date();

            reminders.forEach(reminderData => {
                const reminderTime = new Date(reminderData.reminderTime);
                
                if (reminderTime > now) {
                    // Re-schedule reminder
                    const timeoutId = setTimeout(() => {
                        this.showTaskReminder(reminderData.task);
                        this.reminders.delete(reminderData.taskId);
                        this.saveReminders();
                    }, reminderTime.getTime() - now.getTime());

                    this.reminders.set(reminderData.taskId, {
                        ...reminderData,
                        timeoutId
                    });
                }
            });
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    }

    // Notification scheduling
    scheduleDailyNotifications() {
        // Schedule daily progress notification (8 PM)
        const now = new Date();
        const dailyTime = new Date();
        dailyTime.setHours(20, 0, 0, 0);
        
        if (dailyTime <= now) {
            dailyTime.setDate(dailyTime.getDate() + 1);
        }

        setTimeout(() => {
            this.showDailyProgressNotification();
            // Schedule for next day
            setInterval(() => {
                this.showDailyProgressNotification();
            }, 24 * 60 * 60 * 1000);
        }, dailyTime.getTime() - now.getTime());

        // Schedule upcoming tasks check (every 4 hours)
        setInterval(() => {
            this.showUpcomingTasksNotification();
        }, 4 * 60 * 60 * 1000);

        // Schedule motivational message (once a day at 9 AM)
        const motivationTime = new Date();
        motivationTime.setHours(9, 0, 0, 0);
        
        if (motivationTime <= now) {
            motivationTime.setDate(motivationTime.getDate() + 1);
        }

        setTimeout(() => {
            this.showMotivationalNotification();
            // Schedule for next day
            setInterval(() => {
                this.showMotivationalNotification();
            }, 24 * 60 * 60 * 1000);
        }, motivationTime.getTime() - now.getTime());
    }

    // Public API
    isSupported() {
        return 'Notification' in window;
    }

    getPermissionStatus() {
        return this.permission;
    }

    clearAllReminders() {
        this.reminders.forEach((reminder) => {
            clearTimeout(reminder.timeoutId);
        });
        this.reminders.clear();
        localStorage.removeItem('auraplan_reminders');
    }

    getActiveReminders() {
        return Array.from(this.reminders.values()).map(reminder => ({
            taskId: reminder.taskId,
            reminderTime: reminder.reminderTime,
            task: reminder.task
        }));
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.NotificationManager = NotificationManager;
    window.notificationManager = notificationManager;
}