// This script should be included in all admin pages to verify admin access
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // If no user is logged in or the user is not an admin, redirect to login page
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = '/e_commerce/pages/pages/login.html';
    }
});