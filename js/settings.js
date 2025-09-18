let currentUser;

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
        } else {
            window.location.href = 'login.html';
        }
    });

    // Theme switcher
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            document.body.classList.toggle('dark-mode', theme === 'dark');
            localStorage.setItem('theme', theme);
        });
    });

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    }

    // Clear all tasks
    const clearTasksBtn = document.getElementById('clear-tasks-btn');
    clearTasksBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all your tasks? This action is irreversible.')) {
            const tasksRef = db.collection('tasks').where('uid', '==', currentUser.uid);
            tasksRef.get().then(snapshot => {
                const batch = db.batch();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return batch.commit();
            }).then(() => {
                alert('All tasks have been cleared.');
            }).catch(error => {
                alert(error.message);
            });
        }
    });
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}
