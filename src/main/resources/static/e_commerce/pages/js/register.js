document.addEventListener('DOMContentLoaded', function() {
    // Password validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;

        if (password !== confirmPassword) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });

    // Phone number validation
    document.getElementById('phone').addEventListener('input', function() {
        const phoneNumber = this.value;
        const phoneRegex = /^\d+$/;

        if (!phoneRegex.test(phoneNumber)) {
            this.setCustomValidity('Phone number should contain only digits');
        } else {
            this.setCustomValidity('');
        }
    });

    // Password strength check
    document.getElementById('password').addEventListener('input', function() {
        const password = this.value;

        if (password.length < 6) {
            this.setCustomValidity('Password must be at least 6 characters long');
        } else {
            this.setCustomValidity('');
        }
    });

    // Form submission handling
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        // Basic client-side validation
        const username = document.getElementById('username').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const password = document.getElementById('password').value;
        const agree = document.getElementById('agree').checked;

        if (!username || !phone || !email || !address || !password || !agree) {
            errorMessage.style.display = 'flex';
            errorText.textContent = 'Please fill all required fields and agree to terms';
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        // Send registration request to the server
        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                phone,
                email,
                address,
                password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User registered successfully') {
                // Registration successful, redirect to login page
                alert('Registration successful! Please log in.');
                window.location.href = 'login.html';
            } else {
                // Show error message
                errorMessage.style.display = 'flex';
                errorText.textContent = data.message || 'Registration failed. Please try again.';
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            errorMessage.style.display = 'flex';
            errorText.textContent = 'An error occurred during registration. Please try again.';
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = 'Create Account';
            submitButton.disabled = false;
        });
    });
});