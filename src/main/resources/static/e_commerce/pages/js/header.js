document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Get the profile icon element
    const profileIcon = document.querySelector('.icon-link.profile-icon');
    const mobileProfileLink = document.querySelector('.mobile-action-link.profile');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const profileLink = document.querySelector('.profile-link');
    
    if (currentUser) {
        // User is logged in
        console.log("User is logged in:", currentUser.username);
        
        // Update header icons/links
        if (profileIcon) {
            profileIcon.setAttribute('href', '/e_commerce/pages/pages/profile.html');
            
            // Make sure the link works by adding an explicit click handler
            profileIcon.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default only if needed for debugging
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
        if (profileLink) {
            profileLink.style.display = 'inline-block';
            profileLink.setAttribute('href', '/e_commerce/pages/pages/profile.html');
        }
        
        // Create user menu if it doesn't exist
        const userActionsDiv = document.querySelector('.user-actions');
        if (userActionsDiv) {
            userActionsDiv.innerHTML = `
                <span class="welcome-message">Welcome, ${currentUser.username}</span>
                <span class="divider">|</span>
                <a href="/e_commerce/pages/pages/profile.html" class="action-link profile-link">My Account</a>
                <span class="divider">|</span>
                <a href="#" id="logout-link" class="action-link">Logout</a>
            `;
            
            // Add logout functionality
            document.getElementById('logout-link').addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.removeItem('currentUser');
                window.location.href = '/e_commerce/pages/pages/login.html';
            });
        }
    } else {
        // User is not logged in
        if (profileIcon) {
            profileIcon.setAttribute('href', '/e_commerce/pages/pages/login.html');
        }
        
        if (mobileProfileLink) {
            mobileProfileLink.setAttribute('href', '/e_commerce/pages/pages/login.html');
        }
        
        // Make sure login and register links are visible, profile link is hidden
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'none';
    }
});