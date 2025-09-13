document.addEventListener('DOMContentLoaded', () => {
    const userEmail = document.getElementById('user-email');
    const loadingOverlay = document.getElementById('loading-overlay');

    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in.
            if (user.isAnonymous) {
                userEmail.textContent = 'Guest';
            } else {
                userEmail.textContent = user.email;
            }
            // Initialize dashboard functionality
            initDashboard();
        } else {
            // User is signed out.
            window.location.href = 'login.html';
        }
    });

    function initDashboard() {
        // This is where you would initialize the task management functionality.
        // For now, we'll just hide the loading overlay.
        loadingOverlay.style.display = 'none';
        AOS.init();
    }
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}

// Modal functionality
const taskModal = document.getElementById('task-modal');

function openTaskModal() {
    taskModal.style.display = 'flex';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
}

// Placeholder for task functionality
const taskForm = document.getElementById('task-form');
if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Task functionality is not yet implemented.');
        closeTaskModal();
    });
}

const filterButtons = document.querySelector('.filter-buttons');
if (filterButtons) {
    filterButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            alert(`Filtering by ${e.target.dataset.filter} is not yet implemented.`);
        }
    });
}

function filterTasks() {
    alert('Search functionality is not yet implemented.');
}
