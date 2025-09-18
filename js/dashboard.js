let currentUser;
let taskModal;
let taskForm;

document.addEventListener('DOMContentLoaded', () => {
    const userEmail = document.getElementById('user-email');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Show loading overlay at the very beginning
    loadingOverlay.style.display = 'flex';

    taskModal = document.getElementById('task-modal');
    taskForm = document.getElementById('task-form');

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
            // If no user, sign in anonymously for guest access
            auth.signInAnonymously().catch(error => {
                console.error("Error signing in anonymously:", error);
                alert("Failed to sign in as guest. Please try again.");
                window.location.href = 'index.html'; // Redirect back if anonymous sign-in fails
            });
        }
    });

    function initDashboard() {
        getTasks();
        AOS.init();
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

    if (!taskTitle) {
        alert('Please enter a task title.');
        return;
    }

    const taskData = {
        uid: currentUser.uid,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log('Task data:', taskData);

    db.collection('tasks').add(taskData).then(() => {
        console.log('Task added successfully!');
        closeTaskModal();
        taskForm.reset();
        getTasks();
    }).catch(error => {
        console.error('Error adding task:', error);
        alert(error.message);
    });
}

function getTasks() {
    const taskList = document.getElementById('task-list');
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    db.collection('tasks').where('uid', '==', currentUser.uid).orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        let tasks = [];
        snapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        renderTasks(tasks);
        updateStats(tasks);
        loadingOverlay.style.display = 'none';
    });
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
    db.collection('tasks').doc(id).update({ completed: !completed });
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        db.collection('tasks').doc(id).delete();
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

    db.collection('tasks').where('uid', '==', currentUser.uid).orderBy('createdAt', 'desc').get().then(snapshot => {
        let tasks = [];
        snapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        let filteredTasks = tasks;

        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(searchTerm));
        }

        renderTasks(filteredTasks);
    });
}

