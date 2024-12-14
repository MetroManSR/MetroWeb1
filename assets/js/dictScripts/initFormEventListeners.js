import { 
    processAllSettings 
} from './processRows.js';
import { 
    universalPendingChanges, 
    updatePendingChangesList, 
    defaultPendingChanges, 
    updateUniversalPendingChanges 
} from './initFormEventListeners.js';
import { 
    initAdvancedSearchPopup, 
    initStatisticsPopup 
} from './popups.js';
import { 
    filteredRows 
} from './processRows.js';
import { 
    boxClickListener 
} from './boxEvents.js';

export function initializeButtonEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage) {
    console.log('Initializing Button Event Listeners');

    // Ensure pendingChanges is properly initialized
    if (!pendingChanges || pendingChanges.length === 0) {
        pendingChanges = universalPendingChanges ?? defaultPendingChanges;
        updateUniversalPendingChanges(pendingChanges);
    }

    const language = document.querySelector('meta[name="language"]').content || 'en';
    let currentPage = 1;

    // Ensure pendingChanges list is visible on page load
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (pendingChangesElement) {
        pendingChangesElement.style.display = 'block';
    }

    updatePendingChangesList(pendingChanges, language);

    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            updatePendingChangesList(pendingChanges, language);
            updateUniversalPendingChanges(pendingChanges);
        });
    }

    const filterSelect = document.getElementById('dict-word-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            pendingChanges.filters = Array.from(filterSelect.selectedOptions).map(option => option.value);
            updatePendingChangesList(pendingChanges, language);
            updateUniversalPendingChanges(pendingChanges);
        });
    }

    const toggleFilterButton = document.getElementById('dict-toggle-filter-button');
    if (toggleFilterButton) {
        toggleFilterButton.addEventListener('click', () => {
            const filterSortingContainer = document.getElementById('dict-filter-sorting-container');
            filterSortingContainer.classList.toggle('dict-filter-cont-hidden');
            filterSortingContainer.classList.toggle('dict-filter-cont-visible');
        });
    }

    const advancedSearchButton = document.getElementById('dict-advanced-search-button');
    if (advancedSearchButton) {
        advancedSearchButton.addEventListener('click', () => {
            initAdvancedSearchPopup(allRows, rowsPerPage, displayPage, pendingChanges);
        });
    }

    const viewStatisticsButton = document.getElementById('dict-view-statistics-button');
    if (viewStatisticsButton) {
        viewStatisticsButton.addEventListener('click', () => {
            initStatisticsPopup(allRows);
        });
    }

    const applySettingsButton = document.getElementById('dict-apply-settings-button');
    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', () => {
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
        });
    }

    const cleanSettingsButton = document.getElementById('dict-clear-settings-button');
    if (cleanSettingsButton) {
        cleanSettingsButton.addEventListener('click', () => {
            pendingChanges = {
                searchTerm: '',
                exactMatch: false,
                searchIn: {
                    word: true,
                    root: true,
                    definition: true,
                    etymology: false
                },
                filters: [],
                rowsPerPage: 20,
                sortOrder: 'titleup' // Default sort order
            };

            // Reset form fields in the advanced search popup
            document.getElementById('dict-search-input').value = '';
            document.getElementById('dict-search-in-word').checked = true;
            document.getElementById('dict-search-in-root').checked = true;
            document.getElementById('dict-search-in-definition').checked = true;
            document.getElementById('dict-search-in-etymology').checked = false;
            document.getElementById('dict-exact-match').checked = false;

            // Reset selected filters
            const wordFilterSelect = document.getElementById('dict-word-filter');
            Array.from(wordFilterSelect.options).forEach(option => {
                option.selected = false;
            });

            updatePendingChangesList(pendingChanges, language);
            updateUniversalPendingChanges(pendingChanges);
            processAllSettings(pendingChanges, allRows, pendingChanges.rowsPerPage, displayPage, 1, pendingChanges.sortOrder);

            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

    const cleanSearchButton = document.getElementById('dict-clear-search-button');
    if (cleanSearchButton) {
        cleanSearchButton.addEventListener('click', () => {
            pendingChanges.searchTerm = '';
            document.getElementById('dict-search-input').value = '';
            updatePendingChangesList(pendingChanges, language);
            updateUniversalPendingChanges(pendingChanges);
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);

            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

    const searchInput = document.getElementById('dict-search-input');
    const predictionBox = document.getElementById('dict-search-predictions');

    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetPage = parseInt(e.target.dataset.page, 10);
            if (!isNaN(targetPage)) {
                navigateToPage(targetPage);
            }
        });
    });

    function navigateToPage(pageNumber) {
        if (!isNaN(pageNumber) && pageNumber >= 1) {
            currentPage = pageNumber;
        } else {
            currentPage = 1;
        }

        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        updatePagination(currentPage, totalPages);
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, filteredRows, allRows);
    }

    if (filteredRows) {
        navigateToPage(1);
    }

    console.log('Button Event Listeners initialized');
                                        }
