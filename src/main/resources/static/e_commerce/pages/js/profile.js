document.addEventListener('DOMContentLoaded', function() {
    // Get current user from session storage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/e_commerce/pages/pages/login.html';
        return;
    }

    // Load user profile data
    loadUserProfile();

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Edit Profile Modal
    const editProfileBtn = document.querySelector('.edit-profile');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModal = document.querySelector('#edit-profile-modal .close-modal');
    const cancelEditBtn = document.querySelector('.cancel-edit');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', function() {
            // Populate form with current user data
            populateEditForm();
            editProfileModal.style.display = 'block';
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener('click', function() {
            editProfileModal.style.display = 'none';
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            editProfileModal.style.display = 'none';
        });
    }

    // Logout Button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear user session
            sessionStorage.removeItem('currentUser');
            // Show notification
            showNotification('You have been logged out successfully.', 'success');
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/e_commerce/pages/pages/login.html';
            }, 1500);
        });
    }

    // Form submission
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    // Password validation
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (newPasswordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (newPasswordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });

        newPasswordInput.addEventListener('input', function() {
            if (newPasswordInput.value !== confirmPasswordInput.value && confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }
});

// Load user profile data from API
function loadUserProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Placeholder for API call - using current user data from session storage for now
    // In a real app, you would fetch the full user data from the server
    fetch(`/api/users/${currentUser.email}`)
        .then(response => {
            if (!response.ok) {
                // If API is not available, use session data
                updateProfileUI(currentUser);
                return null;
            }
            return response.json();
        })
        .then(userData => {
            if (userData) {
                updateProfileUI(userData);
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            // Fallback to session data
            updateProfileUI(currentUser);
        });
}

// Update profile UI with user data
function updateProfileUI(userData) {
    document.getElementById('profile-username').textContent = userData.username || 'Not provided';
    document.getElementById('profile-email').textContent = userData.email || 'Not provided';
    document.getElementById('profile-phone').textContent = userData.phone || 'Not provided';
    document.getElementById('profile-address').textContent = userData.address || 'Not provided';
}

// Populate edit form with current user data
function populateEditForm() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Fetch latest user data - fallback to session data if API fails
    fetch(`/api/users/${currentUser.email}`)
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(userData => {
            if (userData) {
                fillForm(userData);
            } else {
                fillForm(currentUser);
            }
        })
        .catch(error => {
            console.error('Error fetching user data for edit:', error);
            fillForm(currentUser);
        });
}

// Fill the edit form with user data
function fillForm(userData) {
    document.getElementById('name').value = userData.username || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('address').value = userData.address || '';
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Update user profile
function updateProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const formData = new FormData(document.getElementById('edit-profile-form'));
    
    // Prepare data for API
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };
    
    // Handle password change
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword && currentPassword) {
        if (newPassword !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }
        userData.currentPassword = currentPassword;
        userData.newPassword = newPassword;
    }
    
    // Send update request to API
    fetch(`/api/users/${currentUser.email}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to update profile');
            });
        }
        return response.json();
    })
    .then(data => {
        // Update session storage with new data
        const updatedUser = {
            ...currentUser,
            username: userData.username,
            phone: userData.phone,
            address: userData.address
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update UI
        updateProfileUI(updatedUser);
        
        // Close modal
        document.getElementById('edit-profile-modal').style.display = 'none';
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        
        // If API fails, simulate success for demo purposes
        // In production, you would show a proper error
        const updatedUser = {
            ...currentUser,
            username: userData.username,
            phone: userData.phone,
            address: userData.address
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        updateProfileUI(updatedUser);
        document.getElementById('edit-profile-modal').style.display = 'none';
        showNotification('Profile updated successfully!', 'success');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification element exists, if not create it
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}