let currentUser;
let taskModal;
let taskForm;
let dataSyncManager;

document.addEventListener('DOMContentLoaded', () => {
    const userEmail = document.getElementById('user-email');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Show loading overlay at the very beginning
    loadingOverlay.style.display = 'flex';

    taskModal = document.getElementById('task-modal');
    taskForm = document.getElementById('task-form');

    // Initialize data sync manager
    dataSyncManager = new DataSyncManager(localStorageManager, auth, db);

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            if (user.displayName) {
                userEmail.textContent = user.displayName;
            } else if (user.isAnonymous) {
                userEmail.textContent = 'Guest';
            } else {
                userEmail.textContent = user.email;
            }
            initDashboard();
        } else {
            // Check for guest mode from localStorage
            const guestMode = localStorage.getItem('guestMode');
            const guestUser = localStorage.getItem('guestUser');
            const trialUser = localStorage.getItem('trialUser');
            
            if (guestMode === 'true' && guestUser) {
                // Use guest user data
                currentUser = JSON.parse(guestUser);
                
                // Set display name based on user type
                if (trialUser === 'true') {
                    userEmail.textContent = 'Trial User';
                    // Add trial indicator
                    const trialBadge = document.createElement('span');
                    trialBadge.className = 'trial-badge';
                    trialBadge.innerHTML = '<i class="fas fa-star"></i> Free Trial';
                    trialBadge.style.cssText = `
                        background: linear-gradient(135deg, #F59E0B, #D97706);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        margin-left: 8px;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                    `;
                    userEmail.appendChild(trialBadge);
                } else {
                    userEmail.textContent = 'Guest User';
                }
                
                initDashboard();
            } else {
                // Use local storage for offline mode
                currentUser = { uid: 'offline_user', isAnonymous: true };
                userEmail.textContent = 'Offline Mode';
                initDashboard();
            }
        }
    });

    function initDashboard() {
        getTasks();
        AOS.init();
        
        // Schedule daily notifications
        if (notificationManager) {
            notificationManager.scheduleDailyNotifications();
        }
        
        // Show welcome message for new users
        showWelcomeMessage();
    }
    
    function showWelcomeMessage() {
        const isNewUser = !localStorage.getItem('hasVisitedDashboard');
        const trialUser = localStorage.getItem('trialUser');
        
        if (isNewUser) {
            localStorage.setItem('hasVisitedDashboard', 'true');
            
            // Create welcome notification
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'welcome-notification';
            welcomeMessage.innerHTML = `
                <div class="welcome-content">
                    <div class="welcome-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <div class="welcome-text">
                        <h3>Welcome to AuraPlan! 🎉</h3>
                        <p>${trialUser === 'true' ? 
                            'Your free trial has started! Explore all features and create your first study plan.' : 
                            'Welcome! Start by creating your first task or goal to get organized.'
                        }</p>
                    </div>
                    <button class="welcome-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            welcomeMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4F46E5, #7C3AED);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                max-width: 350px;
                animation: slideInRight 0.5s ease-out;
            `;
            
            // Add animation keyframes
            if (!document.querySelector('#welcome-animations')) {
                const style = document.createElement('style');
                style.id = 'welcome-animations';
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .welcome-content {
                        display: flex;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    .welcome-icon {
                        font-size: 24px;
                        margin-top: 5px;
                    }
                    .welcome-text h3 {
                        margin: 0 0 8px 0;
                        font-size: 18px;
                    }
                    .welcome-text p {
                        margin: 0;
                        font-size: 14px;
                        opacity: 0.9;
                        line-height: 1.4;
                    }
                    .welcome-close {
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        padding: 5px;
                        border-radius: 4px;
                        opacity: 0.7;
                        transition: opacity 0.2s;
                    }
                    .welcome-close:hover {
                        opacity: 1;
                        background: rgba(255, 255, 255, 0.1);
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(welcomeMessage);
            
            // Auto-remove after 8 seconds
            setTimeout(() => {
                if (welcomeMessage.parentElement) {
                    welcomeMessage.style.animation = 'slideInRight 0.5s ease-out reverse';
                    setTimeout(() => welcomeMessage.remove(), 500);
                }
            }, 8000);
        }
    }

    // Moved inside DOMContentLoaded
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTask();
        });
    }

    const filterButtons = document.querySelector('.filter-buttons');
    if (filterButtons) {
        filterButtons.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                filterTasks();
            }
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterTasks);
    }
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}



function openTaskModal() {
    console.log('openTaskModal called');
    taskModal.style.display = 'flex';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
}



function addTask() {
    console.log('Adding task...');
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskPriority = document.getElementById('task-priority').value;
    const taskDueDate = document.getElementById('task-due-date').value;
    const taskDueTime = document.getElementById('task-due-time') ? document.getElementById('task-due-time').value : '';
    const taskReminder = document.getElementById('task-reminder') ? document.getElementById('task-reminder').value : 'none';
    const taskCategory = document.getElementById('task-category') ? document.getElementById('task-category').value : 'study';

    if (!taskTitle) {
        alert('Please enter a task title.');
        return;
    }

    const taskData = {
        uid: currentUser.uid,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        reminder: taskReminder,
        completed: false,
        createdAt: new Date().toISOString()
    };

    console.log('Task data:', taskData);

    // Add to local storage
    const newTask = localStorageManager.addTask(taskData);
    
    // Schedule reminder if specified
    if (taskReminder && taskReminder !== 'none' && notificationManager) {
        notificationManager.scheduleReminder(newTask.id, newTask, parseInt(taskReminder));
    }

    // Sync with Firebase if online and authenticated
    if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
        db.collection('tasks').doc(newTask.id).set({
            ...newTask,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error('Error syncing with Firebase:', error);
        });
    }

    // Show success notification
    if (notificationManager) {
        notificationManager.showNotification('Task Added', {
            body: `"${taskTitle}" has been added to your tasks`,
            tag: 'task-added'
        });
    }

    closeTaskModal();
    taskForm.reset();
    getTasks();
}

function getTasks() {
    const taskList = document.getElementById('task-list');
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    // Load from local storage first
    let tasks = localStorageManager.getTasks();
    renderTasks(tasks);
    updateStats(tasks);
    loadingOverlay.style.display = 'none';

    // Sync with Firebase if online and authenticated
    if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
        db.collection('tasks').where('uid', '==', currentUser.uid).orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            let firebaseTasks = [];
            snapshot.forEach(doc => {
                firebaseTasks.push({ id: doc.id, ...doc.data() });
            });
            
            // Update local storage with Firebase data
            localStorageManager.saveTasks(firebaseTasks);
            renderTasks(firebaseTasks);
            updateStats(firebaseTasks);
        }, error => {
            console.error('Error fetching from Firebase:', error);
            // Continue with local data if Firebase fails
        });
    }
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item', task.priority);
        if (task.completed) {
            taskElement.classList.add('completed');
        }

        taskElement.innerHTML = `
            <div class="task-info">
                <input type="checkbox" onchange="updateTaskStatus('${task.id}', ${task.completed})" ${task.completed ? 'checked' : ''}>
                <div>
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                </div>
            </div>
            <div class="task-meta">
                ${task.dueDate ? `<span class="due-date"><i class="fas fa-calendar-alt"></i> ${task.dueDate}</span>` : ''}
            </div>
            <div class="task-actions">
                <button onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

function updateTaskStatus(id, completed) {
    // Update local storage
    const updatedTask = localStorageManager.updateTask(id, { 
        completed: !completed,
        completedAt: !completed ? new Date().toISOString() : null
    });
    
    // Sync with Firebase if online
    if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
        db.collection('tasks').doc(id).update({ 
            completed: !completed,
            completedAt: !completed ? firebase.firestore.FieldValue.serverTimestamp() : null
        }).catch(error => {
            console.error('Error updating task in Firebase:', error);
        });
    }
    
    // Show notification for task completion
    if (!completed && notificationManager) {
        notificationManager.showNotification('Task Completed! 🎉', {
            body: `Great job completing "${updatedTask.title}"!`,
            tag: 'task-completed'
        });
    }
    
    // Refresh display
    getTasks();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const task = localStorageManager.getTasks().find(t => t.id === id);
        
        // Delete from local storage
        localStorageManager.deleteTask(id);
        
        // Cancel any reminders
        if (notificationManager) {
            notificationManager.cancelReminder(id);
        }
        
        // Delete from Firebase if online
        if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
            db.collection('tasks').doc(id).delete().catch(error => {
                console.error('Error deleting task from Firebase:', error);
            });
        }
        
        // Show notification
        if (notificationManager) {
            notificationManager.showNotification('Task Deleted', {
                body: `"${task.title}" has been removed`,
                tag: 'task-deleted'
            });
        }
        
        // Refresh display
        getTasks();
    }
}

function updateStats(tasks) {
    const totalTasks = document.getElementById('total-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const pendingTasks = document.getElementById('pending-tasks');

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}



function filterTasks() {
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    // Use local storage for filtering
    let tasks = localStorageManager.getTasks();
    let filteredTasks = tasks;

    if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }

    renderTasks(filteredTasks);
}

