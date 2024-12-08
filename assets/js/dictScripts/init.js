import { createPaginationControls } from './pagination.js';
import { displayPage } from './dictSearch.js';
import { displayWarning } from './warnings.js';
import { processRows } from './processRows.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, filteredRows) {
    let currentPage = 1; // Define currentPage

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

        const criteria = {
            searchTerm: searchTerm,
            exactMatch: exactMatch,
            searchIn: searchIn,
            filters: selectedFilters
        };

        processRows(allRows, criteria, rowsPerPage, displayPage, currentPage);
    };

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            triggerSearch();
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        triggerSearch();
    });

    document.getElementById('clear-search-button').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('search-in-word').checked = false;
        document.getElementById('search-in-root').checked = false;
        document.getElementById('search-in-definition').checked = false;
        document.getElementById('search-in-etymology').checked = false;
        document.getElementById('exact-match').checked = false;
        window.history.pushState({}, document.title, window.location.pathname); // Clear the URL
        processRows(allRows, {}, rowsPerPage, displayPage, currentPage);
    });

    document.getElementById('rows-per-page-button').addEventListener('click', () => {
        const value = parseInt(document.getElementById('rows-per-page-input').value, 10);
        if (value >= 5 && value <= 500) {
            rowsPerPage = value;
            processRows(allRows, {}, rowsPerPage, displayPage, currentPage);
        } else {
            displayWarning('rows-warning', 'Please enter a value between 5 and 500');
        }
    });

    // Advanced search form submission
    document.getElementById('advanced-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        triggerSearch();
    });
}
