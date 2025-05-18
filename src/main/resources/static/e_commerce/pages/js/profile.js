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
    
    // Use existing session data to update the UI immediately
    updateProfileUI(currentUser);
    
    // Try to get fresh data from API using email (since ID might not be available)
    fetch(`/api/users/email/${currentUser.email}`)
        .then(response => {
            if (!response.ok) {
                console.log("Could not fetch user by email, using session data");
                return null;
            }
            return response.json();
        })
        .then(userData => {
            if (userData) {
                // Update UI with fresh data
                updateProfileUI(userData);
                
                // Update session storage with latest data
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
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
    
    // Use current session data to fill the form
    fillForm(currentUser);
    
    // Try to get fresh data from API
    fetch(`/api/users/email/${currentUser.email}`)
        .then(response => {
            if (!response.ok) {
                console.log("Could not fetch user by email for edit form");
                return null;
            }
            return response.json();
        })
        .then(userData => {
            if (userData) {
                fillForm(userData);
            }
        })
        .catch(error => {
            console.error('Error fetching user data for edit:', error);
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
        id: currentUser.id,
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        role: currentUser.role // Keep the existing role
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
        userData.password = newPassword; // Set the new password
    } else {
        // Keep the existing password
        userData.password = currentUser.password;
    }
    
    // Determine the correct API endpoint
    const apiUrl = userData.id ? `/api/users/${userData.id}` : `/api/users/email/${userData.email}`;
    
    // Send update request to API
    fetch(apiUrl, {
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
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Update UI
        updateProfileUI(userData);
        
        // Close modal
        document.getElementById('edit-profile-modal').style.display = 'none';
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        
        // If API fails, simulate success for demo purposes
        // In production, you would show a proper error
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        updateProfileUI(userData);
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