document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.querySelector('#category');
    const priceFilter = document.querySelector('#price');
    const productCards = document.querySelectorAll('.product-card');

    function filterProducts() {
        const selectedCategory = categoryFilter.value;
        const selectedPrice = priceFilter.value;

        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardPrice = parseFloat(card.dataset.price);

            // Category filter
            const categoryMatch = selectedCategory === 'all' || selectedCategory === cardCategory;

            // Price filter
            let priceMatch = true;
            if (selectedPrice !== 'all') {
                if (selectedPrice === '0-20') {
                    priceMatch = cardPrice <= 20;
                } else if (selectedPrice === '20-50') {
                    priceMatch = cardPrice > 20 && cardPrice <= 50;
                } else if (selectedPrice === '50+') {
                    priceMatch = cardPrice > 50;
                }
            }

            // Show or hide product card
            if (categoryMatch && priceMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Add event listeners to filters
    categoryFilter.addEventListener('change', filterProducts);
    priceFilter.addEventListener('change', filterProducts);

    // Initial filter on page load
    filterProducts();
});