document.addEventListener('DOMContentLoaded', function() {
    // Email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email) && email.length > 0) {
            this.setCustomValidity('Please enter a valid email address');
        } else {
            this.setCustomValidity('');
        }
    });

    // Password validation
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        if (this.value.length < 6 && this.value.length > 0) {
            this.setCustomValidity('Password must be at least 6 characters long');
        } else {
            this.setCustomValidity('');
        }
    });

    // Form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Trim whitespace from email to prevent issues
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        console.log("Attempting login with email:", email);
        
        // Show loading state (optional)
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;

        // Send login request to API
        fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            console.log("Response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Login response:", data);
            
            if (data.message === 'Login successful') {
                // Save user data to sessionStorage
                sessionStorage.setItem('currentUser', JSON.stringify({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    role: data.role,
                    isAdmin: data.isAdmin
                }));
                
                // Update UI if we're not redirecting right away
                if (typeof updateAuthUI === 'function') {
                    updateAuthUI();
                }
                
                // Redirect based on user role
                if (data.isAdmin) {
                    // Redirect admin to admin dashboard
                    window.location.href = '/admin/css/index.html';
                } else {
                    // Redirect regular user to e-commerce home
                    window.location.href = '/e_commerce/pages/index.html';
                }
            } else {
                // Show error message
                const errorMessage = document.getElementById('error-message');
                const errorText = document.getElementById('error-text');
                errorText.textContent = data.message || 'Invalid email or password';
                errorMessage.style.display = 'flex';
                
                // Clear password field
                passwordInput.value = '';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            // Show generic error message
            const errorMessage = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');
            errorText.textContent = 'An error occurred during login. Please try again.';
            errorMessage.style.display = 'flex';
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = 'Sign In';
            submitButton.disabled = false;
        });
    });

    // Remember me functionality
    const rememberCheckbox = document.getElementById('remember');

    // Check if we have saved credentials
    const savedEmail = localStorage.getItem('medicare_email');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // Save email if remember me is checked
    loginForm.addEventListener('submit', function() {
        if (rememberCheckbox.checked) {
            localStorage.setItem('medicare_email', emailInput.value.trim());
        } else {
            localStorage.removeItem('medicare_email');
        }
    });
});