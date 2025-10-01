// Local Storage Manager
class LocalStorageManager {
    constructor() {
        this.TASKS_KEY = 'auraplan_tasks';
        this.GOALS_KEY = 'auraplan_goals';
        this.SETTINGS_KEY = 'auraplan_settings';
        this.SYNC_KEY = 'auraplan_sync_status';
    }

    // Task Management
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
            this.updateSyncStatus();
            return true;
        } catch (error) {
            console.error('Error saving tasks to local storage:', error);
            return false;
        }
    }

    getTasks() {
        try {
            const tasks = localStorage.getItem(this.TASKS_KEY);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks from local storage:', error);
            return [];
        }
    }

    addTask(task) {
        const tasks = this.getTasks();
        const newTask = {
            id: this.generateId(),
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        this.saveTasks(tasks);
        return newTask;
    }

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks(tasks);
            return tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        this.saveTasks(filteredTasks);
        return true;
    }

    // Goal Management
    saveGoals(goals) {
        try {
            localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
            this.updateSyncStatus();
            return true;
        } catch (error) {
            console.error('Error saving goals to local storage:', error);
            return false;
        }
    }

    getGoals() {
        try {
            const goals = localStorage.getItem(this.GOALS_KEY);
            return goals ? JSON.parse(goals) : [];
        } catch (error) {
            console.error('Error loading goals from local storage:', error);
            return [];
        }
    }

    addGoal(goal) {
        const goals = this.getGoals();
        const newGoal = {
            id: this.generateId(),
            ...goal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        goals.push(newGoal);
        this.saveGoals(goals);
        return newGoal;
    }

    updateGoal(goalId, updates) {
        const goals = this.getGoals();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);
        if (goalIndex !== -1) {
            goals[goalIndex] = {
                ...goals[goalIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveGoals(goals);
            return goals[goalIndex];
        }
        return null;
    }

    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filteredGoals = goals.filter(goal => goal.id !== goalId);
        this.saveGoals(filteredGoals);
        return true;
    }

    // Settings Management
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            notifications: {
                enabled: true,
                email: false,
                push: true,
                sound: true
            },
            reminders: {
                defaultTime: 30,
                autoSnooze: false
            },
            calendar: {
                defaultView: 'month',
                weekStartsOn: 1, // Monday
                workingHours: { start: 9, end: 17 }
            }
        };
    }

    // Sync Management
    updateSyncStatus() {
        const syncStatus = {
            lastSync: new Date().toISOString(),
            pendingSync: !navigator.onLine
        };
        localStorage.setItem(this.SYNC_KEY, JSON.stringify(syncStatus));
    }

    getSyncStatus() {
        try {
            const syncStatus = localStorage.getItem(this.SYNC_KEY);
            return syncStatus ? JSON.parse(syncStatus) : { lastSync: null, pendingSync: false };
        } catch (error) {
            return { lastSync: null, pendingSync: false };
        }
    }

    // Offline Support
    isOnline() {
        return navigator.onLine;
    }

    // Data Export/Import
    exportData() {
        return {
            tasks: this.getTasks(),
            goals: this.getGoals(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.tasks) {
                this.saveTasks(data.tasks);
            }
            if (data.goals) {
                this.saveGoals(data.goals);
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    clearAllData() {
        localStorage.removeItem(this.TASKS_KEY);
        localStorage.removeItem(this.GOALS_KEY);
        localStorage.removeItem(this.SETTINGS_KEY);
        localStorage.removeItem(this.SYNC_KEY);
    }

    // Search and Filter
    searchTasks(query) {
        const tasks = this.getTasks();
        const lowercaseQuery = query.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(lowercaseQuery) ||
            (task.description && task.description.toLowerCase().includes(lowercaseQuery)) ||
            (task.category && task.category.toLowerCase().includes(lowercaseQuery))
        );
    }

    getTasksByDateRange(startDate, endDate) {
        const tasks = this.getTasks();
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
        });
    }

    getTasksByPriority(priority) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.priority === priority);
    }

    getTasksByCategory(category) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.category === category);
    }

    getCompletedTasks() {
        const tasks = this.getTasks();
        return tasks.filter(task => task.completed);
    }

    getPendingTasks() {
        const tasks = this.getTasks();
        return tasks.filter(task => !task.completed);
    }

    getOverdueTasks() {
        const tasks = this.getTasks();
        const now = new Date();
        return tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            return new Date(task.dueDate) < now;
        });
    }

    // Analytics Data
    getTaskStats() {
        const tasks = this.getTasks();
        const completed = tasks.filter(task => task.completed).length;
        const pending = tasks.length - completed;
        const overdue = this.getOverdueTasks().length;
        
        const priorityStats = {
            high: tasks.filter(task => task.priority === 'high').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            low: tasks.filter(task => task.priority === 'low').length
        };

        const categoryStats = tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});

        return {
            total: tasks.length,
            completed,
            pending,
            overdue,
            priorityStats,
            categoryStats
        };
    }

    getProgressData(days = 30) {
        const tasks = this.getTasks();
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const progressData = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayTasks = tasks.filter(task => {
                const taskDate = task.completedAt ? new Date(task.completedAt) : null;
                return taskDate && taskDate.toISOString().split('T')[0] === dateStr;
            });

            progressData.push({
                date: dateStr,
                completed: dayTasks.length,
                total: tasks.filter(task => {
                    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                    return dueDate && dueDate.toISOString().split('T')[0] === dateStr;
                }).length
            });
        }

        return progressData;
    }
}

// Initialize and export
const localStorageManager = new LocalStorageManager();

// Sync with Firebase when online
class DataSyncManager {
    constructor(localStorageManager, firebaseAuth, firebaseFirestore) {
        this.localStorage = localStorageManager;
        this.auth = firebaseAuth;
        this.db = firebaseFirestore;
        this.syncInProgress = false;
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.syncWhenOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    async syncWhenOnline() {
        if (!this.auth.currentUser || this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            await this.syncToCloud();
            await this.syncFromCloud();
            this.localStorage.updateSyncStatus();
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncToCloud() {
        if (!this.auth.currentUser) return;
        
        const localTasks = this.localStorage.getTasks();
        const localGoals = this.localStorage.getGoals();

        // Sync tasks
        for (const task of localTasks) {
            if (task.id && !task.synced) {
                await this.db.collection('tasks').doc(task.id).set({
                    ...task,
                    uid: this.auth.currentUser.uid,
                    synced: true
                });
                this.localStorage.updateTask(task.id, { synced: true });
            }
        }

        // Sync goals
        for (const goal of localGoals) {
            if (goal.id && !goal.synced) {
                await this.db.collection('goals').doc(goal.id).set({
                    ...goal,
                    uid: this.auth.currentUser.uid,
                    synced: true
                });
                this.localStorage.updateGoal(goal.id, { synced: true });
            }
        }
    }

    async syncFromCloud() {
        if (!this.auth.currentUser) return;

        // Sync tasks from cloud
        const tasksSnapshot = await this.db.collection('tasks')
            .where('uid', '==', this.auth.currentUser.uid)
            .get();

        const cloudTasks = [];
        tasksSnapshot.forEach(doc => {
            cloudTasks.push({ id: doc.id, ...doc.data() });
        });

        // Sync goals from cloud
        const goalsSnapshot = await this.db.collection('goals')
            .where('uid', '==', this.auth.currentUser.uid)
            .get();

        const cloudGoals = [];
        goalsSnapshot.forEach(doc => {
            cloudGoals.push({ id: doc.id, ...doc.data() });
        });

        // Merge with local data (cloud takes precedence for conflicts)
        this.localStorage.saveTasks(cloudTasks);
        this.localStorage.saveGoals(cloudGoals);
    }

    handleOffline() {
        console.log('App is offline. Data will be saved locally and synced when online.');
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LocalStorageManager = LocalStorageManager;
    window.DataSyncManager = DataSyncManager;
    window.localStorageManager = localStorageManager;
}