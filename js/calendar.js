// Calendar Manager
class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.tasks = [];
        this.selectedDate = null;
        this.draggedTask = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.renderCurrentView();
        this.updateCurrentDateDisplay();
    }

    setupEventListeners() {
        // View switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Navigation
        document.getElementById('prev-btn').addEventListener('click', () => this.navigatePrevious());
        document.getElementById('next-btn').addEventListener('click', () => this.navigateNext());
        document.querySelector('.today-btn').addEventListener('click', () => this.goToToday());

        // Quick add form
        document.getElementById('quick-task-title').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.quickAddTask();
            }
        });

        // Task form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }
    }

    loadTasks() {
        // Load from local storage first
        this.tasks = localStorageManager.getTasks();
        
        // Sync with Firebase if online and user is authenticated
        if (navigator.onLine && auth.currentUser) {
            this.syncWithFirebase();
        }
    }

    async syncWithFirebase() {
        try {
            const snapshot = await db.collection('tasks')
                .where('uid', '==', auth.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const firebaseTasks = [];
            snapshot.forEach(doc => {
                firebaseTasks.push({ id: doc.id, ...doc.data() });
            });

            // Merge with local tasks
            this.tasks = firebaseTasks;
            localStorageManager.saveTasks(this.tasks);
            this.renderCurrentView();
        } catch (error) {
            console.error('Error syncing with Firebase:', error);
        }
    }

    switchView(view) {
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update active view
        document.querySelectorAll('.calendar-view').forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.id === `${view}-view`);
        });

        this.currentView = view;
        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'timeline':
                this.renderTimelineView();
                break;
        }
    }

    renderMonthView() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            grid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(date);
            grid.appendChild(dayElement);
        }
    }

    createDayElement(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const isToday = this.isSameDay(date, new Date());
        const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
        
        if (isToday) dayElement.classList.add('today');
        if (!isCurrentMonth) dayElement.classList.add('other-month');

        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        // Tasks for this day
        const dayTasks = this.getTasksForDate(date);
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'day-tasks';

        dayTasks.slice(0, 3).forEach(task => {
            const taskChip = document.createElement('div');
            taskChip.className = `task-chip ${task.priority}`;
            if (task.completed) taskChip.classList.add('completed');
            taskChip.textContent = task.title;
            taskChip.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTaskDetails(task);
            });
            tasksContainer.appendChild(taskChip);
        });

        if (dayTasks.length > 3) {
            const moreChip = document.createElement('div');
            moreChip.className = 'task-chip more';
            moreChip.textContent = `+${dayTasks.length - 3} more`;
            tasksContainer.appendChild(moreChip);
        }

        dayElement.appendChild(tasksContainer);

        // Click handler for day
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });

        return dayElement;
    }

    renderWeekView() {
        const weekDaysHeader = document.getElementById('week-days-header');
        const weekGrid = document.getElementById('week-grid');
        
        weekDaysHeader.innerHTML = '';
        weekGrid.innerHTML = '';

        // Get week dates
        const weekStart = this.getWeekStart(this.currentDate);
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            weekDates.push(date);
        }

        // Render week headers
        weekDates.forEach(date => {
            const header = document.createElement('div');
            header.className = 'week-day-header';
            if (this.isSameDay(date, new Date())) {
                header.classList.add('today');
            }
            header.innerHTML = `
                <div>${date.toLocaleDateString('en', { weekday: 'short' })}</div>
                <div>${date.getDate()}</div>
            `;
            weekDaysHeader.appendChild(header);
        });

        // Create time column
        const timeColumn = document.createElement('div');
        timeColumn.className = 'week-time-column';
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeColumn.appendChild(timeSlot);
        }
        weekGrid.appendChild(timeColumn);

        // Create days columns
        const daysContainer = document.createElement('div');
        daysContainer.className = 'week-days';
        
        weekDates.forEach((date, dayIndex) => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'week-day';

            // Create hour slots
            for (let hour = 0; hour < 24; hour++) {
                const hourSlot = document.createElement('div');
                hourSlot.className = 'week-hour-slot';
                hourSlot.dataset.hour = hour;
                hourSlot.dataset.date = date.toISOString().split('T')[0];
                
                // Add click handler for creating tasks
                hourSlot.addEventListener('click', () => {
                    this.createTaskAtTime(date, hour);
                });

                dayColumn.appendChild(hourSlot);
            }

            // Add tasks for this day
            const dayTasks = this.getTasksForDate(date);
            dayTasks.forEach(task => {
                if (task.dueTime) {
                    const taskElement = this.createWeekTaskElement(task);
                    dayColumn.appendChild(taskElement);
                }
            });

            daysContainer.appendChild(dayColumn);
        });

        weekGrid.appendChild(daysContainer);
    }

    createWeekTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `week-task ${task.priority}`;
        if (task.completed) taskElement.classList.add('completed');
        
        const [hours, minutes] = task.dueTime.split(':');
        const hour = parseInt(hours);
        const duration = task.duration || 1; // Default 1 hour
        
        taskElement.style.top = `${hour * 60}px`;
        taskElement.style.height = `${duration * 60}px`;
        taskElement.textContent = task.title;
        
        // Make draggable
        taskElement.draggable = true;
        taskElement.addEventListener('dragstart', (e) => {
            this.draggedTask = task;
        });
        
        taskElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTaskDetails(task);
        });

        return taskElement;
    }

    renderTimelineView() {
        const timelineContent = document.getElementById('timeline-content');
        timelineContent.innerHTML = '';

        // Create timeline line
        const timelineLine = document.createElement('div');
        timelineLine.className = 'timeline-line';
        timelineContent.appendChild(timelineLine);

        // Get tasks sorted by date
        const sortedTasks = this.tasks
            .filter(task => task.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        sortedTasks.forEach(task => {
            const timelineItem = this.createTimelineItem(task);
            timelineContent.appendChild(timelineItem);
        });

        if (sortedTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <h3>No scheduled tasks</h3>
                <p>Add some tasks with due dates to see your timeline</p>
            `;
            timelineContent.appendChild(emptyState);
        }
    }

    createTimelineItem(task) {
        const item = document.createElement('div');
        item.className = `timeline-item ${task.priority}`;
        if (task.completed) item.classList.add('completed');

        const dueDate = new Date(task.dueDate);
        const timeString = task.dueTime ? ` at ${task.dueTime}` : '';

        item.innerHTML = `
            <div class="timeline-date">
                ${dueDate.toLocaleDateString('en', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })}${timeString}
            </div>
            <div class="timeline-task-title">${task.title}</div>
            <div class="timeline-task-description">${task.description || ''}</div>
            <div class="timeline-task-meta">
                <span class="timeline-task-category">${task.category || 'General'}</span>
                <span class="timeline-task-priority">Priority: ${task.priority}</span>
            </div>
        `;

        item.addEventListener('click', () => {
            this.showTaskDetails(task);
        });

        return item;
    }

    // Navigation methods
    navigatePrevious() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                break;
            case 'timeline':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
        }
        this.renderCurrentView();
        this.updateCurrentDateDisplay();
    }

    navigateNext() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                break;
            case 'timeline':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
        }
        this.renderCurrentView();
        this.updateCurrentDateDisplay();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCurrentView();
        this.updateCurrentDateDisplay();
    }

    updateCurrentDateDisplay() {
        const currentDateEl = document.getElementById('current-date');
        let dateString = '';

        switch (this.currentView) {
            case 'month':
                dateString = this.currentDate.toLocaleDateString('en', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                break;
            case 'week':
                const weekStart = this.getWeekStart(this.currentDate);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                dateString = `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                break;
            case 'timeline':
                dateString = this.currentDate.toLocaleDateString('en', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                break;
        }

        currentDateEl.textContent = dateString;
    }

    // Task management
    async quickAddTask() {
        const title = document.getElementById('quick-task-title').value.trim();
        const date = document.getElementById('quick-task-date').value;
        const time = document.getElementById('quick-task-time').value;

        if (!title) return;

        const task = {
            title,
            description: '',
            priority: 'medium',
            category: 'study',
            dueDate: date || new Date().toISOString().split('T')[0],
            dueTime: time || '09:00',
            completed: false,
            reminder: 30
        };

        await this.addTask(task);

        // Clear form
        document.getElementById('quick-task-title').value = '';
        document.getElementById('quick-task-date').value = '';
        document.getElementById('quick-task-time').value = '';
    }

    async saveTask() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const dueDate = document.getElementById('task-due-date').value;
        const dueTime = document.getElementById('task-due-time').value;
        const reminder = parseInt(document.getElementById('task-reminder').value);

        if (!title) {
            alert('Please enter a task title.');
            return;
        }

        const task = {
            title,
            description,
            priority,
            category,
            dueDate,
            dueTime,
            completed: false,
            reminder
        };

        await this.addTask(task);
        this.closeTaskModal();
    }

    async addTask(taskData) {
        try {
            // Add to local storage
            const task = localStorageManager.addTask(taskData);
            
            // Schedule reminder if specified
            if (task.reminder && task.reminder !== 'none') {
                notificationManager.scheduleReminder(task.id, task, parseInt(task.reminder));
            }

            // Sync with Firebase if online
            if (navigator.onLine && auth.currentUser) {
                await db.collection('tasks').doc(task.id).set({
                    ...task,
                    uid: auth.currentUser.uid
                });
            }

            // Update display
            this.tasks = localStorageManager.getTasks();
            this.renderCurrentView();
            
            // Show success notification
            notificationManager.showNotification('Task Added', {
                body: `"${task.title}" has been added to your schedule`,
                tag: 'task-added'
            });

        } catch (error) {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        }
    }

    showTaskDetails(task) {
        const modal = document.getElementById('task-detail-modal');
        const body = document.getElementById('task-detail-body');

        const dueDateTime = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const timeString = task.dueTime ? ` at ${task.dueTime}` : '';

        body.innerHTML = `
            <div class="detail-section">
                <div class="detail-label">Title</div>
                <div class="detail-value">${task.title}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Description</div>
                <div class="detail-value">${task.description || 'No description'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">${dueDateTime}${timeString}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Priority</div>
                <div class="detail-value">
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Category</div>
                <div class="detail-value">
                    <span class="category-badge">${task.category || 'General'}</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Status</div>
                <div class="detail-value">${task.completed ? '✅ Completed' : '⏳ Pending'}</div>
            </div>
            <div class="task-actions-detail">
                <button class="action-btn complete-btn" onclick="calendarManager.toggleTaskCompletion('${task.id}')">
                    ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="action-btn edit-btn" onclick="calendarManager.editTask('${task.id}')">
                    Edit Task
                </button>
                <button class="action-btn delete-btn" onclick="calendarManager.deleteTask('${task.id}')">
                    Delete Task
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    async toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null
        };

        // Update local storage
        localStorageManager.updateTask(taskId, updatedTask);

        // Update Firebase if online
        if (navigator.onLine && auth.currentUser) {
            await db.collection('tasks').doc(taskId).update(updatedTask);
        }

        // Update display
        this.tasks = localStorageManager.getTasks();
        this.renderCurrentView();
        this.closeTaskDetailModal();

        // Show notification
        const message = updatedTask.completed ? 'Task completed! 🎉' : 'Task marked as incomplete';
        notificationManager.showNotification(message, {
            body: `"${task.title}"`,
            tag: 'task-updated'
        });
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const task = this.tasks.find(t => t.id === taskId);
        
        // Remove from local storage
        localStorageManager.deleteTask(taskId);

        // Remove from Firebase if online
        if (navigator.onLine && auth.currentUser) {
            await db.collection('tasks').doc(taskId).delete();
        }

        // Cancel any reminders
        notificationManager.cancelReminder(taskId);

        // Update display
        this.tasks = localStorageManager.getTasks();
        this.renderCurrentView();
        this.closeTaskDetailModal();

        // Show notification
        notificationManager.showNotification('Task Deleted', {
            body: `"${task.title}" has been removed`,
            tag: 'task-deleted'
        });
    }

    // Utility methods
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    getWeekStart(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day;
        return new Date(start.setDate(diff));
    }

    getTasksForDate(date) {
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return this.isSameDay(taskDate, date);
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        // Open task modal with pre-filled date
        document.getElementById('task-due-date').value = date.toISOString().split('T')[0];
        this.openTaskModal();
    }

    createTaskAtTime(date, hour) {
        document.getElementById('task-due-date').value = date.toISOString().split('T')[0];
        document.getElementById('task-due-time').value = `${hour.toString().padStart(2, '0')}:00`;
        this.openTaskModal();
    }

    openTaskModal() {
        document.getElementById('task-modal').style.display = 'flex';
    }

    closeTaskModal() {
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-form').reset();
    }

    closeTaskDetailModal() {
        document.getElementById('task-detail-modal').style.display = 'none';
    }
}

// Initialize calendar when DOM is loaded
let calendarManager;

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the calendar page
    if (document.getElementById('calendar-grid')) {
        calendarManager = new CalendarManager();
    }
});

// Global functions for modal interactions
function openTaskModal() {
    if (calendarManager) {
        calendarManager.openTaskModal();
    }
}

function closeTaskModal() {
    if (calendarManager) {
        calendarManager.closeTaskModal();
    }
}

function closeTaskDetailModal() {
    if (calendarManager) {
        calendarManager.closeTaskDetailModal();
    }
}

function quickAddTask() {
    if (calendarManager) {
        calendarManager.quickAddTask();
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}