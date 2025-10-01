// Analytics Manager
class AnalyticsManager {
    constructor() {
        this.tasks = [];
        this.goals = [];
        this.currentTimeframe = 'week';
        this.chartInstances = {};
        this.insights = [];
        this.achievements = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.initializeCharts();
        this.generateInsights();
        this.updateMetrics();
    }

    setupEventListeners() {
        // Timeframe selector
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTimeframe(e.target.dataset.timeframe);
            });
        });

        // Export button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Achievement modal close
        const closeBtn = document.querySelector('.close-achievement-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAchievementModal());
        }
    }

    loadData() {
        // Load from local storage
        this.tasks = localStorageManager.getTasks();
        this.goals = localStorageManager.getGoals();
        
        // Sync with Firebase if online
        if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
            this.syncWithFirebase();
        }
    }

    async syncWithFirebase() {
        try {
            // Get tasks and goals from Firebase
            const [tasksSnapshot, goalsSnapshot] = await Promise.all([
                db.collection('tasks').where('uid', '==', auth.currentUser.uid).get(),
                db.collection('goals').where('uid', '==', auth.currentUser.uid).get()
            ]);

            const firebaseTasks = [];
            tasksSnapshot.forEach(doc => {
                firebaseTasks.push({ id: doc.id, ...doc.data() });
            });

            const firebaseGoals = [];
            goalsSnapshot.forEach(doc => {
                firebaseGoals.push({ id: doc.id, ...doc.data() });
            });

            this.tasks = firebaseTasks;
            this.goals = firebaseGoals;

            this.updateAllCharts();
            this.generateInsights();
            this.updateMetrics();
        } catch (error) {
            console.error('Error syncing analytics data:', error);
        }
    }

    switchTimeframe(timeframe) {
        // Update active button
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
        });

        this.currentTimeframe = timeframe;
        this.updateAllCharts();
        this.generateInsights();
        this.updateMetrics();
    }

    initializeCharts() {
        this.createProductivityChart();
        this.createTasksChart();
        this.createGoalsChart();
        this.createCategoryChart();
        this.createHeatmapChart();
        this.createProgressChart();
    }

    createProductivityChart() {
        const ctx = document.getElementById('productivity-chart')?.getContext('2d');
        if (!ctx) return;

        const data = this.getProductivityData();
        
        this.chartInstances.productivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Tasks Completed',
                    data: data.completed,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Study Hours',
                    data: data.studyHours,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Tasks Completed'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Study Hours'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    createTasksChart() {
        const ctx = document.getElementById('tasks-chart')?.getContext('2d');
        if (!ctx) return;

        const data = this.getTasksData();
        
        this.chartInstances.tasks = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                datasets: [{
                    data: [data.completed, data.inProgress, data.pending, data.overdue],
                    backgroundColor: ['#4CAF50', '#FF9800', '#9E9E9E', '#F44336'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    createGoalsChart() {
        const ctx = document.getElementById('goals-chart')?.getContext('2d');
        if (!ctx) return;

        const data = this.getGoalsData();
        
        this.chartInstances.goals = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Progress %',
                    data: data.progress,
                    backgroundColor: data.progress.map(p => 
                        p >= 100 ? '#4CAF50' : 
                        p >= 75 ? '#FF9800' : 
                        p >= 50 ? '#2196F3' : '#F44336'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Progress (%)'
                        }
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('category-chart')?.getContext('2d');
        if (!ctx) return;

        const data = this.getCategoryData();
        
        this.chartInstances.category = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    createHeatmapChart() {
        const canvas = document.getElementById('heatmap-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.getHeatmapData();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw heatmap
        const cellWidth = canvas.width / 7; // 7 days
        const cellHeight = canvas.height / 24; // 24 hours
        
        data.forEach(day => {
            day.hours.forEach((intensity, hour) => {
                const x = day.dayOfWeek * cellWidth;
                const y = hour * cellHeight;
                
                // Color based on intensity (0-1)
                const alpha = intensity;
                ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
                ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
            });
        });
    }

    createProgressChart() {
        const ctx = document.getElementById('progress-chart')?.getContext('2d');
        if (!ctx) return;

        const data = this.getProgressData();
        
        this.chartInstances.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Cumulative Progress',
                    data: data.cumulative,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Daily Tasks',
                    data: data.daily,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateAllCharts() {
        // Update all chart data
        if (this.chartInstances.productivity) {
            const data = this.getProductivityData();
            this.chartInstances.productivity.data.labels = data.labels;
            this.chartInstances.productivity.data.datasets[0].data = data.completed;
            this.chartInstances.productivity.data.datasets[1].data = data.studyHours;
            this.chartInstances.productivity.update();
        }

        if (this.chartInstances.tasks) {
            const data = this.getTasksData();
            this.chartInstances.tasks.data.datasets[0].data = [data.completed, data.inProgress, data.pending, data.overdue];
            this.chartInstances.tasks.update();
        }

        if (this.chartInstances.goals) {
            const data = this.getGoalsData();
            this.chartInstances.goals.data.labels = data.labels;
            this.chartInstances.goals.data.datasets[0].data = data.progress;
            this.chartInstances.goals.update();
        }

        if (this.chartInstances.category) {
            const data = this.getCategoryData();
            this.chartInstances.category.data.labels = data.labels;
            this.chartInstances.category.data.datasets[0].data = data.values;
            this.chartInstances.category.update();
        }

        if (this.chartInstances.progress) {
            const data = this.getProgressData();
            this.chartInstances.progress.data.labels = data.labels;
            this.chartInstances.progress.data.datasets[0].data = data.cumulative;
            this.chartInstances.progress.data.datasets[1].data = data.daily;
            this.chartInstances.progress.update();
        }

        // Update heatmap
        this.createHeatmapChart();
    }

    getProductivityData() {
        const now = new Date();
        const labels = [];
        const completed = [];
        const studyHours = [];
        
        let days = 7;
        if (this.currentTimeframe === 'month') days = 30;
        else if (this.currentTimeframe === 'year') days = 365;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Format label based on timeframe
            let label;
            if (this.currentTimeframe === 'week') {
                label = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (this.currentTimeframe === 'month') {
                label = date.getDate().toString();
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short' });
            }
            
            labels.push(label);
            
            // Count completed tasks for this date
            const tasksOnDate = this.tasks.filter(task => 
                task.completed && 
                new Date(task.completedAt).toISOString().split('T')[0] === dateStr
            );
            completed.push(tasksOnDate.length);
            
            // Calculate study hours (assuming 30 min per task)
            studyHours.push(tasksOnDate.length * 0.5);
        }

        return { labels, completed, studyHours };
    }

    getTasksData() {
        const completed = this.tasks.filter(task => task.completed).length;
        const inProgress = this.tasks.filter(task => !task.completed && task.status === 'in-progress').length;
        const overdue = this.tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length;
        const pending = this.tasks.length - completed - inProgress - overdue;

        return { completed, inProgress, pending, overdue };
    }

    getGoalsData() {
        const labels = this.goals.map(goal => goal.title.substring(0, 20) + (goal.title.length > 20 ? '...' : ''));
        const progress = this.goals.map(goal => {
            if (!goal.targetValue) return 0;
            return Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100);
        });

        return { labels, progress };
    }

    getCategoryData() {
        const categories = {};
        
        this.tasks.forEach(task => {
            const category = task.category || 'Other';
            categories[category] = (categories[category] || 0) + 1;
        });

        return {
            labels: Object.keys(categories),
            values: Object.values(categories)
        };
    }

    getHeatmapData() {
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
            const dayData = {
                dayOfWeek: i,
                hours: new Array(24).fill(0)
            };
            
            // Calculate activity for each hour
            this.tasks.forEach(task => {
                if (task.completed && task.completedAt) {
                    const completedDate = new Date(task.completedAt);
                    const dayOfWeek = completedDate.getDay();
                    const hour = completedDate.getHours();
                    
                    if (dayOfWeek === i) {
                        dayData.hours[hour] += 0.2; // Increase intensity
                    }
                }
            });
            
            // Normalize to 0-1 range
            const maxIntensity = Math.max(...dayData.hours);
            if (maxIntensity > 0) {
                dayData.hours = dayData.hours.map(h => Math.min(h / maxIntensity, 1));
            }
            
            data.push(dayData);
        }
        
        return data;
    }

    getProgressData() {
        const now = new Date();
        const labels = [];
        const daily = [];
        const cumulative = [];
        let total = 0;
        
        let days = 7;
        if (this.currentTimeframe === 'month') days = 30;
        else if (this.currentTimeframe === 'year') days = 365;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            let label;
            if (this.currentTimeframe === 'week') {
                label = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (this.currentTimeframe === 'month') {
                label = date.getDate().toString();
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short' });
            }
            
            labels.push(label);
            
            const tasksOnDate = this.tasks.filter(task => 
                task.completed && 
                new Date(task.completedAt).toISOString().split('T')[0] === dateStr
            ).length;
            
            daily.push(tasksOnDate);
            total += tasksOnDate;
            cumulative.push(total);
        }

        return { labels, daily, cumulative };
    }

    generateInsights() {
        this.insights = [];
        
        // Productivity insights
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
        
        this.insights.push({
            type: 'productivity',
            title: 'Task Completion Rate',
            value: `${completionRate}%`,
            description: `You've completed ${completedTasks} out of ${totalTasks} tasks`,
            trend: completionRate > 75 ? 'positive' : completionRate > 50 ? 'neutral' : 'negative'
        });

        // Goals insights
        const activeGoals = this.goals.filter(g => !g.completed).length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        
        if (this.goals.length > 0) {
            this.insights.push({
                type: 'goals',
                title: 'Goal Progress',
                value: `${completedGoals}/${this.goals.length}`,
                description: `${activeGoals} goals still in progress`,
                trend: completedGoals > activeGoals ? 'positive' : 'neutral'
            });
        }

        // Best performing category
        const categoryData = this.getCategoryData();
        if (categoryData.labels.length > 0) {
            const bestCategoryIndex = categoryData.values.indexOf(Math.max(...categoryData.values));
            const bestCategory = categoryData.labels[bestCategoryIndex];
            
            this.insights.push({
                type: 'category',
                title: 'Most Active Category',
                value: bestCategory,
                description: `${categoryData.values[bestCategoryIndex]} tasks completed`,
                trend: 'positive'
            });
        }

        // Streak calculation
        const streak = this.calculateStreak();
        this.insights.push({
            type: 'streak',
            title: 'Current Streak',
            value: `${streak} days`,
            description: streak > 0 ? 'Keep it up!' : 'Start your streak today!',
            trend: streak > 7 ? 'positive' : streak > 0 ? 'neutral' : 'negative'
        });

        this.renderInsights();
        this.checkAchievements();
    }

    calculateStreak() {
        const now = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const hasActivity = this.tasks.some(task => 
                task.completed && 
                new Date(task.completedAt).toISOString().split('T')[0] === dateStr
            );
            
            if (hasActivity) {
                streak++;
            } else if (i === 0) {
                // Check if today has activity, if not, streak is 0
                break;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderInsights() {
        const container = document.getElementById('insights-container');
        if (!container) return;

        container.innerHTML = this.insights.map(insight => `
            <div class="insight-card ${insight.trend}">
                <div class="insight-header">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-trend ${insight.trend}">
                        <i class="fas fa-${insight.trend === 'positive' ? 'arrow-up' : insight.trend === 'negative' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                </div>
                <div class="insight-value">${insight.value}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `).join('');
    }

    checkAchievements() {
        const newAchievements = [];
        
        // Check various achievement conditions
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const streak = this.calculateStreak();
        
        // Achievement definitions
        const achievementTypes = [
            { id: 'first_task', condition: completedTasks >= 1, title: 'First Step', description: 'Complete your first task' },
            { id: 'task_10', condition: completedTasks >= 10, title: 'Getting Started', description: 'Complete 10 tasks' },
            { id: 'task_50', condition: completedTasks >= 50, title: 'Productive', description: 'Complete 50 tasks' },
            { id: 'task_100', condition: completedTasks >= 100, title: 'Task Master', description: 'Complete 100 tasks' },
            { id: 'first_goal', condition: completedGoals >= 1, title: 'Goal Achiever', description: 'Complete your first goal' },
            { id: 'goal_5', condition: completedGoals >= 5, title: 'Goal Crusher', description: 'Complete 5 goals' },
            { id: 'streak_7', condition: streak >= 7, title: 'Week Warrior', description: 'Maintain a 7-day streak' },
            { id: 'streak_30', condition: streak >= 30, title: 'Monthly Master', description: 'Maintain a 30-day streak' }
        ];
        
        const existingAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        achievementTypes.forEach(achievement => {
            if (achievement.condition && !existingAchievements.find(a => a.id === achievement.id)) {
                newAchievements.push({
                    ...achievement,
                    unlockedAt: new Date().toISOString()
                });
            }
        });
        
        // Save new achievements
        if (newAchievements.length > 0) {
            const allAchievements = [...existingAchievements, ...newAchievements];
            localStorage.setItem('achievements', JSON.stringify(allAchievements));
            
            // Show achievement modal for the first new achievement
            this.showAchievementModal(newAchievements[0]);
        }
        
        this.achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        this.renderAchievements();
    }

    renderAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        const recentAchievements = this.achievements
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, 6);

        container.innerHTML = recentAchievements.map(achievement => `
            <div class="achievement-badge">
                <div class="achievement-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-date">
                        ${new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `).join('');

        if (recentAchievements.length === 0) {
            container.innerHTML = `
                <div class="no-achievements">
                    <i class="fas fa-trophy"></i>
                    <p>Complete tasks and goals to unlock achievements!</p>
                </div>
            `;
        }
    }

    showAchievementModal(achievement) {
        const modal = document.getElementById('achievement-modal');
        const title = document.getElementById('achievement-modal-title');
        const description = document.getElementById('achievement-modal-description');
        
        title.textContent = achievement.title;
        description.textContent = achievement.description;
        
        modal.style.display = 'flex';
        
        // Show notification
        if (notificationManager) {
            notificationManager.showNotification('Achievement Unlocked! 🏆', {
                body: `${achievement.title}: ${achievement.description}`,
                tag: 'achievement'
            });
        }
    }

    closeAchievementModal() {
        document.getElementById('achievement-modal').style.display = 'none';
    }

    updateMetrics() {
        // Update metric cards
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const streak = this.calculateStreak();
        const avgDaily = this.calculateAverageDaily();

        document.getElementById('total-tasks-metric').textContent = totalTasks;
        document.getElementById('completed-tasks-metric').textContent = completedTasks;
        document.getElementById('total-goals-metric').textContent = totalGoals;
        document.getElementById('completed-goals-metric').textContent = completedGoals;
        document.getElementById('current-streak-metric').textContent = streak;
        document.getElementById('avg-daily-metric').textContent = avgDaily.toFixed(1);
    }

    calculateAverageDaily() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) return 0;

        const days = new Set();
        completedTasks.forEach(task => {
            if (task.completedAt) {
                days.add(new Date(task.completedAt).toISOString().split('T')[0]);
            }
        });

        return days.size > 0 ? completedTasks.length / days.size : 0;
    }

    exportData() {
        const data = {
            tasks: this.tasks,
            goals: this.goals,
            achievements: this.achievements,
            exportedAt: new Date().toISOString(),
            summary: {
                totalTasks: this.tasks.length,
                completedTasks: this.tasks.filter(t => t.completed).length,
                totalGoals: this.goals.length,
                completedGoals: this.goals.filter(g => g.completed).length,
                currentStreak: this.calculateStreak(),
                averageDaily: this.calculateAverageDaily()
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `auraplan-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (notificationManager) {
            notificationManager.showNotification('Data Exported', {
                body: 'Your analytics data has been downloaded',
                tag: 'export'
            });
        }
    }
}

// Initialize analytics manager
let analyticsManager;

document.addEventListener('DOMContentLoaded', () => {
    const initAnalyticsIfReady = () => {
        // Ensure Chart.js loaded
        if (typeof Chart === 'undefined') {
            setTimeout(initAnalyticsIfReady, 100);
            return;
        }

        // Initialize immediately so offline users see UI fast
        if (!analyticsManager) {
            try {
                analyticsManager = new AnalyticsManager();
            } catch (e) {
                console.warn('Analytics init error (retrying):', e);
                setTimeout(initAnalyticsIfReady, 300);
                return;
            }
        }

        // If auth is available, re-sync once user is known
        if (typeof auth !== 'undefined' && auth.onAuthStateChanged) {
            auth.onAuthStateChanged(user => {
                if (analyticsManager && user) {
                    analyticsManager.loadData();
                    analyticsManager.updateAllCharts();
                    analyticsManager.generateInsights();
                }
            });
        }
    };

    initAnalyticsIfReady();
});

// Global functions for UI interactions
function exportData() {
    if (analyticsManager) {
        analyticsManager.exportData();
    }
}

function closeAchievementModal() {
    if (analyticsManager) {
        analyticsManager.closeAchievementModal();
    }
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}