document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.querySelector('.products-grid');
    const sortSelect = document.querySelector('.sort-select');
    const filterBtn = document.querySelector('.filter-btn');
    const filterToggle = document.querySelector('.filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const paginationContainer = document.querySelector('.pagination');
    const productsCountDisplay = document.querySelector('.products-count span:first-child');
    const totalProductsCount = document.querySelector('.products-count span:last-child');
    
    // Variables
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 12;
    let categoryCheckboxes;
    
    // Fetch products from API
    async function fetchProducts() {
        try {
            productsGrid.innerHTML = '<div class="loader"></div>';
            
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            
            // Update total count
            if (totalProductsCount) {
                totalProductsCount.textContent = allProducts.length;
            }
            
            // Update category filters
            updateCategoryFilters();
            
            applyFilters();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = '<div class="error-message">Failed to load products. Please try again later.</div>';
        }
    }
    
    // Update category filters based on available products
    function updateCategoryFilters() {
        // Get unique categories
        const categories = [...new Set(allProducts.map(product => product.category))];
        
        // Get the category filter container
        const categoryContainer = document.querySelector('.filter-section:nth-child(1) .filter-list');
        if (!categoryContainer) return;
        
        // Keep the "All Medicines" checkbox
        const allMedicinesItem = categoryContainer.querySelector('.filter-item:first-child');
        
        // Clear existing category items except the first one
        categoryContainer.innerHTML = '';
        if (allMedicinesItem) {
            categoryContainer.appendChild(allMedicinesItem);
        }
        
        // Add category filters
        categories.forEach(category => {
            const count = allProducts.filter(product => product.category === category).length;
            
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.innerHTML = `
                <div class="filter-checkbox">
                    <input type="checkbox" id="cat-${category.toLowerCase()}" class="category-filter" value="${category}" />
                    <label for="cat-${category.toLowerCase()}">
                        ${category}
                        <span class="filter-count">(${count})</span>
                    </label>
                </div>
            `;
            
            categoryContainer.appendChild(filterItem);
        });
        
        // Update the prescription filters
        const prescriptionContainer = document.querySelector('.filter-section:nth-child(2) .filter-list');
        if (prescriptionContainer) {
            const prescriptionCount = allProducts.filter(product => product.prescription === 'Yes').length;
            const otcCount = allProducts.filter(product => product.prescription === 'No').length;
            
            const prescriptionCheckbox = prescriptionContainer.querySelector('#cat-prescription');
            const otcCheckbox = prescriptionContainer.querySelector('#cat-otc');
            
            if (prescriptionCheckbox && prescriptionCheckbox.parentElement) {
                prescriptionCheckbox.parentElement.querySelector('.filter-count').textContent = `(${prescriptionCount})`;
            }
            
            if (otcCheckbox && otcCheckbox.parentElement) {
                otcCheckbox.parentElement.querySelector('.filter-count').textContent = `(${otcCount})`;
            }
        }
        
        // Get category checkboxes
        categoryCheckboxes = document.querySelectorAll('.category-filter');
    }
    
    // Apply sorting to filtered products
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
                // Assuming newer products have higher IDs
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'rating':
                // For demo - would use actual ratings in production
                filteredProducts.sort((a, b) => (Math.random() * 2) - 1);
                break;
            case 'popularity':
            default:
                // For demo - would use actual popularity in production
                filteredProducts.sort((a, b) => (Math.random() * 2) - 1);
                break;
        }
    }
    
    // Apply filters
    function applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
        const prescriptionRequired = document.querySelector('#cat-prescription:checked') !== null;
        const otcOnly = document.querySelector('#cat-otc:checked') !== null;
        
        // Get price range
        const minPrice = parseFloat(document.querySelector('.price-input:first-of-type')?.value) || 0;
        const maxPrice = parseFloat(document.querySelector('.price-input:last-of-type')?.value) || Infinity;
        
        // Reset to first page
        currentPage = 1;
        
        // Filter products
        filteredProducts = allProducts.filter(product => {
            // Category filter
            if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
                return false;
            }
            
            // Prescription filter
            if (prescriptionRequired && product.prescription !== 'Yes') {
                return false;
            }
            
            if (otcOnly && product.prescription !== 'No') {
                return false;
            }
            
            // Price filter
            if (product.price < minPrice || product.price > maxPrice) {
                return false;
            }
            
            return true;
        });
        
        // Apply sorting
        applySorting();
    }
    
    // Render products in the grid
    function renderProducts() {
        if (!productsGrid) return;
        
        // Get paginated products
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Update showing count
        if (productsCountDisplay) {
            productsCountDisplay.textContent = `${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length}`;
        }
        
        // Clear products grid
        productsGrid.innerHTML = '';
        
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="bx bx-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search criteria.</p>
                </div>
            `;
            return;
        }
        
        // Render each product
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Random image for demo purposes - you'd use actual product images in production
            const imageIndex = Math.floor(Math.random() * 12) + 8;
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="/e_commerce/pages/images/product_${imageIndex}.png" alt="${product.name}" 
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFOUVDRUYiLz48cGF0aCBkPSJNODAgODBIMTIwVjEyMEg4MFY4MFoiIGZpbGw9IiNBREI1QkQiLz48cGF0aCBkPSJNOTUgNjVIMTA1Vjg1SDEyNVY5NUgxMDVWMTE1SDk1Vjk1SDc1Vjg1SDk1VjY1WiIgZmlsbD0iIzZDNzU3RCIvPjwvc3ZnPg==';" />
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
        
        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                console.log(`Add to cart clicked for product ID: ${productId}`);
                
                // Check if Cart is available
                if (window.Cart) {
                    console.log('Cart module found, adding item...');
                    window.Cart.addItem(productId);
                } else {
                    console.error('Cart module not found');
                    
                    // Try to reload the cart script dynamically
                    const cartScript = document.createElement('script');
                    cartScript.src = '/e_commerce/pages/js/cart.js';
                    cartScript.onload = function() {
                        console.log('Cart script loaded dynamically');
                        if (window.Cart) {
                            window.Cart.addItem(productId);
                        } else {
                            alert('Unable to add item to cart. Please try again later.');
                        }
                    };
                    document.head.appendChild(cartScript);
                }
            });
        });
        
        // Render pagination
        renderPagination();
    }
    
    // Render pagination controls
    function renderPagination() {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        // Clear pagination
        paginationContainer.innerHTML = '';
        
        // Previous page button
        const prevBtn = document.createElement('a');
        prevBtn.className = `pagination-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '<i class="bx bx-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevBtn);
        
        // Page numbers
        const maxPageItems = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPageItems / 2));
        const endPage = Math.min(totalPages, startPage + maxPageItems - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = document.createElement('a');
            pageLink.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
            pageLink.textContent = i;
            pageLink.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextBtn);
    }
    
    // Event Listeners
    function setupEventListeners() {
        // Sort select change
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                applySorting();
                renderProducts();
            });
        }
        
        // Filter button click
        if (filterBtn) {
            filterBtn.addEventListener('click', function() {
                applyFilters();
                renderProducts();
            });
        }
        
        // Filter toggle for mobile
        if (filterToggle && filterSidebar) {
            filterToggle.addEventListener('click', function() {
                filterSidebar.classList.toggle('active');
                this.innerHTML = filterSidebar.classList.contains('active')
                    ? '<i class="bx bx-x"></i><span>Hide Filters</span>'
                    : '<i class="bx bx-filter"></i><span>Show Filters</span>';
            });
        }
    }
    
    // Initialize
    function init() {
        fetchProducts();
        setupEventListeners();
    }
    
    // Run initialization
    init();
});