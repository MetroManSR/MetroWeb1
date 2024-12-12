import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox, updateFloatingText, createDictionaryBox, createNoMatchBox } from './boxes.js';

/**
 * Displays the specified page of results.
 *
 * @param {number} page - The page number to display.
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {string} searchTerm - The search term used to filter results.
 * @param {Object} searchIn - An object specifying which fields to search in.
 * @param {boolean} exactMatch - Whether to search for exact matches.
 * @param {Array} filteredRows - The filtered array of dictionary entries.
 * @param {Array} allRows - The array of all dictionary entries.
 */
export function displayPage(page, rowsPerPage, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false, filteredRows = [], allRows = []) {
    console.log('Displaying page:', page);
    renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, page);
}

// Function to display a specific word or root entry by ID
export function displaySpecificEntry(row, allRows) {
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.innerHTML = ''; // Clear previous entries

    if (!row) {
        const noMatchBox = createNoMatchBox();
        dictionaryContainer.appendChild(noMatchBox);
        return;
    }

    const box = createDictionaryBox(row, allRows, '', false, {});
    if (box) {
        dictionaryContainer.appendChild(box);
    }
}

// Function for exact and unique word search
export function wordSpecific(term, allRows) {
    const specificWord = allRows.find(row => row.type === 'word' && row.title.toLowerCase() === term.toLowerCase());
    displaySpecificEntry(specificWord, allRows);
}

// Function for exact and unique root search
export function rootSpecific(term, allRows) {
    const specificRoot = allRows.find(row => row.type === 'root' && row.title.toLowerCase() === term.toLowerCase());
    displaySpecificEntry(specificRoot, allRows);
}
