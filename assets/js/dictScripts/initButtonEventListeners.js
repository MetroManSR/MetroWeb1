import { processAllSettings, displayPage } from './processRows.js';
import { universalPendingChanges, updateUniversalPendingChanges, updatePendingChangesList, defaultPendingChanges, initializeFormEventListeners } from './initFormEventListeners.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js';
import { updatePagination } from './pagination.js';
import { boxClickListener } from "./boxEvents.js";
import { filteredRows } from "../mainDict.js";

export async function initializeButtonEventListeners(allRows, rowsPerPage, currentSortOrder) {
    console.log('Initializing Button Event Listeners');
    
    const language = document.querySelector('meta[name="language"]').content || 'en';
    let currentPage = 1;
    let pendingChanges = universalPendingChanges ? universalPendingChanges : defaultPendingChanges;
    
    // Ensure pending changes are visible on page load
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (pendingChangesElement) {
        pendingChangesElement.style.display = 'block';
    }

    await initializeFormEventListeners(allRows, rowsPerPage);

    await updatePendingChangesList(language);

    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            updateUniversalPendingChanges(pendingChanges);
            updatePendingChangesList(language);
        });
    }

    await boxClickListener(allRows, language, pendingChanges);

    const filterSelect = document.getElementById('dict-word-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            pendingChanges.filters = Array.from(filterSelect.selectedOptions).map(option => option.value);
            updateUniversalPendingChanges(pendingChanges);
            updatePendingChangesList(language);
            
        });
    }

    const toggleFilterButton = document.getElementById('dict-toggle-filter-button');
if (toggleFilterButton) {
    toggleFilterButton.addEventListener('click', () => {
        const filterSortingContainer = document.getElementById('dict-filter-sorting-container');
        if (filterSortingContainer) {
            console.log('Current classes before toggle: ', filterSortingContainer.className);

            await filterSortingContainer.classList.toggle('dict-filter-cont-hidden');
            await filterSortingContainer.classList.toggle('dict-filter-cont-visible');

            console.log('Current classes after toggle: ', filterSortingContainer.className);
        } else {
            console.error('filterSortingContainer not found');
        }
    });
} else {
    console.error('toggleFilterButton not found');
}
    
    const advancedSearchButton = document.getElementById('dict-advanced-search-button');
    if (advancedSearchButton) {
        advancedSearchButton.addEventListener('click', () => {
            initAdvancedSearchPopup(allRows, rowsPerPage, language);
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
        applySettingsButton.addEventListener('click', async () => {
            await processAllSettings(allRows, rowsPerPage, currentPage, pendingChanges.sortOrder);
        });
    }

    const clearSettingsButton = document.getElementById('dict-clear-settings-button');
    if (clearSettingsButton) {
        clearSettingsButton.addEventListener('click', async () => {
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
                sortOrder: 'titleup'
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
            updateUniversalPendingChanges(pendingChanges);
            updatePendingChangesList(language);
            await processAllSettings(allRows, pendingChanges.rowsPerPage, currentPage, pendingChanges.sortOrder);
            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

    const clearSearchButton = document.getElementById('dict-clear-search-button');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', async () => {
            pendingChanges.searchTerm = '';
            document.getElementById('dict-search-input').value = '';
            updateUniversalPendingChanges(pendingChanges);
            updatePendingChangesList(language);
            await processAllSettings(allRows, rowsPerPage, currentPage, pendingChanges.sortOrder);
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
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, allRows);
    }
    
    // Initial page load
    if (filteredRows) {
        navigateToPage(1);
    }

    console.log('Button Event Listeners initialized');
}
