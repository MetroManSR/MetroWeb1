import { createPaginationControls } from './pagination.js';
import { filterAndDisplayWord, displayPage } from './dictSearch.js';
import { displayWarning } from './warnings.js';

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, filteredRows) {
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
        displayPage(1, rowsPerPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);
    });

    document.getElementById('rows-per-page-button').addEventListener('click', () => {
        const value = parseInt(document.getElementById('rows-per-page-input').value, 10);
        if (value >= 5 && value <= 500) {
            rowsPerPage = value;
            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            displayPage(1, rowsPerPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);
        } else {
            displayWarning('rows-warning', 'Please enter a value between 5 and 500');
        }
    });
}
