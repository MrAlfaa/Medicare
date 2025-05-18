document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productsGrid = document.querySelector('.products-grid');
    const productsCount = document.querySelector('.products-count span:first-child');
    const totalProductsCount = document.querySelector('.products-count span:last-child');
    const sortSelect = document.querySelector('.sort-select');
    const filterBtn = document.querySelector('.filter-btn');
    const categoryCheckboxes = document.querySelectorAll('.filter-section:nth-child(1) .filter-checkbox input');
    const priceMinInput = document.querySelector('.price-input[placeholder="Min"]');
    const priceMaxInput = document.querySelector('.price-input[placeholder="Max"]');

    // Products state
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;

    // Fetch products from the API
    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            
            // Set total count
            if (totalProductsCount) {
                totalProductsCount.textContent = allProducts.length;
            }
            
            applyFilters();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = '<div class="error-message">Failed to load products. Please try again later.</div>';
        }
    }

    // Render products in the grid
    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        if (productsCount) {
            productsCount.textContent = `${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length}`;
        }
        
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<div class="empty-state">No products match your criteria</div>';
            return;
        }

        productsGrid.innerHTML = '';
        
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const isPrescription = product.prescription === 'Yes';
            const prescriptionTag = isPrescription ? 
                '<span class="medicine-tag prescription">Prescription</span>' : 
                '<span class="medicine-tag otc">OTC</span>';
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="/e_commerce/pages/images/product_${Math.floor(Math.random() * 12) + 8}.png" alt="${product.name}">
                    <button class="wishlist-btn">
                        <i class="bx bx-heart"></i>
                    </button>
                </div>
                <div class="product-details">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="medicine-tags">
                        ${prescriptionTag}
                    </div>
                    <div class="product-rating">
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star"></i>
                        <i class="bx bxs-star-half"></i>
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
        
        // Add event listeners for add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                addToCart(productId);
            });
        });
        
        renderPagination();
    }
    
    // Apply filters based on user selections
    function applyFilters() {
        // Get selected categories
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(checkbox => checkbox.checked && checkbox.id !== 'cat-all')
            .map(checkbox => checkbox.id.replace('cat-', ''));
            
        // Get price range
        const minPrice = priceMinInput.value ? parseFloat(priceMinInput.value) : 0;
        const maxPrice = priceMaxInput.value ? parseFloat(priceMaxInput.value) : Infinity;
        
        // Filter products
        filteredProducts = allProducts.filter(product => {
            // Check if product price is within range
            const priceInRange = product.price >= minPrice && product.price <= maxPrice;
            
            // Check if product matches selected categories or if no categories are selected
            let categoryMatch = true;
            if (selectedCategories.length > 0) {
                const isPrescription = product.prescription === 'Yes';
                
                // Match against prescription/otc filter
                if (selectedCategories.includes('prescription') && !isPrescription) {
                    categoryMatch = false;
                } else if (selectedCategories.includes('otc') && isPrescription) {
                    categoryMatch = false;
                }
                
                // Additional category matching can be added here
            }
            
            return priceInRange && categoryMatch;
        });
        
        // Apply sorting
        sortProducts(sortSelect.value);
        
        // Reset to first page when filters change
        currentPage = 1;
    }
    
    // Sort products based on selected option
    function sortProducts(sortOption) {
        switch (sortOption) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                // As we don't have date field, we'll sort by ID (assuming higher ID = newer)
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'popularity':
            default:
                // For now, keep original order for popularity
                break;
        }
    }
    
    // Render pagination controls
    function renderPagination() {
        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) return;
        
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        let paginationHTML = '';
        
        // Previous page button
        if (currentPage > 1) {
            paginationHTML += `<a class="pagination-item prev"><i class="bx bx-chevron-left"></i></a>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<a class="pagination-item active">${i}</a>`;
            } else if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                paginationHTML += `<a class="pagination-item">${i}</a>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Next page button
        if (currentPage < totalPages) {
            paginationHTML += `<a class="pagination-item next"><i class="bx bx-chevron-right"></i></a>`;
        }
        
        paginationElement.innerHTML = paginationHTML;
        
        // Add click event listeners to pagination items
        document.querySelectorAll('.pagination-item').forEach(item => {
            item.addEventListener('click', function() {
                if (this.classList.contains('prev')) {
                    currentPage--;
                } else if (this.classList.contains('next')) {
                    currentPage++;
                } else {
                    currentPage = parseInt(this.textContent);
                }
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
    
    // Add to cart functionality
    function addToCart(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
        
        // Get current cart or initialize empty cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingProductIndex = cart.findIndex(item => item.id == productId);
        
        if (existingProductIndex >= 0) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: product.category,
                prescription: product.prescription
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart counter
        updateCartCount();
        
        // Show success message
        alert(`${product.name} added to cart!`);
    }
    
    // Update cart count in header
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }
    
    // Event Listeners
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
            renderProducts();
        });
    }
    
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            applyFilters();
            renderProducts();
        });
    }
    
    // Initialize 'all' checkbox
    const allCategoriesCheckbox = document.getElementById('cat-all');
    if (allCategoriesCheckbox) {
        allCategoriesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                categoryCheckboxes.forEach(checkbox => {
                    if (checkbox.id !== 'cat-all') {
                        checkbox.checked = false;
                    }
                });
            }
        });
        
        // Other category checkboxes
        categoryCheckboxes.forEach(checkbox => {
            if (checkbox.id !== 'cat-all') {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        allCategoriesCheckbox.checked = false;
                    }
                    // If no categories selected, check 'All'
                    const anyChecked = Array.from(categoryCheckboxes)
                        .some(cb => cb.id !== 'cat-all' && cb.checked);
                    if (!anyChecked) {
                        allCategoriesCheckbox.checked = true;
                    }
                });
            }
        });
    }
    
    // Initialize
    fetchProducts();
    updateCartCount();
});