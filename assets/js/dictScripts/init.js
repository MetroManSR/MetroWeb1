import { createPaginationControls } from './pagination.js';
import { displayPage } from './dictSearch.js';
import { displayWarning } from './warnings.js';
import { processRows } from './processRows.js';
import { setTexts } from './loadTexts.js';
import { initAdvancedSearchPopup } from './popups.js';
import { createDictionaryBox, createNoMatchBox, createLoadingBox, updateFloatingText, renderBox } from './boxes.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage) {
    let currentPage = 1; // Define currentPage
    let filteredRows = []; // Initialize filteredRows

    const updatePendingChangesList = () => {
        const pendingChangesContainer = document.getElementById('dict-pending-changes');
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage, sortOrder } = pendingChanges;
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
        if (sortOrder) changesList.push(`Sort Order: ${sortOrder}`);

        pendingChangesContainer.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : 'No pending changes';
    };

    const addPendingChange = () => {
        const searchTerm = document.getElementById('dict-search-input').value.trim();
        const searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges = { ...pendingChanges, searchTerm, exactMatch, searchIn, filters: selectedFilters, rowsPerPage };
        updatePendingChangesList();
    };

    const applySettings = () => {
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage, sortOrder } = pendingChanges;
        const criteria = { searchTerm, exactMatch, searchIn, filters };
        processRows(allRows, criteria, rowsPerPage, displayPage, currentPage, sortOrder);
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20, sortOrder: 'titleup' };
        updatePendingChangesList();
    };

    const clearSettings = () => {
        document.getElementById('dict-search-input').value = '';
        document.getElementById('dict-search-in-word').checked = false;
        document.getElementById('dict-search-in-root').checked = false;
        document.getElementById('dict-search-in-definition').checked = false;
        document.getElementById('dict-search-in-etymology').checked = false;
        document.getElementById('dict-exact-match').checked = false;
        document.getElementById('dict-word-filter').selectedIndex = -1;
        document.getElementById('dict-rows-per-page-input').value = 20;
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20, sortOrder: 'titleup' };
        updatePendingChangesList();
        processRows(allRows, {}, 20, displayPage, currentPage, 'titleup');
    };

    // Set texts based on the language
    const language = document.querySelector('meta[name="language"]').content || 'en';
    setTexts(language);

    document.getElementById('dict-search-input').addEventListener('input', addPendingChange);
    document.getElementById('dict-search-button').addEventListener('click', addPendingChange);
    document.getElementById('dict-add-search-button-popup').addEventListener('click', addPendingChange);
    document.getElementById('dict-apply-filter-button').addEventListener('click', addPendingChange);
    document.getElementById('dict-rows-per-page-input').addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 5 && value <= 500) {
            pendingChanges.rowsPerPage = value;
            updatePendingChangesList();
        } else {
            displayWarning('dict-rows-warning', 'Please enter a value between 5 and 500');
        }
    });

    const applySettingsButton = document.getElementById('dict-apply-settings-button');
    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', applySettings);
    }

    const clearSettingsButton = document.getElementById('dict-clear-settings-button');
    if (clearSettingsButton) {
        clearSettingsButton.addEventListener('click', clearSettings);
    }

    const clearSearchButton = document.getElementById('dict-clear-search-button');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            document.getElementById('dict-search-input').value = '';
            document.getElementById('dict-search-in-word').checked = false;
            document.getElementById('dict-search-in-root').checked = false;
            document.getElementById('dict-search-in-definition').checked = false;
            document.getElementById('dict-search-in-etymology').checked = false;
            document.getElementById('dict-exact-match').checked = false;
            pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20, sortOrder: 'titleup' };
            updatePendingChangesList();
            window.history.pushState({}, document.title, window.location.pathname); // Clear the URL
            processRows(allRows, {}, rowsPerPage, displayPage, currentPage, 'titleup');
        });
    }

    // Sorting functionality
    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            console.log('Selected order:', pendingChanges.sortOrder);
            updatePendingChangesList();
        });
    }
}
