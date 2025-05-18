// Remove DOMContentLoaded event listener since this script is loaded after the header
// and we want it to execute immediately
(function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Get the profile icon element
    const profileIcon = document.querySelector('.icon-link.profile-icon');
    const mobileProfileLink = document.querySelector('.mobile-action-link.profile');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const profileLink = document.querySelector('.profile-link');
    const divider = document.querySelector('.user-actions .divider');
    
    if (currentUser) {
        // User is logged in
        console.log("User is logged in:", currentUser.username);
        
        // Update header icons/links
        if (profileIcon) {
            profileIcon.setAttribute('href', '/e_commerce/pages/pages/profile.html');
            profileIcon.setAttribute('title', `Hello, ${currentUser.username}`);
            
            // Make sure the link works by adding an explicit click handler
            profileIcon.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Profile icon clicked");
                window.location.href = '/e_commerce/pages/pages/profile.html';
            });
        }
        
        if (mobileProfileLink) {
            mobileProfileLink.setAttribute('href', '/e_commerce/pages/pages/profile.html');
        }
        
        // Update links in user-actions div
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (divider) divider.style.display = 'none';
        if (profileLink) {
            profileLink.style.display = 'inline-block';
            profileLink.setAttribute('href', '/e_commerce/pages/pages/profile.html');
            profileLink.textContent = `Hello, ${currentUser.username}`;
        }
    } else {
        // User is not logged in
        console.log("User is not logged in");
        
        // Make sure login and register are visible
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (divider) divider.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'none';
    }
})(); // Self-executing function