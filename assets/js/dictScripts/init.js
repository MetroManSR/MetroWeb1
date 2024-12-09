import { createPaginationControls } from './pagination.js';
import { displayPage } from './dictSearch.js';
import { displayWarning } from './warnings.js';
import { processRows } from './processRows.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, filteredRows) {
    let currentPage = 1; // Define currentPage
    let pendingChanges = {
        searchTerm: '',
        exactMatch: false,
        searchIn: { word: true, root: true, definition: false, etymology: false },
        filters: [],
        rowsPerPage: 20
    };

    const updatePendingChangesList = () => {
        const pendingChangesContainer = document.getElementById('pending-changes');
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage } = pendingChanges;
        let changesList = [];

        if (searchTerm) changesList.push(`Search Term: "${searchTerm}"`);
        if (exactMatch) changesList.push(`Exact Match: On`);
        if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
            let searchInFields = [];
            if (searchIn.word) searchInFields.push('Word');
            if (searchIn.root) searchInFields.push('Root');
            if (searchIn.definition) searchInFields.push('Definition');
            if (searchIn.etymology) searchInFields.push('Etymology');
            changesList.push(`Search In: ${searchInFields.join(', ')}`);
        }
        if (filters.length > 0) changesList.push(`Filters: ${filters.join(', ')}`);
        if (rowsPerPage !== 20) changesList.push(`Rows Per Page: ${rowsPerPage}`);

        pendingChangesContainer.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : 'No pending changes';
    };

    const triggerSearch = () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        const searchIn = {
            word: document.getElementById('search-in-word')?.checked || false,
            root: document.getElementById('search-in-root')?.checked || false,
            definition: document.getElementById('search-in-definition')?.checked || false,
            etymology: document.getElementById('search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('exact-match')?.checked || false;
        const selectedFilters = Array.from(document.getElementById('word-filter').selectedOptions).map(option => option.value);

        pendingChanges = { searchTerm, exactMatch, searchIn, filters: selectedFilters, rowsPerPage };
        updatePendingChangesList();
    };

    document.getElementById('search-input').addEventListener('input', triggerSearch);

    document.getElementById('search-button').addEventListener('click', () => {
        const { searchTerm, exactMatch, searchIn, filters } = pendingChanges;
        const criteria = { searchTerm, exactMatch, searchIn, filters };
        processRows(allRows, criteria, rowsPerPage, displayPage, currentPage);
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20 };
        updatePendingChangesList();
    });

    document.getElementById('clear-search-button').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('search-in-word').checked = false;
        document.getElementById('search-in-root').checked = false;
        document.getElementById('search-in-definition').checked = false;
        document.getElementById('search-in-etymology').checked = false;
        document.getElementById('exact-match').checked = false;
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20 };
        updatePendingChangesList();
        window.history.pushState({}, document.title, window.location.pathname); // Clear the URL
        processRows(allRows, {}, rowsPerPage, displayPage, currentPage);
    });

    document.getElementById('rows-per-page-input').addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 5 && value <= 500) {
            pendingChanges.rowsPerPage = value;
            updatePendingChangesList();
        } else {
            displayWarning('rows-warning', 'Please enter a value between 5 and 500');
        }
    });

    document.getElementById('apply-settings-button').addEventListener('click', () => {
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage } = pendingChanges;
        const criteria = { searchTerm, exactMatch, searchIn, filters };
        processRows(allRows, criteria, rowsPerPage, displayPage, currentPage);
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20 };
        updatePendingChangesList();
    });

    // Advanced search form submission
    document.getElementById('advanced-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        triggerSearch();
    });

    // Remove old apply and submit buttons except for search button
    document.getElementById('apply-filters-button')?.remove();
    document.getElementById('apply-search-button')?.remove();

    // Popup window functionality for advanced search
    document.getElementById('advanced-search-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.add('active');
        document.getElementById('popup-overlay').classList.add('active');
    });

    document.getElementById('close-popup-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    // Advanced search popup form submission
    document.getElementById('apply-search-button-popup').addEventListener('click', () => {
        triggerSearch();
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });
}
