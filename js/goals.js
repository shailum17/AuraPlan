// Goals Manager
class GoalsManager {
    constructor() {
        this.goals = [];
        this.currentGoal = null;
        this.currentFilter = 'all';
        this.editingGoalId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGoals();
        this.renderGoals();
        this.updateOverview();
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchFilter(e.target.dataset.filter);
            });
        });

        // Search and sort
        document.getElementById('goals-search').addEventListener('input', () => this.filterAndRenderGoals());
        document.getElementById('goals-sort').addEventListener('change', () => this.filterAndRenderGoals());

        // Goal form
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGoal();
            });
        }
    }

    loadGoals() {
        // Load from local storage
        try {
            this.goals = localStorageManager ? localStorageManager.getGoals() : [];
        } catch (error) {
            console.warn('Error loading goals from local storage:', error);
            this.goals = [];
        }
        
        // Sync with Firebase if online
        if (navigator.onLine && typeof auth !== 'undefined' && auth.currentUser && !auth.currentUser.isAnonymous) {
            this.syncWithFirebase();
        }
    }

    async syncWithFirebase() {
        try {
            const snapshot = await db.collection('goals')
                .where('uid', '==', auth.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const firebaseGoals = [];
            snapshot.forEach(doc => {
                firebaseGoals.push({ id: doc.id, ...doc.data() });
            });

            // Merge with local goals
            this.goals = firebaseGoals;
            localStorageManager.saveGoals(this.goals);
            this.renderGoals();
            this.updateOverview();
        } catch (error) {
            console.error('Error syncing goals with Firebase:', error);
        }
    }

    switchFilter(filter) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        this.currentFilter = filter;
        this.filterAndRenderGoals();
    }

    filterAndRenderGoals() {
        const searchTerm = document.getElementById('goals-search').value.toLowerCase();
        const sortBy = document.getElementById('goals-sort').value;

        let filteredGoals = [...this.goals];

        // Apply filter
        switch (this.currentFilter) {
            case 'active':
                filteredGoals = filteredGoals.filter(goal => !goal.completed && !this.isOverdue(goal));
                break;
            case 'completed':
                filteredGoals = filteredGoals.filter(goal => goal.completed);
                break;
            case 'overdue':
                filteredGoals = filteredGoals.filter(goal => this.isOverdue(goal) && !goal.completed);
                break;
        }

        // Apply search
        if (searchTerm) {
            filteredGoals = filteredGoals.filter(goal => 
                goal.title.toLowerCase().includes(searchTerm) ||
                (goal.description && goal.description.toLowerCase().includes(searchTerm)) ||
                goal.category.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredGoals.sort((a, b) => {
            switch (sortBy) {
                case 'deadline':
                    return new Date(a.targetDate || '9999-12-31') - new Date(b.targetDate || '9999-12-31');
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'progress':
                    return this.calculateProgress(b) - this.calculateProgress(a);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        this.renderGoals(filteredGoals);
    }

    renderGoals(goalsToRender = null) {
        const goalsGrid = document.getElementById('goals-grid');
        const goals = goalsToRender || this.goals;

        if (goals.length === 0) {
            goalsGrid.innerHTML = `
                <div class="goals-empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>No goals yet</h3>
                    <p>Create your first goal to start tracking your progress!</p>
                    <button class="create-first-goal-btn" onclick="openGoalModal()">
                        <i class="fas fa-plus"></i>
                        Create Your First Goal
                    </button>
                </div>
            `;
            return;
        }

        goalsGrid.innerHTML = '';
        goals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            goalsGrid.appendChild(goalCard);
        });
    }

    createGoalCard(goal) {
        const card = document.createElement('div');
        const progress = this.calculateProgress(goal);
        const isOverdue = this.isOverdue(goal);
        const isCompleted = goal.completed;
        
        let statusClass = 'active';
        let statusText = 'Active';
        
        if (isCompleted) {
            statusClass = 'completed';
            statusText = 'Completed';
        } else if (isOverdue) {
            statusClass = 'overdue';
            statusText = 'Overdue';
        }

        card.className = `goal-card ${goal.priority} ${statusClass}`;
        
        const targetDate = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline';
        const daysLeft = goal.targetDate ? this.getDaysLeft(goal.targetDate) : null;
        
        card.innerHTML = `
            <div class="goal-status ${statusClass}">${statusText}</div>
            <div class="goal-header">
                <div>
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-category ${goal.category}">${goal.category}</div>
                </div>
            </div>
            <div class="goal-description">${goal.description || 'No description'}</div>
            <div class="goal-progress">
                <div class="progress-header">
                    <span class="progress-label">Progress</span>
                    <span class="progress-percentage">${Math.round(progress)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${statusClass}" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="goal-meta">
                <div class="goal-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${targetDate}${daysLeft !== null ? ` (${daysLeft} days left)` : ''}
                </div>
                <div class="goal-target">
                    <i class="fas fa-bullseye"></i>
                    ${goal.currentValue || 0} / ${goal.targetValue} ${goal.unit}
                </div>
            </div>
            <div class="goal-actions">
                <button class="goal-action-btn update-progress-btn" onclick="openProgressModal('${goal.id}')">
                    <i class="fas fa-plus"></i>
                    Update Progress
                </button>
                <button class="goal-action-btn view-details-btn" onclick="showGoalDetails('${goal.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        `;

        return card;
    }

    async saveGoal() {
        const isEditing = !!this.editingGoalId;
        const title = document.getElementById('goal-title').value.trim();
        const description = document.getElementById('goal-description').value.trim();
        const category = document.getElementById('goal-category').value;
        const priority = document.getElementById('goal-priority').value;
        const startDate = document.getElementById('goal-start-date').value;
        const targetDate = document.getElementById('goal-target-date').value;
    const rawTarget = document.getElementById('goal-target-value').value;
    const targetValue = parseInt(rawTarget, 10);
        const unit = document.getElementById('goal-unit').value;

        if (!title || isNaN(targetValue) || targetValue <= 0) {
            alert('Please fill in the required fields (title and target value).');
            return;
        }

        // Collect milestones
        const milestones = [];
        document.querySelectorAll('.milestone-input').forEach(milestoneEl => {
            const milestoneTitle = milestoneEl.querySelector('.milestone-title').value.trim();
            const milestoneDate = milestoneEl.querySelector('.milestone-date').value;
            
            if (milestoneTitle && milestoneDate) {
                milestones.push({
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    title: milestoneTitle,
                    date: milestoneDate,
                    completed: false
                });
            }
        });

        const goalData = {
            title,
            description,
            category,
            priority,
            startDate: startDate || new Date().toISOString().split('T')[0],
            targetDate,
            targetValue,
            currentValue: isEditing && this.currentGoal ? this.currentGoal.currentValue : 0,
            unit,
            milestones,
            completed: isEditing && this.currentGoal ? this.currentGoal.completed : false,
            completedAt: isEditing && this.currentGoal ? this.currentGoal.completedAt : null
        };

        try {
            let affectedGoal;
            if (isEditing && this.editingGoalId) {
                // Update existing goal
                if (localStorageManager) {
                    localStorageManager.updateGoal(this.editingGoalId, goalData);
                    affectedGoal = localStorageManager.getGoals().find(g => g.id === this.editingGoalId);
                } else if (this.currentGoal) {
                    Object.assign(this.currentGoal, goalData);
                    affectedGoal = this.currentGoal;
                }
            } else {
                // Add new goal
                if (localStorageManager) {
                    affectedGoal = localStorageManager.addGoal(goalData);
                } else {
                    affectedGoal = {
                        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                        ...goalData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    this.goals.push(affectedGoal);
                }
            }
            
            // Sync with Firebase if online
            if (navigator.onLine && typeof auth !== 'undefined' && auth.currentUser && !auth.currentUser.isAnonymous && typeof db !== 'undefined' && affectedGoal) {
                const docRef = db.collection('goals').doc(affectedGoal.id);
                if (isEditing) {
                    await docRef.update({ ...goalData, updatedAt: new Date().toISOString() });
                } else {
                    await docRef.set({
                        ...affectedGoal,
                        uid: auth.currentUser.uid
                    });
                }
            }

            // Update display
            if (localStorageManager) {
                this.goals = localStorageManager.getGoals();
            }
            this.renderGoals();
            this.updateOverview();
            this.closeGoalModal();
            
            // Show success notification
            if (typeof notificationManager !== 'undefined' && notificationManager) {
                notificationManager.showNotification(isEditing ? 'Goal Updated' : 'Goal Created', {
                    body: `"${title}" has been ${isEditing ? 'updated' : 'added to your goals'}`,
                    tag: 'goal-save'
                });
            } else {
                alert(`Goal "${title}" ${isEditing ? 'updated' : 'created'} successfully!`);
            }

        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Error saving goal. Please try again.');
        }
    }

    showGoalDetails(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const modal = document.getElementById('goal-detail-modal');
        const body = document.getElementById('goal-detail-body');

        const progress = this.calculateProgress(goal);
        const isOverdue = this.isOverdue(goal);
        const daysLeft = goal.targetDate ? this.getDaysLeft(goal.targetDate) : null;

        let milestonesHTML = '<p>No milestones set</p>';
        if (goal.milestones && goal.milestones.length > 0) {
            milestonesHTML = `
                <div class="milestone-list">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone-item ${milestone.completed ? 'completed' : (new Date(milestone.date) < new Date() ? 'overdue' : '')}">
                            <div class="milestone-info">
                                <div class="milestone-name">${milestone.title}</div>
                                <div class="milestone-date">${new Date(milestone.date).toLocaleDateString()}</div>
                            </div>
                            <div class="milestone-status ${milestone.completed ? 'completed' : (new Date(milestone.date) < new Date() ? 'overdue' : 'pending')}">
                                ${milestone.completed ? 'Completed' : (new Date(milestone.date) < new Date() ? 'Overdue' : 'Pending')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        body.innerHTML = `
            <div class="detail-section">
                <div class="detail-label">Title</div>
                <div class="detail-value">${goal.title}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Description</div>
                <div class="detail-value">${goal.description || 'No description'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Progress</div>
                <div class="detail-value">
                    <div class="goal-progress">
                        <div class="progress-header">
                            <span class="progress-percentage">${Math.round(progress)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div style="margin-top: 8px;">
                            ${goal.currentValue || 0} / ${goal.targetValue} ${goal.unit}
                        </div>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Category</div>
                <div class="detail-value">
                    <span class="category-badge">${goal.category}</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Priority</div>
                <div class="detail-value">
                    <span class="priority-badge ${goal.priority}">${goal.priority}</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Timeline</div>
                <div class="detail-value">
                    Start: ${new Date(goal.startDate).toLocaleDateString()}<br>
                    Target: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'}
                    ${daysLeft !== null ? `<br>Days left: ${daysLeft}` : ''}
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Milestones</div>
                <div class="detail-value">
                    ${milestonesHTML}
                </div>
            </div>
            <div class="task-actions-detail">
                <button class="action-btn update-progress-btn" onclick="openProgressModal('${goal.id}')">
                    Update Progress
                </button>
                <button class="action-btn edit-btn" onclick="editGoal('${goal.id}')">
                    Edit Goal
                </button>
                <button class="action-btn ${goal.completed ? 'complete-btn' : 'complete-btn'}" onclick="toggleGoalCompletion('${goal.id}')">
                    ${goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="action-btn delete-btn" onclick="deleteGoal('${goal.id}')">
                    Delete Goal
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    updateOverview() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const activeGoals = this.goals.filter(goal => !goal.completed && !this.isOverdue(goal)).length;
        const overdueGoals = this.goals.filter(goal => this.isOverdue(goal) && !goal.completed).length;

        document.getElementById('total-goals').textContent = totalGoals;
        document.getElementById('completed-goals').textContent = completedGoals;
        document.getElementById('active-goals').textContent = activeGoals;
        document.getElementById('overdue-goals').textContent = overdueGoals;
    }

    calculateProgress(goal) {
        if (!goal.targetValue || goal.targetValue === 0) return 0;
        const current = goal.currentValue || 0;
        return Math.min((current / goal.targetValue) * 100, 100);
    }

    isOverdue(goal) {
        if (!goal.targetDate || goal.completed) return false;
        return new Date(goal.targetDate) < new Date();
    }

    getDaysLeft(targetDate) {
        const target = new Date(targetDate);
        const today = new Date();
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    openGoalModal() {
        document.getElementById('goal-modal').style.display = 'flex';
        // Set default start date to today
        document.getElementById('goal-start-date').value = new Date().toISOString().split('T')[0];
    }

    closeGoalModal() {
        document.getElementById('goal-modal').style.display = 'none';
        document.getElementById('goal-form').reset();
        this.editingGoalId = null;
        this.currentGoal = null;
        const titleEl = document.getElementById('goal-modal-title');
        if (titleEl) titleEl.textContent = 'Create New Goal';
        
        // Reset milestones to single input
        const milestonesContainer = document.getElementById('milestones-container');
        milestonesContainer.innerHTML = `
            <div class="milestone-input">
                <input type="text" placeholder="Milestone 1" class="milestone-title">
                <input type="date" class="milestone-date">
                <button type="button" class="remove-milestone-btn" onclick="removeMilestone(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    closeGoalDetailModal() {
        document.getElementById('goal-detail-modal').style.display = 'none';
    }

    openProgressModal(goalId) {
        this.currentGoal = this.goals.find(g => g.id === goalId);
        if (!this.currentGoal) return;

        const modal = document.getElementById('progress-modal');
        const progressValue = document.getElementById('progress-value');
        const progressUnit = document.getElementById('progress-unit');

        progressValue.value = this.currentGoal.currentValue || 0;
        progressValue.max = this.currentGoal.targetValue;
        progressUnit.textContent = `/ ${this.currentGoal.targetValue} ${this.currentGoal.unit}`;

        modal.style.display = 'flex';
    }

    closeProgressModal() {
        document.getElementById('progress-modal').style.display = 'none';
        document.getElementById('progress-notes').value = '';
        this.currentGoal = null;
    }

    async updateProgress() {
        if (!this.currentGoal) return;

        const newValue = parseInt(document.getElementById('progress-value').value);
        const notes = document.getElementById('progress-notes').value.trim();

        if (isNaN(newValue) || newValue < 0) {
            alert('Please enter a valid progress value.');
            return;
        }

        const isCompleted = newValue >= this.currentGoal.targetValue;
        
        const updates = {
            currentValue: newValue,
            completed: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : null,
            lastUpdated: new Date().toISOString()
        };

        if (notes) {
            updates.progressNotes = [
                ...(this.currentGoal.progressNotes || []),
                {
                    date: new Date().toISOString(),
                    value: newValue,
                    notes: notes
                }
            ];
        }

        try {
            // Update local storage
            localStorageManager.updateGoal(this.currentGoal.id, updates);

            // Sync with Firebase if online
            if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
                await db.collection('goals').doc(this.currentGoal.id).update(updates);
            }

            // Update display
            this.goals = localStorageManager.getGoals();
            this.renderGoals();
            this.updateOverview();
            this.closeProgressModal();

            // Show notification
            if (notificationManager) {
                const message = isCompleted ? 'Goal Completed! 🎉' : 'Progress Updated';
                const body = isCompleted ? 
                    `Congratulations on completing "${this.currentGoal.title}"!` :
                    `Progress updated to ${newValue}/${this.currentGoal.targetValue} ${this.currentGoal.unit}`;
                
                notificationManager.showNotification(message, {
                    body: body,
                    tag: 'goal-progress'
                });
            }

        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Error updating progress. Please try again.');
        }
    }

    async toggleGoalCompletion(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const updates = {
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : null,
            currentValue: !goal.completed ? goal.targetValue : goal.currentValue
        };

        try {
            // Update local storage
            localStorageManager.updateGoal(goalId, updates);

            // Sync with Firebase if online
            if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
                await db.collection('goals').doc(goalId).update(updates);
            }

            // Update display
            this.goals = localStorageManager.getGoals();
            this.renderGoals();
            this.updateOverview();
            this.closeGoalDetailModal();

            // Show notification
            if (notificationManager) {
                const message = updates.completed ? 'Goal Completed! 🎉' : 'Goal Reopened';
                notificationManager.showNotification(message, {
                    body: `"${goal.title}" ${updates.completed ? 'completed' : 'reopened'}`,
                    tag: 'goal-status'
                });
            }

        } catch (error) {
            console.error('Error updating goal status:', error);
            alert('Error updating goal. Please try again.');
        }
    }

    async deleteGoal(goalId) {
        if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) return;

        const goal = this.goals.find(g => g.id === goalId);

        try {
            // Delete from local storage
            localStorageManager.deleteGoal(goalId);

            // Delete from Firebase if online
            if (navigator.onLine && auth.currentUser && !auth.currentUser.isAnonymous) {
                await db.collection('goals').doc(goalId).delete();
            }

            // Update display
            this.goals = localStorageManager.getGoals();
            this.renderGoals();
            this.updateOverview();
            this.closeGoalDetailModal();

            // Show notification
            if (notificationManager) {
                notificationManager.showNotification('Goal Deleted', {
                    body: `"${goal.title}" has been removed`,
                    tag: 'goal-deleted'
                });
            }

        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Error deleting goal. Please try again.');
        }
    }
}

// Initialize goals manager
let goalsManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize goals manager immediately for better UX
    goalsManager = new GoalsManager();
    
    // Also listen for auth state changes for sync
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (goalsManager && user) {
                goalsManager.syncWithFirebase();
            }
        });
    }
});

// Global functions for UI interactions
function openGoalModal() {
    if (goalsManager) {
        goalsManager.openGoalModal();
    }
}

function closeGoalModal() {
    if (goalsManager) {
        goalsManager.closeGoalModal();
    }
}

function closeGoalDetailModal() {
    if (goalsManager) {
        goalsManager.closeGoalDetailModal();
    }
}

function showGoalDetails(goalId) {
    if (goalsManager) {
        goalsManager.showGoalDetails(goalId);
    }
}

function openProgressModal(goalId) {
    if (goalsManager) {
        goalsManager.openProgressModal(goalId);
    }
}

function closeProgressModal() {
    if (goalsManager) {
        goalsManager.closeProgressModal();
    }
}

function updateProgress() {
    if (goalsManager) {
        goalsManager.updateProgress();
    }
}

function toggleGoalCompletion(goalId) {
    if (goalsManager) {
        goalsManager.toggleGoalCompletion(goalId);
    }
}

function deleteGoal(goalId) {
    if (goalsManager) {
        goalsManager.deleteGoal(goalId);
    }
}

// Editing an existing goal
function editGoal(goalId) {
    if (!goalsManager) return;
    const goal = goalsManager.goals.find(g => g.id === goalId);
    if (!goal) return;
    goalsManager.currentGoal = goal;
    goalsManager.editingGoalId = goalId;

    // Populate form
    document.getElementById('goal-title').value = goal.title;
    document.getElementById('goal-description').value = goal.description || '';
    document.getElementById('goal-category').value = goal.category || 'general';
    document.getElementById('goal-priority').value = goal.priority || 'medium';
    document.getElementById('goal-start-date').value = goal.startDate || '';
    document.getElementById('goal-target-date').value = goal.targetDate || '';
    document.getElementById('goal-target-value').value = goal.targetValue || 0;
    document.getElementById('goal-unit').value = goal.unit || 'hours';

    // Milestones
    const milestonesContainer = document.getElementById('milestones-container');
    milestonesContainer.innerHTML = '';
    if (goal.milestones && goal.milestones.length) {
        goal.milestones.forEach((m, idx) => {
            const div = document.createElement('div');
            div.className = 'milestone-input';
            div.innerHTML = `
                <input type="text" placeholder="Milestone ${idx + 1}" class="milestone-title" value="${m.title}">
                <input type="date" class="milestone-date" value="${m.date}">
                <button type="button" class="remove-milestone-btn" onclick="removeMilestone(this)">
                    <i class="fas fa-times"></i>
                </button>`;
            milestonesContainer.appendChild(div);
        });
    } else {
        milestonesContainer.innerHTML = `
            <div class="milestone-input">
                <input type="text" placeholder="Milestone 1" class="milestone-title">
                <input type="date" class="milestone-date">
                <button type="button" class="remove-milestone-btn" onclick="removeMilestone(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;
    }

    const titleEl = document.getElementById('goal-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Goal';
    document.getElementById('goal-modal').style.display = 'flex';
}

// Milestone management functions
function addMilestone() {
    const container = document.getElementById('milestones-container');
    const milestoneCount = container.children.length + 1;
    
    const milestoneDiv = document.createElement('div');
    milestoneDiv.className = 'milestone-input';
    milestoneDiv.innerHTML = `
        <input type="text" placeholder="Milestone ${milestoneCount}" class="milestone-title">
        <input type="date" class="milestone-date">
        <button type="button" class="remove-milestone-btn" onclick="removeMilestone(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(milestoneDiv);
}

function removeMilestone(button) {
    const container = document.getElementById('milestones-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert(error.message);
    });
}