import { createPaginationControls } from './pagination.js';
import { filterAndDisplayWord, displayPage, advancedSearch } from './dictSearch.js';
import { displayWarning } from './warnings.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, filteredRows) {
    let currentPage = 1; // Define currentPage

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            filterAndDisplayWord(searchTerm, '', '', allRows, allRowsById, rowsPerPage, displayPage);
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        filterAndDisplayWord(searchTerm, '', '', allRows, allRowsById, rowsPerPage, displayPage);
    });

    document.getElementById('clear-search-button').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
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
        const params = {
            word: document.getElementById('advanced-search-word').checked,
            root: document.getElementById('advanced-search-root').checked,
            definition: document.getElementById('advanced-search-definition').checked,
            etymology: document.getElementById('advanced-search-etymology').checked
        };

        const searchTerm = document.getElementById('advanced-search-input').value.trim();

        if (!params.word && !params.root && !params.definition && !params.etymology) {
            alert('Please select at least one search option.');
            return;
        }

        advancedSearch(params, allRows, rowsPerPage, displayPage);
    });
}
