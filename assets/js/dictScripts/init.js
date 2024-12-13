import { processAllSettings } from './processRows.js';
import { highlight } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js';
import { addRelatedWordsEventListeners, addIconEventListeners } from './eventListeners.js';

export async function updatePendingChangesList(pendingChanges, language) {
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (!pendingChangesElement) return;

    const { searchTerm, exactMatch, searchIn, filters, ignoreDiacritics, startsWith, endsWith, rowsPerPage } = pendingChanges;
    let changesList = [];

    if (searchTerm) {
        const translatedSearchTerm = await getTranslatedText('searchTerm', language);
        changesList.push(`<strong>${translatedSearchTerm}</strong>: "${searchTerm}"`);
    }
    if (exactMatch) {
        const translatedExactMatch = await getTranslatedText('exactMatch', language);
        changesList.push(`<strong>${translatedExactMatch}</strong>: ${translatedExactMatch}`);
    }
    if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
        let searchInFields = [];
        if (searchIn.word) searchInFields.push(await getTranslatedText('searchInWord', language));
        if (searchIn.root) searchInFields.push(await getTranslatedText('searchInRoot', language));
        if (searchIn.definition) searchInFields.push(await getTranslatedText('searchInDefinition', language));
        if (searchIn.etymology) searchInFields.push(await getTranslatedText('searchInEtymology', language));
        const translatedSearchIn = await getTranslatedText('searchIn', language);
        changesList.push(`<strong>${translatedSearchIn}</strong>: ${searchInFields.join(', ')}`);
    }
    if (ignoreDiacritics) {
        const translatedIgnoreDiacritics = await getTranslatedText('ignoreDiacritics', language);
        changesList.push(`<strong>${translatedIgnoreDiacritics}</strong>`);
    }
    if (startsWith) {
        const translatedStartsWith = await getTranslatedText('startsWith', language);
        changesList.push(`<strong>${translatedStartsWith}</strong>`);
    }
    if (endsWith) {
        const translatedEndsWith = await getTranslatedText('endsWith', language);
        changesList.push(`<strong>${translatedEndsWith}</strong>`);
    }
    if (filters.length > 0) {
        const translatedFilters = await getTranslatedText('filters', language);
        const translatedFilterValues = await Promise.all(filters.map(async filter => await getTranslatedText(filter, language)));
        changesList.push(`<strong>${translatedFilters}</strong>: ${translatedFilterValues.join(', ')}`);
    }
    if (rowsPerPage !== 20) {
        const translatedRowsPerPage = await getTranslatedText('rowsPerPage', language);
        changesList.push(`<strong>${translatedRowsPerPage}</strong>: ${rowsPerPage}`);
    }

    const translatedPendingChanges = await getTranslatedText('pendingChanges', language);
    const translatedNoPendingChanges = await getTranslatedText('noPendingChanges', language);
    pendingChangesElement.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : `<p>${translatedNoPendingChanges}</p>`;
}

export function initializeEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage) {
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

    const filterSelect = document.getElementById('dict-word-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            pendingChanges.filters = Array.from(filterSelect.selectedOptions).map(option => option.value);
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
            pendingChanges = {
                searchTerm: '',
                exactMatch: false,
                searchIn: { word: true, root: true, definition: false, etymology: false },
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

    const searchInput = document.getElementById('dict-search-input');
    const predictionBox = document.getElementById('dict-search-predictions');

    // Handle input event for the search input
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        predictionBox.style.width = `${searchInput.offsetWidth}px`;
        
        if (searchTerm.length === 0) {
            predictionBox.innerHTML = '';
            pendingChanges.searchTerm = ''; // Clear searchTerm in pending changes
            updatePendingChangesList(pendingChanges, language); // Update pending changes list
            return;
        }

        const searchIn = pendingChanges.searchIn;

        // Generate predictions based on the current search criteria
        const predictions = allRows
            .filter(row => {
                const titleMatch = searchIn.word && row.type === 'word' && row.title.toLowerCase().includes(searchTerm);
                const rootMatch = searchIn.root && row.type === 'root' && row.title.toLowerCase().includes(searchTerm);
                const definitionMatch = searchIn.definition && row.meta.toLowerCase().includes(searchTerm);
                const etymologyMatch = searchIn.etymology && row.morph.some(morphItem => morphItem.toLowerCase().includes(searchTerm));
                return titleMatch || rootMatch || definitionMatch || etymologyMatch;
            })
            .slice(0, 10) // Limit to the first 10 matches
            .map(row => row.title);

        if (predictions.length === 0) {
            predictionBox.innerHTML = '';
            pendingChanges.searchTerm = searchTerm; // Update searchTerm in pending changes
            updatePendingChangesList(pendingChanges, language); // Update pending changes list
            return;
        }

        predictionBox.innerHTML = predictions.map(title => `<div>${highlight(title, searchTerm, pendingChanges.searchIn, { title })}</div>`).join('');
    });

    // Event listeners for advanced search checkboxes
    document.getElementById('dict-search-in-word').addEventListener('change', (event) => {
        pendingChanges.searchIn.word = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-root').addEventListener('change', (event) => {
        pendingChanges.searchIn.root = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-definition').addEventListener('change', (event) => {
        pendingChanges.searchIn.definition = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-etymology').addEventListener('change', (event) => {
        pendingChanges.searchIn.etymology = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-exact-match').addEventListener('change', (event) => {
        pendingChanges.exactMatch = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-ignore-diacritics').addEventListener('change', (event) => {
        pendingChanges.ignoreDiacritics = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-starts-with').addEventListener('change', (event) => {
        pendingChanges.startsWith = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-ends-with').addEventListener('change', (event) => {
        pendingChanges.endsWith = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    // Handle form submission for rows per page input
    const rowsPerPageInput = document.getElementById('dict-rows-per-page-input');
    if (rowsPerPageInput) {
        rowsPerPageInput.addEventListener('change', (event) => {
            pendingChanges.rowsPerPage = parseInt(event.target.value, 10) || 20;
            updatePendingChangesList(pendingChanges, language);
        });
    }
    }
