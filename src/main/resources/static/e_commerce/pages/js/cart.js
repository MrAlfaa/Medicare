/**
 * Cart management module
 */
const Cart = (function() {
    // Private methods and variables
    const CART_STORAGE_KEY = 'medicare_cart';
    
    /**
     * Initialize the cart
     */
    function initCart() {
        let cart = localStorage.getItem(CART_STORAGE_KEY);
        if (!cart) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
        }
        updateCartCount();
        console.log('Cart initialized');
    }
    
    /**
     * Get the current cart from local storage
     */
    function getCart() {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    }
    
    /**
     * Save cart to local storage
     */
    function saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
    }
    
    /**
     * Update cart count in the header
     */
    function updateCartCount() {
        const cart = getCart();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                
                // Add animation effect
                element.classList.add('pulse');
                setTimeout(() => {
                    element.classList.remove('pulse');
                }, 300);
            }
        });
    }
    
    /**
     * Add a product to the cart
     */
    async function addToCart(productId, quantity = 1) {
        try {
            console.log(`Adding product ID ${productId} to cart`);
            const product = await getProductById(productId);
            
            if (!product) {
                throw new Error('Product not found');
            }
            
            console.log('Product fetched successfully:', product);
            
            const cart = getCart();
            const existingItem = cart.find(item => item.id == productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    category: product.category,
                    prescription: product.prescription
                });
            }
            
            saveCart(cart);
            showNotification(`${product.name} added to cart!`);
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add product to cart', 'error');
            return false;
        }
    }
    
    /**
     * Remove a product from the cart
     */
    function removeFromCart(productId) {
        const cart = getCart();
        const updatedCart = cart.filter(item => item.id != productId);
        
        saveCart(updatedCart);
        showNotification('Item removed from cart');
        
        // If we're on the cart page, update the display
        if (window.location.href.includes('cart.html')) {
            renderCartPage();
        }
        
        return true;
    }
    
    /**
     * Update quantity of a product in the cart
     */
    function updateCartItemQuantity(productId, quantity) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        
        const cart = getCart();
        const item = cart.find(item => item.id == productId);
        
        if (item) {
            item.quantity = quantity;
            saveCart(cart);
            
            // If we're on the cart page, update the display
            if (window.location.href.includes('cart.html')) {
                renderCartPage();
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Clear the entire cart
     */
    function clearCart() {
        saveCart([]);
        showNotification('Cart cleared');
        
        // If we're on the cart page, update the display
        if (window.location.href.includes('cart.html')) {
            renderCartPage();
        }
    }
    
    /**
     * Calculate cart totals
     */
    function calculateCartTotals() {
        const cart = getCart();
        
        const subtotal = cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        const shipping = cart.length > 0 ? 120 : 0; // Shipping cost
        const total = subtotal + shipping;
        
        return {
            subtotal,
            shipping,
            total,
            itemCount: cart.reduce((count, item) => count + item.quantity, 0)
        };
    }
    
    /**
     * Fetch product by ID from API
     */
    async function getProductById(productId) {
        try {
            console.log(`Fetching product details for ID: ${productId}`);
            const response = await fetch(`/api/products/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch product. Status: ${response.status}`);
            }
            
            const product = await response.json();
            console.log('Product details:', product);
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="bx bx-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button event
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Render the cart page
     */
    function renderCartPage() {
        const cartItemsContainer = document.querySelector('.cart-items-container');
        if (!cartItemsContainer) return;
        
        const cart = getCart();
        const totals = calculateCartTotals();
        
        // Update cart count display
        const cartCountDisplay = document.querySelector('.cart-count-display');
        if (cartCountDisplay) {
            cartCountDisplay.textContent = totals.itemCount;
        }
        
        // Update cart items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class='bx bx-cart'></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="/e_commerce/pages/pages/medicines.html" class="btn btn-primary">Shop Now</a>
                </div>
            `;
            
            // Hide totals section
            const totalsSection = document.querySelector('.cart-totals');
            if (totalsSection) {
                totalsSection.style.display = 'none';
            }
            
            return;
        }
        
        // Show cart items
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item card mb-3';
            cartItem.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div class="d-flex flex-row align-items-center">
                            <div>
                                <img src="/e_commerce/pages/images/product_${Math.floor(Math.random() * 12) + 8}.png" 
                                     class="img-fluid rounded-3" alt="${item.name}" style="width: 65px;"
                                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFOUVDRUYiLz48cGF0aCBkPSJNODAgODBIMTIwVjEyMEg4MFY4MFoiIGZpbGw9IiNBREI1QkQiLz48cGF0aCBkPSJNOTUgNjVIMTA1Vjg1SDEyNVY5NUgxMDVWMTE1SDk1Vjk1SDc1Vjg1SDk1VjY1WiIgZmlsbD0iIzZDNzU3RCIvPjwvc3ZnPg==';">
                            </div>
                            <div class="ms-3">
                                <h5>${item.name}</h5>
                                <p class="small mb-0">${item.category}</p>
                                ${item.prescription === 'Yes' ? 
                                  '<span class="badge bg-danger">Prescription</span>' : 
                                  '<span class="badge bg-success">OTC</span>'}
                            </div>
                        </div>
                        <div class="d-flex flex-row align-items-center">
                            <div class="d-flex align-items-center" style="width: 120px;">
                                <button class="btn btn-link px-2" 
                                        onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                                    <i class="bx bx-minus"></i>
                                </button>
                                
                                <input type="number" class="form-control form-control-sm quantity-input" 
                                       min="1" value="${item.quantity}" style="width: 45px;"
                                       onchange="Cart.updateQuantity(${item.id}, parseInt(this.value))">
                                       
                                <button class="btn btn-link px-2"
                                        onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                                    <i class="bx bx-plus"></i>
                                </button>
                            </div>
                            <div style="width: 80px;" class="text-end">
                                <h5 class="mb-0">Rs.${(item.price * item.quantity).toFixed(2)}</h5>
                                <small class="text-muted">Rs.${item.price.toFixed(2)} each</small>
                            </div>
                            <a href="#!" class="text-danger ms-3 remove-item" data-id="${item.id}">
                                <i class="bx bx-trash-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.id;
                removeFromCart(productId);
            });
        });
        
        // Update totals
        const subtotalElement = document.querySelector('.cart-subtotal');
        const shippingElement = document.querySelector('.cart-shipping');
        const totalElement = document.querySelector('.cart-total');
        const checkoutTotalElement = document.querySelector('.checkout-total');
        
        if (subtotalElement) subtotalElement.textContent = `Rs.${totals.subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `Rs.${totals.shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `Rs.${totals.total.toFixed(2)}`;
        if (checkoutTotalElement) checkoutTotalElement.textContent = `Rs.${totals.total.toFixed(2)}`;
        
        // Show totals section
        const totalsSection = document.querySelector('.cart-totals');
        if (totalsSection) {
            totalsSection.style.display = 'block';
        }
    }
    
    /**
     * Initialize checkout page
     */
    function initCheckoutPage() {
        const orderSummary = document.querySelector('.order-summary');
        if (!orderSummary) return;
        
        const cart = getCart();
        const totals = calculateCartTotals();
        
        // Display cart items in the order summary
        let orderSummaryHTML = '';
        cart.forEach(item => {
            orderSummaryHTML += `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>Rs.${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });
        
        orderSummary.innerHTML = orderSummaryHTML;
        
        // Update totals
        const subtotalElement = document.querySelector('.checkout-subtotal');
        const shippingElement = document.querySelector('.checkout-shipping');
        const totalElement = document.querySelector('.checkout-total');
        const orderTotalButton = document.querySelector('.order-total-button');
        
        if (subtotalElement) subtotalElement.textContent = `Rs.${totals.subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `Rs.${totals.shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `Rs.${totals.total.toFixed(2)}`;
        if (orderTotalButton) orderTotalButton.textContent = `Rs.${totals.total.toFixed(2)}`;
        
        // Handle order placement
        const checkoutForm = document.querySelector('.checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', placeOrder);
        }
    }
    
    /**
     * Place order
     */
    async function placeOrder(e) {
        e.preventDefault();
        
        try {
            const cart = getCart();
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            
            // Get current user
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser) {
                window.location.href = '/e_commerce/pages/pages/login.html';
                return;
            }
            
            // Create order items
            const orderItems = cart.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                category: item.category,
                prescription: item.prescription
            }));
            
            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const address = document.getElementById('address').value;
            const address2 = document.getElementById('address2').value;
            const country = document.getElementById('country').value;
            const state = document.getElementById('state').value;
            const zip = document.getElementById('zip').value;
            
            // Get payment details
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            const cardName = document.getElementById('cc-name').value;
            const cardNumber = document.getElementById('cc-number').value;
            const cardExpiration = document.getElementById('cc-expiration').value;
            const cardCvv = document.getElementById('cc-cvv').value;
            
            // Create order object
            const order = {
                userId: currentUser.id,
                userEmail: currentUser.email,
                items: orderItems,
                totalAmount: calculateCartTotals().total,
                status: 'Placed',
                shippingAddress: {
                    firstName,
                    lastName,
                    address,
                    address2,
                    country,
                    state,
                    zip
                },
                paymentDetails: {
                    paymentMethod,
                    cardName,
                    cardNumber: cardNumber ? cardNumber.substr(-4) : '', // Store only last 4 digits for security
                    expirationDate: cardExpiration,
                    cvv: '***' // Don't store actual CVV for security
                }
            };
            
            // Submit order to backend
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (!response.ok) {
                throw new Error('Failed to place order');
            }
            
            const placedOrder = await response.json();
            
            // Clear cart after successful order
            clearCart();
            
            // Store order ID in session for confirmation page
            sessionStorage.setItem('lastOrderId', placedOrder.id);
            
            // Redirect to confirmation page
            window.location.href = '/e_commerce/pages/pages/confirmation.html';
            
        } catch (error) {
            console.error('Error placing order:', error);
            showNotification('Failed to place order. Please try again.', 'error');
        }
    }
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initCart();
        console.log('Cart module loaded and initialized');
        
        // Initialize specific page functionality
        if (window.location.href.includes('cart.html')) {
            renderCartPage();
        } else if (window.location.href.includes('checkout.html')) {
            initCheckoutPage();
        }
    });
    
    // Public methods
    return {
        addItem: addToCart,
        removeItem: removeFromCart,
        updateQuantity: updateCartItemQuantity,
        clearCart: clearCart,
        getItems: getCart,
        getTotals: calculateCartTotals,
        refreshCart: renderCartPage
    };
})();

// Make Cart accessible globally
window.Cart = Cart;
console.log('Cart module registered globally');