document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.querySelector('.products-grid');
    const sortSelect = document.querySelector('.sort-select');
    const filterBtn = document.querySelector('.filter-btn');
    const filterToggle = document.querySelector('.filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const paginationContainer = document.querySelector('#pagination');
    const productsCountDisplay = document.querySelector('#showing-start');
    const productsEndDisplay = document.querySelector('#showing-end');
    const totalProductsCount = document.querySelector('#total-products');
    
    // Variables
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    
    // Fetch products from API
    async function fetchProducts() {
        try {
            productsGrid.innerHTML = '<div class="loader"></div>';
            
            // Add cache-busting parameter to prevent browser caching
            const cacheBuster = new Date().getTime();
            const response = await fetch(`/api/products?_=${cacheBuster}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
            }
            
            allProducts = await response.json();
            
            // Log the fetched products for debugging
            console.log('Fetched products:', allProducts);
            
            if (!Array.isArray(allProducts) || allProducts.length === 0) {
                console.warn('No products returned from API or invalid format');
                productsGrid.innerHTML = '<div class="empty-state"><h3>No products available</h3><p>Please check back later.</p></div>';
                return;
            }
            
            filteredProducts = [...allProducts];
            
            // Update total count
            if (totalProductsCount) {
                totalProductsCount.textContent = allProducts.length;
            }
            
            // Apply initial filters and sorting
            applyFilters();
            applySorting();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = `<div class="empty-state"><h3>Failed to load products</h3><p>Error: ${error.message}</p></div>`;
        }
    }
    
    // Apply filters based on user selections
    function applyFilters() {
        // Get selected categories
        const categoryFilters = document.querySelectorAll('.filter-section:nth-child(1) input[type="checkbox"]:checked');
        const selectedCategories = Array.from(categoryFilters)
            .map(checkbox => checkbox.id.replace('cat-', ''))
            .filter(cat => cat !== 'all');
        
        // Get prescription status
        const isPrescription = document.querySelector('#cat-prescription:checked') !== null;
        const isOTC = document.querySelector('#cat-otc:checked') !== null;
        
        // Get price range
        const priceInputs = document.querySelectorAll('.price-input');
        const minPrice = parseFloat(priceInputs[0].value) || 0;
        const maxPrice = parseFloat(priceInputs[1].value) || Infinity;
        
        // Filter products
        filteredProducts = allProducts.filter(product => {
            // Skip filtering if "All" is selected and no specific categories are selected
            const categoryFilter = document.querySelector('#cat-all:checked') !== null && selectedCategories.length === 0
                ? true
                : selectedCategories.length === 0 || selectedCategories.includes(product.category.toLowerCase());
            
            // Prescription filter
            const prescriptionFilter = (!isPrescription && !isOTC) || 
                (isPrescription && product.prescription === 'Yes') || 
                (isOTC && product.prescription === 'No');
            
            // Price filter
            const priceFilter = product.price >= minPrice && product.price <= maxPrice;
            
            return categoryFilter && prescriptionFilter && priceFilter;
        });
        
        // Reset to first page after filtering
        currentPage = 1;
    }
    
    // Apply sorting
    function applySorting() {
        if (!sortSelect) return;
        
        const sortBy = sortSelect.value;
        
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            default:
                // Default sort
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    // Render products
    function renderProducts() {
        if (!productsGrid) return;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Update products count display
        if (productsCountDisplay && productsEndDisplay) {
            productsCountDisplay.textContent = filteredProducts.length > 0 ? startIndex + 1 : 0;
            productsEndDisplay.textContent = endIndex;
        }
        
        // Clear products grid
        productsGrid.innerHTML = '';
        
        // Check if any products to display
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your filters</p></div>';
            return;
        }
        
        // Render each product
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Create placeholder image URL
            const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFOUVDRUYiLz48cGF0aCBkPSJNODAgODBIMTIwVjEyMEg4MFY4MFoiIGZpbGw9IiNBREI1QkQiLz48cGF0aCBkPSJNOTUgNjVIMTA1Vjg1SDEyNVY5NUgxMDVWMTE1SDk1Vjk1SDc1Vjg1SDk1VjY1WiIgZmlsbD0iIzZDNzU3RCIvPjwvc3ZnPg==';
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${placeholderImage}" alt="${product.name}" />
                    <button class="wishlist-btn">
                        <i class="bx bx-heart"></i>
                    </button>
                </div>
                <div class="product-details">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="medicine-tags">
                        <span class="medicine-tag ${product.prescription === 'Yes' ? 'prescription' : 'otc'}">
                            ${product.prescription === 'Yes' ? 'Prescription' : 'OTC'}
                        </span>
                    </div>
                    <div class="product-rating">
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bx-star"></i>
                        <span>(${(Math.random() * 2 + 3).toFixed(1)})</span>
                    </div>
                    <div class="product-price-cart">
                        <div class="product-price">
                            <span class="current-price">Rs.${product.price.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart" data-id="${product.id}">
                            <i class="bx bx-cart"></i>
                        </button>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Add event listeners to Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
        
        // Render pagination
        renderPagination();
    }
    
    // Render pagination
    function renderPagination() {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        // Clear pagination container
        paginationContainer.innerHTML = '';
        
        // Previous page button
        const prevBtn = document.createElement('a');
        prevBtn.className = `pagination-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '<i class="bx bx-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                window.scrollTo(0, 0);
            }
        });
        paginationContainer.appendChild(prevBtn);
        
        // Page numbers
        const maxVisiblePages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = document.createElement('a');
            pageLink.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
            pageLink.textContent = i;
            pageLink.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
                window.scrollTo(0, 0);
            });
            paginationContainer.appendChild(pageLink);
        }
        
        // Next page button
        const nextBtn = document.createElement('a');
        nextBtn.className = `pagination-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = '<i class="bx bx-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                window.scrollTo(0, 0);
            }
        });
        paginationContainer.appendChild(nextBtn);
    }
    
    // Add to cart functionality
    function addToCart() {
        const productId = this.dataset.id;
        console.log('Adding product to cart, product ID:', productId);
        
        if (!productId) {
            console.error('No product ID found');
            return;
        }
        
        // Find the product in our allProducts array
        const product = allProducts.find(p => p.id == productId);
        
        if (!product) {
            console.error('Product not found in products array:', productId);
            showNotification('Product not found. Please try again.', 'error');
            return;
        }
        
        // Log the product we're adding
        console.log('Product to add:', product);
        
        // Use the Cart module to add the item if available
        if (window.Cart && typeof window.Cart.addItem === 'function') {
            // The second parameter is quantity (default to 1)
            window.Cart.addItem(productId, 1)
                .then(success => {
                    if (success) {
                        showNotification(`${product.name} added to cart!`, 'success');
                    } else {
                        showNotification('Failed to add product to cart', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error in Cart.addItem:', err);
                    showNotification('Error adding product to cart', 'error');
                });
        } else {
            console.error('Cart module not found or not properly initialized');
            
            // Create our own cart implementation as fallback
            const cart = JSON.parse(localStorage.getItem('medicare_cart') || '[]');
            
            // Check if item already exists
            const existingItemIndex = cart.findIndex(item => item.id == productId);
            
            if (existingItemIndex >= 0) {
                // Update quantity
                cart[existingItemIndex].quantity += 1;
            } else {
                // Add new item
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    category: product.category,
                    prescription: product.prescription
                });
            }
            
            // Save back to localStorage
            localStorage.setItem('medicare_cart', JSON.stringify(cart));
            
            // Show notification
            showNotification(`${product.name} added to cart!`, 'success');
            
            // Try to reload cart.js
            loadCartScript();
        }
    }

    // Add these helper functions for the addToCart function
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Update cart icon if applicable
        updateCartIcon();
    }

    function updateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('pulse');
            setTimeout(() => cartIcon.classList.remove('pulse'), 500);
            
            // Update count if available
            const countElement = cartIcon.querySelector('.cart-count');
            if (countElement) {
                const cart = JSON.parse(localStorage.getItem('medicare_cart') || '[]');
                const count = cart.reduce((sum, item) => sum + item.quantity, 0);
                countElement.textContent = count;
            }
        }
    }

    function loadCartScript() {
        if (document.querySelector('script[src="/e_commerce/pages/js/cart.js"]')) {
            console.log('Cart script already exists, reloading page instead');
            window.location.reload();
            return;
        }
        
        const script = document.createElement('script');
        script.src = '/e_commerce/pages/js/cart.js';
        script.onload = () => {
            console.log('Cart script loaded successfully');
            if (window.Cart && typeof window.Cart.addItem === 'function') {
                console.log('Cart functionality is now available');
            }
        };
        script.onerror = () => console.error('Failed to load cart script');
        document.head.appendChild(script);
    }
    
    // Event Listeners
    function setupEventListeners() {
        // Sort select
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                applySorting();
                renderProducts();
            });
        }
        
        // Apply filters button
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                applyFilters();
                applySorting();
                renderProducts();
            });
        }
        
        // Checkbox filters (categories, prescription)
        document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.id === 'cat-all' && checkbox.checked) {
                    // Uncheck all other category checkboxes
                    document.querySelectorAll('.filter-section:nth-child(1) input[type="checkbox"]:not(#cat-all)')
                        .forEach(cb => cb.checked = false);
                }
                
                // If any other category is checked, uncheck "All"
                if (checkbox.id !== 'cat-all' && checkbox.checked) {
                    document.querySelector('#cat-all').checked = false;
                }
            });
        });
    }
    
    // Initialize
    function init() {
        fetchProducts();
        setupEventListeners();
    }
    
    // Start the application
    init();
});