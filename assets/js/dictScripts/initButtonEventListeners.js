import { processAllSettings } from './processRows.js';
import { updatePendingChangesList, defaultPendingChanges } from './initFormEventListeners.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js';
import { addRelatedWordsEventListeners, addIconEventListeners } from './boxEvents.js';

export function initializeButtonEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage) {
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
            addRelatedWordsEventListeners(allRows);
            addIconEventListeners(allRows);
        });
    }

    const cleanSettingsButton = document.getElementById('dict-clear-settings-button');
    if (cleanSettingsButton) {
        cleanSettingsButton.addEventListener('click', () => {
            Object.assign(pendingChanges, defaultPendingChanges);

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
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }
              }
