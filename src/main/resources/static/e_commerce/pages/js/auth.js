/**
 * Authentication management for Medicare
 */
(function() {
    // Load auth state immediately when script is included
    updateAuthUI();
    
    // Also update when DOM is fully loaded to ensure all elements exist
    document.addEventListener('DOMContentLoaded', updateAuthUI);
    
    // Main function to update UI based on authentication state
    function updateAuthUI() {
        const currentUser = getCurrentUser();
        const userActionsDiv = document.getElementById('user-actions');
        
        if (!userActionsDiv) {
            console.warn('User actions div not found in DOM');
            return;
        }
        
        if (currentUser) {
            // User is logged in - show account info
            userActionsDiv.innerHTML = `
                <a href="/e_commerce/pages/pages/profile.html" class="action-link profile-link">
                    Hello, ${currentUser.username}
                </a>
                <span class="divider">|</span>
                <a href="#" class="action-link logout-link">Logout</a>
            `;
            
            // Add logout functionality
            const logoutLink = userActionsDiv.querySelector('.logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
            
            // Update profile icon in header for desktop view
            const profileIcon = document.querySelector('.icon-link.profile-icon');
            if (profileIcon) {
                profileIcon.setAttribute('href', '/e_commerce/pages/pages/profile.html');
                profileIcon.setAttribute('title', `Hello, ${currentUser.username}`);
            }
            
            // Update mobile view
            const mobileAuthDiv = document.querySelector('.mobile-auth');
            if (mobileAuthDiv) {
                mobileAuthDiv.innerHTML = `
                    <a href="/e_commerce/pages/pages/profile.html" class="mobile-auth-link">My Account</a>
                    <a href="#" class="mobile-auth-link mobile-logout">Logout</a>
                `;
                
                const mobileLogoutLink = mobileAuthDiv.querySelector('.mobile-logout');
                if (mobileLogoutLink) {
                    mobileLogoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        logout();
                    });
                }
            }
            
            // Update mobile profile link
            const mobileProfileLink = document.querySelector('.mobile-action-link');
            if (mobileProfileLink) {
                mobileProfileLink.setAttribute('href', '/e_commerce/pages/pages/profile.html');
                mobileProfileLink.querySelector('span').textContent = 'My Account';
            }
            
        } else {
            // User is not logged in - show login/register links
            userActionsDiv.innerHTML = `
                <a href="/e_commerce/pages/pages/login.html" class="action-link login-link">Login</a>
                <span class="divider">|</span>
                <a href="/e_commerce/pages/pages/register.html" class="action-link register-link">Register</a>
            `;
            
            // Update mobile view
            const mobileAuthDiv = document.querySelector('.mobile-auth');
            if (mobileAuthDiv) {
                mobileAuthDiv.innerHTML = `
                    <a href="/e_commerce/pages/pages/login.html" class="mobile-auth-link">Sign In</a>
                    <a href="/e_commerce/pages/pages/register.html" class="mobile-auth-link">Register</a>
                `;
            }
        }
    }
    
    // Helper function to get current user from session storage
    function getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem('currentUser'));
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    
    // Function to handle logout
    function logout() {
        sessionStorage.removeItem('currentUser');
        showNotification('You have been logged out successfully');
        setTimeout(() => {
            window.location.href = '/e_commerce/pages/pages/login.html';
        }, 1000);
    }
    
    // Notification helper
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Expose global functions
    window.updateAuthUI = updateAuthUI;
    window.getCurrentUser = getCurrentUser;
    window.logout = logout;
})();