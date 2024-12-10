import { createPaginationControls, updatePagination } from './pagination.js';
import { displayPage, displaySpecificEntry, wordSpecific, rootSpecific } from './dictSearch.js';
import { setTexts } from './loadTexts.js';
import { processRows } from './processRows.js';
import { getRelatedWordsByRoot, highlight } from './utils.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage) {
    let currentPage = 1; // Define currentPage
    let filteredRows = []; // Initialize filteredRows
    let previouslySelectedBox = null; // Track previously selected box

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
        pendingChangesContainer.style.display = changesList.length > 0 ? 'block' : 'none';
    };

    const addPendingChange = () => {
        let searchTerm = document.getElementById('dict-search-input').value.trim();
        let searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        let exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        let selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges = { ...pendingChanges, searchTerm, exactMatch, searchIn, filters: selectedFilters, rowsPerPage };
        updatePendingChangesList();
    };

    const applySettings = () => {
        let { searchTerm, exactMatch, searchIn, filters, rowsPerPage, sortOrder } = pendingChanges;
        let criteria = { searchTerm, exactMatch, searchIn, filters };
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
    let language = document.querySelector('meta[name="language"]').content || 'en';
    setTexts(language);

    document.getElementById('dict-search-input').addEventListener('input', addPendingChange);
    document.getElementById('dict-search-button').addEventListener('click', addPendingChange);
    document.getElementById('dict-add-search-button-popup').addEventListener('click', addPendingChange);
    document.getElementById('dict-apply-filter-button').addEventListener('click', addPendingChange);
    document.getElementById('dict-rows-per-page-input').addEventListener('input', (e) => {
        let value = parseInt(e.target.value, 10);
        if (value >= 5 && value <= 500) {
            pendingChanges.rowsPerPage = value;
            updatePendingChangesList();
        } else {
            displayWarning('dict-rows-warning', 'Please enter a value between 5 and 500');
        }
    });

    let applySettingsButton = document.getElementById('dict-apply-settings-button');
    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', applySettings);
    }

    let clearSettingsButton = document.getElementById('dict-clear-settings-button');
    if (clearSettingsButton) {
        clearSettingsButton.addEventListener('click', clearSettings);
    }

    let clearSearchButton = document.getElementById('dict-clear-search-button');
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
    let orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            console.log('Selected order:', pendingChanges.sortOrder);
            updatePendingChangesList();
        });
    }

    // Toggle filter options
    let toggleFilterButton = document.getElementById('dict-toggle-filter-button');
    if (toggleFilterButton) {
        toggleFilterButton.addEventListener('click', () => {
            let filterSortingContainer = document.getElementById('dict-filter-sorting-container');
            filterSortingContainer.classList.toggle('dict-filter-cont-hidden');
            filterSortingContainer.classList.toggle('dict-filter-cont-visible');
        });
    }

    // Initialize popups
    let advancedSearchButton = document.getElementById('dict-advanced-search-button');
    if (advancedSearchButton) {
        advancedSearchButton.addEventListener('click', () => {
            initAdvancedSearchPopup(allRows, rowsPerPage, displayPage);
        });
    }

    let viewStatisticsButton = document.getElementById('dict-view-statistics-button');
    if (viewStatisticsButton) {
        viewStatisticsButton.addEventListener('click', () => {
            initStatisticsPopup(allRows);
        });
    }

// Related words event handler
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.addEventListener('click', (e) => {
        const box = e.target.closest('.dictionary-box');
        if (!box) return;

        const rowId = parseInt(box.id.replace('entry-', ''), 10);
        const row = allRowsById[rowId];

        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected-word', 'selected-root');
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        if (box === previouslySelectedBox) {
            previouslySelectedBox = null;
            return; // Deselect the current box
        }

        // Highlight the clicked box
        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        // Display related words or derivative words
        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em'; // Make the font smaller

        if (row.type === 'root') {
            // Display derivative words for roots
            const derivativeWords = allRows.filter(r => r.type !== 'root' && r.morph && r.morph.includes(row.title) && r.id !== row.id);
            if (derivativeWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>Derivative Words:</strong> ${derivativeWords.map(dw => highlight(dw.title, pendingChanges.searchTerm)).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>Derivative Words:</strong> None found`;
            }
        } else {
            // Display related words for words
            const relatedWords = getRelatedWordsByRoot(row.morph, allRows).filter(rw => rw.id !== row.id);
            if (relatedWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>Related Words:</strong> ${relatedWords.map(rw => highlight(rw.title, pendingChanges.searchTerm)).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>Related Words:</strong> None found`;
            }
        }

        box.appendChild(relatedWordsElement);

        previouslySelectedBox = box; // Set the clicked box as the previously selected one
    });

    // Add event listeners for pagination buttons
    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetPage = parseInt(e.target.dataset.page, 10);
            goToPage(targetPage);
        });
    });

    function goToPage(pageNumber) {
        currentPage = pageNumber;
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        updatePaginationControls(currentPage, totalPages);
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, filteredRows, allRows);
    }

    // Initialize with the first page
    goToPage(1);
}
