// This script should be included in pages that require authentication
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
        window.location.href = '/e_commerce/pages/pages/login.html';
    }
});