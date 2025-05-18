document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const userModal = document.getElementById("userModal");
    const viewUserModal = document.getElementById("viewUserModal");
    const userForm = document.getElementById("userForm");
    const modalTitle = document.getElementById("modalTitle");
    const addUserBtn = document.getElementById("addUserBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const closeBtn = document.querySelector(".close");
    const closeViewBtn = document.getElementById("closeViewBtn");
    const tableSearch = document.getElementById("tableSearch");
    const entriesFilter = document.getElementById("entriesFilter");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageNumbers = document.getElementById("pageNumbers");
    const showingStart = document.getElementById("showingStart");
    const showingEnd = document.getElementById("showingEnd");
    const totalEntries = document.getElementById("totalEntries");
    const passwordFields = document.getElementById("passwordFields");
    const toggleSidebar = document.querySelector(".toggle-sidebar");
    const switchMode = document.getElementById("switch-mode");
    const alertContainer = document.getElementById("alertContainer");
    const userTableBody = document.getElementById("userTableBody");
    const logoutLink = document.getElementById("logout-link");

    // Pagination variables
    let currentPage = 1;
    let entriesPerPage = parseInt(entriesFilter ? entriesFilter.value : 10);
    let userData = [];
    let filteredData = [];
    
    // Initialize the page
    function init() {
        loadUsers();
        setupEventListeners();
        setupThemeToggle();
    }

    // Load all users from API
    function loadUsers() {
        fetch('/api/users')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch users');
                return response.json();
            })
            .then(data => {
                userData = data;
                filteredData = [...userData];
                updateTable();
            })
            .catch(error => {
                console.error('Error loading users:', error);
                showAlert('Failed to load users. Please try again.', 'error');
            });
    }

    // Update table with current data
    function updateTable() {
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        userTableBody.innerHTML = '';

        if (paginatedData.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No users found</td></tr>`;
            totalEntries.textContent = '0';
            showingStart.textContent = '0';
            showingEnd.textContent = '0';
        } else {
            paginatedData.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.address || 'N/A'}</td>
                    <td>
                        <span class="badge-role ${user.role.toLowerCase()}">${user.role}</span>
                    </td>
                    <td class="actions">
                        <button class="action-btn edit-btn" data-user-id="${user.id}">
                            <i class='bx bx-edit'></i>
                        </button>
                        ${user.role !== 'ADMIN' ? `
                        <button class="action-btn delete-btn" data-user-id="${user.id}">
                            <i class='bx bx-trash'></i>
                        </button>
                        ` : ''}
                        <button class="action-btn view-btn" data-user-id="${user.id}">
                            <i class='bx bx-show'></i>
                        </button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });

            // Update pagination info
            totalEntries.textContent = filteredData.length;
            showingStart.textContent = filteredData.length > 0 ? startIndex + 1 : 0;
            showingEnd.textContent = Math.min(endIndex, filteredData.length);

            // Add event listeners to new buttons
            document.querySelectorAll(".edit-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const userId = this.getAttribute("data-user-id");
                    openEditModal(userId);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const userId = this.getAttribute("data-user-id");
                    if (confirm("Are you sure you want to delete this user?")) {
                        deleteUser(userId);
                    }
                });
            });

            document.querySelectorAll(".view-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const userId = this.getAttribute("data-user-id");
                    openViewModal(userId);
                });
            });
        }

        renderPagination();
    }

    // Set up event listeners
    function setupEventListeners() {
        if (addUserBtn) {
            addUserBtn.addEventListener("click", openAddModal);
        }

        if (userForm) {
            userForm.addEventListener("submit", handleFormSubmit);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener("click", closeModal);
        }

        if (closeViewBtn) {
            closeViewBtn.addEventListener("click", function() {
                viewUserModal.style.display = "none";
            });
        }

        if (tableSearch) {
            tableSearch.addEventListener("input", handleSearch);
        }

        if (entriesFilter) {
            entriesFilter.addEventListener("change", function() {
                entriesPerPage = parseInt(this.value);
                currentPage = 1;
                updateTable();
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener("click", goToPrevPage);
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener("click", goToNextPage);
        }

        if (toggleSidebar) {
            toggleSidebar.addEventListener("click", function() {
                document.getElementById("sidebar").classList.toggle("hide");
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener("click", function(e) {
                e.preventDefault();
                sessionStorage.removeItem('adminUser');
                window.location.href = '/e_commerce/pages/pages/login.html';
            });
        }

        window.addEventListener("click", function(event) {
            if (event.target === userModal) {
                closeModal();
            }
            if (event.target === viewUserModal) {
                viewUserModal.style.display = "none";
            }
        });
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const userId = document.getElementById("userId").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;
        const role = document.getElementById("role").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Validation
        if (!username || !email) {
            showAlert("Username and email are required", "error");
            return;
        }

        // Validate passwords for new users
        if (userId === "0") {
            if (!password) {
                showAlert("Password is required for new users", "error");
                return;
            }
            if (password !== confirmPassword) {
                showAlert("Passwords do not match", "error");
                return;
            }
        }

        // Create user object
        const userData = {
            username,
            email,
            phone,
            address,
            role
        };

        // Add password only if provided (for new users or if changing password)
        if (password) {
            userData.password = password;
        }

        // For existing users, include the ID
        if (userId !== "0") {
            userData.id = parseInt(userId);
        }

        // Determine if it's an add or update operation
        const isUpdate = userId !== "0";
        
        // Use the correct endpoint based on operation type
        // For update, use the AdminController's /admin/users/save endpoint
        // For new users, use the UserController's /api/users/register endpoint
        const url = isUpdate ? '/admin/users/save' : '/api/users/register';
        const method = 'POST'; // Both endpoints use POST
        
        // Display loading indicator
        showAlert("Processing...", "info");

        // Send request to API
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': isUpdate ? 'application/x-www-form-urlencoded' : 'application/json'
            },
            body: isUpdate 
                ? new URLSearchParams(Object.entries(userData)).toString() 
                : JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} user`);
            }
            return response.json();
        })
        .then(data => {
            showAlert(`User ${isUpdate ? 'updated' : 'created'} successfully`, "success");
            closeModal();
            loadUsers(); // Reload the users table
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(`Error: ${error.message}`, "error");
        });
    }

    // Delete user
    function deleteUser(userId) {
        fetch(`/admin/users/delete/${userId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            return response.text();
        })
        .then(data => {
            showAlert("User deleted successfully", "success");
            loadUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert("Failed to delete user. " + error.message, "error");
        });
    }

    // Setup theme toggle
    function setupThemeToggle() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
            if (switchMode) switchMode.checked = true;
        }

        if (switchMode) {
            switchMode.addEventListener('change', function() {
                document.body.classList.toggle('dark', this.checked);
                localStorage.setItem('theme', this.checked ? 'dark' : 'light');
            });
        }
    }

    // Open modal for adding new user
    function openAddModal() {
        if (userForm) userForm.reset();
        if (document.getElementById("userId")) document.getElementById("userId").value = "0";
        if (modalTitle) modalTitle.textContent = "Add New User";
        
        // Show password fields and make them required
        if (passwordFields) {
            passwordFields.style.display = "block";
            const passwordLabel = document.querySelector('label[for="password"]');
            if (passwordLabel) {
                passwordLabel.innerHTML = "Password <span class='required'>*</span>";
            }
        }
        
        if (userModal) userModal.style.display = "flex";
        userForm.dataset.mode = "add";
    }

    // Open modal for editing user
    function openEditModal(id) {
        fetch(`/admin/users/get/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(user => {
                if (document.getElementById("userId")) document.getElementById("userId").value = user.id;
                if (document.getElementById("username")) document.getElementById("username").value = user.username;
                if (document.getElementById("email")) document.getElementById("email").value = user.email;
                if (document.getElementById("phone")) document.getElementById("phone").value = user.phone || "";
                if (document.getElementById("address")) document.getElementById("address").value = user.address || "";
                if (document.getElementById("role")) document.getElementById("role").value = user.role;
                
                // Clear password fields for existing users
                if (document.getElementById("password")) document.getElementById("password").value = "";
                if (document.getElementById("confirmPassword")) document.getElementById("confirmPassword").value = "";
                
                // Show password fields but make them optional
                if (passwordFields) {
                    passwordFields.style.display = "block";
                    const passwordLabel = document.querySelector('label[for="password"]');
                    if (passwordLabel) {
                        passwordLabel.innerHTML = "Password <small>(Leave blank to keep current password)</small>";
                    }
                }
                
                if (modalTitle) modalTitle.textContent = "Edit User";
                if (userModal) userModal.style.display = "flex";
                userForm.dataset.mode = "edit";
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                showAlert('Error loading user data. Please try again.', 'error');
            });
    }

    // Open modal for viewing user
    function openViewModal(id) {
        fetch(`/admin/users/get/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(user => {
                document.getElementById("viewUsername").textContent = user.username;
                document.getElementById("viewEmail").textContent = user.email;
                document.getElementById("viewPhone").textContent = user.phone || "N/A";
                document.getElementById("viewAddress").textContent = user.address || "N/A";
                document.getElementById("viewRole").textContent = user.role;
                viewUserModal.style.display = "flex";
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                showAlert('Error loading user data. Please try again.', 'error');
            });
    }

    // Close modal
    function closeModal() {
        if (userModal) userModal.style.display = "none";
        if (userForm) {
            userForm.reset();
            userForm.dataset.mode = "";
        }
    }

    // Handle search functionality
    function handleSearch() {
        const searchTerm = tableSearch.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredData = [...userData];
        } else {
            filteredData = userData.filter(user => 
                               user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
                (user.address && user.address.toLowerCase().includes(searchTerm))
            );
        }
        
        currentPage = 1;
        updateTable();
    }

    // Pagination functions
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    }

    function goToNextPage() {
        const totalPages = Math.ceil(filteredData.length / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    }

    function goToPage(page) {
        currentPage = page;
        updateTable();
    }

    // Render pagination controls
    function renderPagination() {
        if (!pageNumbers) return;
        
        pageNumbers.innerHTML = "";
        const totalPages = Math.ceil(filteredData.length / entriesPerPage);
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", () => goToPage(i));
            pageNumbers.appendChild(pageBtn);
        }
    }

    // Show alert message
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        
        const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
        
        alertDiv.innerHTML = `
            <i class='bx ${icon}'></i>
            <span>${message}</span>
            <button type="button" class="close">&times;</button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Add event listener to close button
        alertDiv.querySelector('.close').addEventListener('click', function() {
            alertDiv.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Initialize the page
    init();
});

