document.addEventListener('DOMContentLoaded', function() {
    // Function to fix navigation links
    function fixNavigationLinks() {
        // Fix dropdown toggle behavior
        const dropdownToggles = document.querySelectorAll('.has-dropdown > a, .mobile-dropdown > a');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                // If this is a main page navigation link and not just a dropdown toggle
                if (this.getAttribute('href') && 
                    this.getAttribute('href') !== '#' && 
                    !this.getAttribute('href').startsWith('javascript')) {
                    // Navigate to the page
                    window.location.href = this.getAttribute('href');
                } else {
                    // Just toggle dropdown
                    e.preventDefault();
                    const parent = this.parentElement;
                    const dropdown = parent.querySelector('.dropdown, .mobile-dropdown-menu');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                    }
                }
            });
        });

        // Fix all navigation links to ensure they have proper paths
        document.querySelectorAll('a').forEach(link => {
            // Fix medicine links specifically
            if (link.textContent.trim() === 'Medicines' && 
                (!link.getAttribute('href') || 
                 link.getAttribute('href') === '#' || 
                 link.getAttribute('href') === 'javascript:void(0)')) {
                link.setAttribute('href', '/e_commerce/pages/pages/medicines.html');
            }
            
            // Add click handler for debugging and to ensure navigation works
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Skip links that are meant to be handled by other code
                if (href && 
                    href !== '#' && 
                    !href.startsWith('javascript') && 
                    !this.classList.contains('dropdown-toggle') &&
                    !this.parentElement.classList.contains('has-dropdown') &&
                    !this.parentElement.classList.contains('mobile-dropdown')) {
                    
                    console.log("Navigating to:", href);
                }
            });
        });
    }

    // Run the fix function after a short delay to ensure DOM is fully loaded
    setTimeout(fixNavigationLinks, 500);
    
    // Also run it when the header is loaded
    const headerElement = document.getElementById('dynamic-header');
    if (headerElement) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    fixNavigationLinks();
                }
            });
        });
        
        observer.observe(headerElement, { childList: true });
    }
});