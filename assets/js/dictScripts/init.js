import { createPaginationControls } from './pagination.js';
import { filterAndDisplayWord, displayPage, advancedSearch } from './dictSearch.js';
import { displayWarning } from './warnings.js';

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
        const advancedSearchParams = {
            searchTerm: searchTerm,
            word: searchIn.word,
            root: searchIn.root,
            definition: searchIn.definition,
            etymology: searchIn.etymology,
            exactMatch: exactMatch
        };

        const selectedFilters = Array.from(document.getElementById('word-filter').selectedOptions).map(option => option.value);

        if (!searchTerm && selectedFilters.length === 0) {
            // No search term and no filters selected, show all rows
            filterAndDisplayWord('', '', '', allRows, allRowsById, rowsPerPage, displayPage);
        } else if (searchTerm && (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology)) {
            // Perform advanced search
            advancedSearch(advancedSearchParams, allRows, rowsPerPage, displayPage);
        } else {
            // Perform basic search with filters
            filterAndDisplayWord(searchTerm, '', '', allRows, allRowsById, rowsPerPage, displayPage);
        }
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
        filterAndDisplayWord('', '', '', allRows, allRowsById, rowsPerPage, displayPage);
    });

    document.getElementById('rows-per-page-button').addEventListener('click', () => {
        const value = parseInt(document.getElementById('rows-per-page-input').value, 10);
        if (value >= 5 && value <= 500) {
            rowsPerPage = value;
            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            filterAndDisplayWord('', '', '', allRows, allRowsById, rowsPerPage, displayPage);
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
