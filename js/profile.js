let currentUser;

document.addEventListener('DOMContentLoaded', () => {
    const userEmail = document.getElementById('user-email');
    const displayNameInput = document.getElementById('display-name');
    const updateProfileForm = document.getElementById('update-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            if (user.displayName) {
                displayNameInput.value = user.displayName;
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Update profile
    updateProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const displayName = displayNameInput.value;

        currentUser.updateProfile({
            displayName: displayName
        }).then(() => {
            alert('Profile updated successfully!');
        }).catch(error => {
            alert(error.message);
        });
    });

    // Change password
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;

        currentUser.updatePassword(newPassword).then(() => {
            alert('Password updated successfully!');
            changePasswordForm.reset();
        }).catch(error => {
            alert(error.message);
        });
    });

    // Delete account
    deleteAccountBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
            currentUser.delete().then(() => {
                alert('Account deleted successfully.');
                window.location.href = 'index.html';
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
