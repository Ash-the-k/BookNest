// Function to toggle description
function toggleDescription() {
    const content = document.getElementById('descContent');
    const btn = document.getElementById('readMoreBtn');
    
    if (content.classList.contains('expanded')) {
        // Close it
        content.classList.remove('expanded');
        btn.textContent = 'Read remainder...';
    } else {
        // Open it
        content.classList.add('expanded');
        btn.textContent = 'Close entry';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar Search Expand Logic
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.getElementById('navSearchInput');
    const searchForm = document.getElementById('navSearchForm');

    if(searchToggle && searchInput) {
        searchToggle.addEventListener('click', (e) => {
            if (searchInput.style.display === 'none' || searchInput.style.display === '') {
                // Expand
                searchInput.style.display = 'block';
                searchInput.focus();
                // Add animation class if needed
                searchInput.style.width = '200px'; 
                e.preventDefault(); // Don't submit yet
            } else {
                // If already open and has text, submit
                if(searchInput.value.trim() !== "") {
                    searchForm.submit();
                } else {
                    // Collapse if empty
                    searchInput.style.display = 'none';
                }
            }
        });
    }

    // Initialize Bootstrap tooltips if any
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});