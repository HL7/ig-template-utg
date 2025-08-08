
// Helper functions for localStorage
function saveFilterState(type, key, value) {
    try {
        localStorage.setItem(`${type}_tbl_filter_${key}`, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save filter state to localStorage:', e);
    }
}

function loadFilterState(type, key, defaultValue) {
    try {
        const stored = localStorage.getItem(`${type}_tbl_filter_${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn('Could not load filter state from localStorage:', e);
        return defaultValue;
    }
}

// Initialize filters and event listeners
document.addEventListener('DOMContentLoaded', function() {
    var type = document.querySelector('.filtered-table').getAttribute('data-resource-type');
    var cs = type == 'CodeSystem';

    // Set up filter inputs
    const filterInputs = [
        { id: 'filter-identity', key: 'identity' },
        { id: 'filter-name', key: 'name' },
        { id: 'filter-version', key: 'version' },
        { id: 'filter-status', key: 'status' },
        ...(cs ? [{ id: 'filter-content', key: 'content' }] : []),
        { id: 'filter-owner', key: 'owner' },
        { id: 'filter-copyright', key: 'copyright' },
        { id: 'filter-date', key: 'date' },
        { id: 'filter-desc', key: 'desc' }
    ];

    // Add event listeners for text filters
    filterInputs.forEach(filter => {
        const input = document.getElementById(filter.id);
        if (input) {
            // Load and restore saved value from localStorage
            const savedValue = loadFilterState(type, filter.key, '');
            input.value = savedValue;
            
            // Add event listener
            input.addEventListener('input', function() {
                saveFilterState(type, filter.key, this.value);
                applyFilters();
            });
        }
    });


    // Apply initial filters
    applyFilters();
});

function applyFilters() {
    var type = document.querySelector('.filtered-table').getAttribute('data-resource-type');
    var cs = type == 'CodeSystem';
    var c = 0;  

    const dataRows = document.querySelectorAll('.data-row');
    var t = dataRows.length; 

    // Load current filter values from localStorage
    const filterValues = {
        identity: loadFilterState(type, 'identity', ''),
        name: loadFilterState(type, 'name', ''),
        version: loadFilterState(type, 'version', ''),
        status: loadFilterState(type, 'status', ''),
        content: cs ? loadFilterState(type, 'content', '') : '',
        owner: loadFilterState(type, 'owner', ''),
        copyright: loadFilterState(type, 'copyright', ''),
        date: loadFilterState(type, 'date', ''),
        desc: loadFilterState(type, 'desc', '')
    };
    
    dataRows.forEach(row => {
        let shouldShow = true;
        const cells = row.querySelectorAll('td');
        
        // Check text filters for each column
        const filters = [
            { value: filterValues.identity, cellIndex: 0 },
            { value: filterValues.name, cellIndex: 1 },
            { value: filterValues.version, cellIndex: 2 },
            { value: filterValues.status, cellIndex: 3 },
            { value: filterValues.content, cellIndex: cs ? 4 : -1},
            { value: filterValues.owner, cellIndex: cs ? 5 : 4 },
            { value: filterValues.copyright, cellIndex: cs ? 6 : 5 },
            { value: filterValues.date, cellIndex: cs ? 7 : 6},
            { value: filterValues.desc, cellIndex: cs ? 8 : 7 }
        ];

        filters.forEach(filter => {
            if (filter.value && filter.cellIndex >= 0 && cells[filter.cellIndex]) {
                const cell = cells[filter.cellIndex];
                const cellText = cell.textContent.toLowerCase();
                const cellTitle = cell.getAttribute('title') || '';
                
                // Get title attributes from any links inside the cell
                const linkTitles = Array.from(cell.querySelectorAll('a'))
                    .map(a => a.getAttribute('title') || '')
                    .join(' ');
                
                const filterText = filter.value.toLowerCase();
                
                // Check cell text, cell title, and link titles
                const matchesFilter = 
                    cellText.includes(filterText) || 
                    cellTitle.toLowerCase().includes(filterText) ||
                    linkTitles.toLowerCase().includes(filterText);
                
                if (!matchesFilter) {
                    shouldShow = false;
                }
            }
        }); 

        // Apply visibility
        if (shouldShow) {
            c++;
            row.classList.remove('hidden-row');
        } else {
            row.classList.add('hidden-row');
        }
    });
  document.querySelector('.table-filter-summary').textContent = `Showing ${c} of ${t} entries`;
}

// Function to clear all filters
function clearAllFilters() {
    const filterInputs = document.querySelectorAll('.filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const hideUnchangedCheckbox = document.getElementById('hideUnchanged');
    if (hideUnchangedCheckbox) {
        hideUnchangedCheckbox.checked = false;
    }

    // Clear localStorage for all filter keys
    const filterKeys = ['identity', 'name', 'version', 'status', ...(cs ? ['content'] : []), 'owner', 'copyright', 'date', 'desc'];
    filterKeys.forEach(key => {
        try {
            localStorage.removeItem(`tableFilter_${key}`);
        } catch (e) {
            console.warn('Could not clear filter from localStorage:', e);
        }
    });

    applyFilters();
}

// Optional: Function to export filter settings
function exportFilterSettings() {
    var type = document.querySelector('.filtered-table').getAttribute('data-resource-type');
    var cs = type == 'CodeSystem';

    const filterKeys = ['identity', 'name', 'version', 'status', ...(cs ? ['content'] : []), 'owner', 'copyright', 'date', 'desc'];
    const settings = {};
    
    filterKeys.forEach(key => {
        settings[key] = loadFilterState(type, key, key === 'hideUnchanged' ? false : '');
    });
    
    return JSON.stringify(settings, null, 2);
}

// Optional: Function to import filter settings
function importFilterSettings(settingsJson) {
    var type = document.querySelector('.filtered-table').getAttribute('data-resource-type');
    var cs = type == 'CodeSystem';

    try {
        const settings = JSON.parse(settingsJson);
        
        Object.keys(settings).forEach(key => {
            saveFilterState(type, key, settings[key]);
        });
        
        // Refresh the page or reload filter inputs
        location.reload();
    } catch (e) {
        console.error('Could not import filter settings:', e);
        alert('Invalid settings format');
    }
}
