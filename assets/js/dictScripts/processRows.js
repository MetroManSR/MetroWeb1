import { createPaginationControls } from './pagination.js';
import { renderBox, updateFloatingText } from './boxes.js';

/**
 * Filters and processes rows based on the provided criteria.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 * @param {Object} criteria - The search and filter criteria.
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {Function} displayPage - The function to display the page.
 * @param {number} [currentPage=1] - The current page to display.
 */
export function processRows(allRows, criteria, rowsPerPage, displayPage, currentPage = 1) {
    const {
        searchTerm = '',
        exactMatch = false,
        searchIn = { word: true, root: true, definition: false, etymology: false },
        filters = []
    } = criteria;

    let filteredRows = allRows;

    // Apply search term filtering
    if (searchTerm) {
        filteredRows = filteredRows.filter(row => {
            const titleMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.title === searchTerm : row.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.title === searchTerm : row.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const definitionMatch = searchIn.definition && (exactMatch ? row.meta === searchTerm : row.meta.toLowerCase().includes(searchTerm.toLowerCase()));
            const etymologyMatch = searchIn.etymology && (exactMatch ? row.morph === searchTerm : row.morph.toLowerCase().includes(searchTerm.toLowerCase()));
            return titleMatch || rootMatch || definitionMatch || etymologyMatch;
        });
    }

    // Apply filter criteria
    if (filters.length > 0) {
        filteredRows = filteredRows.filter(row => filters.includes(row.type) || filters.includes(row.partofspeech?.toLowerCase()));
    }

    // Sort filtered rows alphabetically by title
    filteredRows.sort((a, b) => a.title.localeCompare(b.title));

    // Update pagination and render boxes
    createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
    renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage);
    updateFloatingText(filteredRows, searchTerm, filters, searchIn);
}

/**
 * Handles advanced search functionality
 *
 * @param {Object} params - The search parameters
 * @param {Array} allRows - The array of all dictionary rows
 * @param {number} rowsPerPage - The number of rows to display per page
 * @param {Function} displayPage - The function to display the page
 */
export function advancedSearch(params, allRows = [], rowsPerPage, displayPage) {
    const searchIn = {
        word: params.word || false,
        root: params.root || false,
        definition: params.definition || false,
        etymology: params.etymology || false
    };

    if (!searchIn.word && !searchIn.root && !searchIn.definition && !searchIn.etymology) {
        alert('Please select at least one search option.');
        return;
    }

    let filteredRows = [];

    filteredRows = allRows.filter(row => {
        const wordMatch = searchIn.word && (params.exactMatch ? row.title === params.searchTerm : row.title.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const rootMatch = searchIn.root && (params.exactMatch ? row.title === params.searchTerm : row.title.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const definitionMatch = searchIn.definition && (params.exactMatch ? row.meta === params.searchTerm : row.meta.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const etymologyMatch = searchIn.etymology && (params.exactMatch ? row.morph === params.searchTerm : row.morph.toLowerCase().includes(params.searchTerm.toLowerCase()));
        return wordMatch || rootMatch || definitionMatch || etymologyMatch;
    });

    filteredRows.sort((a, b) => a.title.localeCompare(b.title));
    createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
    renderBox(filteredRows, allRows, params.searchTerm, params.exactMatch, searchIn, rowsPerPage, 1);
    updateFloatingText(filteredRows, params.searchTerm, [], searchIn);
}
