/**
 * Authentication utility functions
 */

// Check if user is logged in
function isUserLoggedIn() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    return !!currentUser;
}

// Get current user data
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

// Update UI based on login status
function updateUIForAuthState() {
    const currentUser = getCurrentUser();
    
    // Get all relevant elements
    const loginLinks = document.querySelectorAll('.login-link');
    const registerLinks = document.querySelectorAll('.register-link');
    const profileLinks = document.querySelectorAll('.profile-link');
    const dividers = document.querySelectorAll('.user-actions .divider');
    
    if (currentUser) {
        // User is logged in
        loginLinks.forEach(link => link.style.display = 'none');
        registerLinks.forEach(link => link.style.display = 'none');
        dividers.forEach(divider => divider.style.display = 'none');
        
        profileLinks.forEach(link => {
            link.style.display = 'inline-block';
            link.textContent = `Hello, ${currentUser.username}`;
        });
    } else {
        // User is not logged in
        loginLinks.forEach(link => link.style.display = 'inline-block');
        registerLinks.forEach(link => link.style.display = 'inline-block');
        dividers.forEach(divider => divider.style.display = 'inline-block');
        
        profileLinks.forEach(link => link.style.display = 'none');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/e_commerce/pages/pages/login.html';
}