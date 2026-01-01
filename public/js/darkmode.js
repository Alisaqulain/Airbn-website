// Dark mode functionality
(function() {
    const darkModeKey = 'darkMode';
    const darkModeClass = 'dark-mode';
    
    // Check saved preference or default to light mode
    const isDarkMode = localStorage.getItem(darkModeKey) === 'true';
    
    // Apply dark mode on page load
    if (isDarkMode) {
        document.documentElement.classList.add(darkModeClass);
    }
    
    // Toggle function
    window.toggleDarkMode = function() {
        const html = document.documentElement;
        const isDark = html.classList.toggle(darkModeClass);
        localStorage.setItem(darkModeKey, isDark);
        updateToggleIcon(isDark);
    };
    
    // Update toggle icon
    function updateToggleIcon(isDark) {
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }
    
    // Initialize icon on load
    document.addEventListener('DOMContentLoaded', function() {
        updateToggleIcon(isDarkMode);
    });
})();

