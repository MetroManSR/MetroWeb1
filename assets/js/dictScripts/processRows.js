import { createPaginationControls } from './pagination.js';
import { renderBox, updateFloatingText } from './boxes.js';

/**
 * Sorts rows based on the specified sorting manner.
 *
 * @param {Array} rows - The array of rows to sort.
 * @param {String} sortingManner - The manner of sorting (e.g., "titleup", "titledown", "metaup", "metadown", "morphup", "morphdown").
 * @returns {Array} - The sorted array of rows.
 */
export function sortRows(rows, sortingManner) {
    console.log(`Sorting rows by: ${sortingManner}`);
    switch (sortingManner) {
        case 'titleup':
            return rows.sort((a, b) => a.title.localeCompare(b.title));
        case 'titledown':
            return rows.sort((a, b) => b.title.localeCompare(a.title));
        case 'metaup':
            return rows.sort((a, b) => (a.meta || '').localeCompare(b.meta || ''));
        case 'metadown':
            return rows.sort((a, b) => (b.meta || '').localeCompare(a.meta || ''));
        case 'morphup':
            return rows.sort((a, b) => (a.morph || '').localeCompare(b.morph || ''));
        case 'morphdown':
            return rows.sort((a, b) => (b.morph || '').localeCompare(a.morph || ''));
        default:
            return rows.sort((a, b) => a.title.localeCompare(b.title));
    }
}

/**
 * Filters and processes rows based on the provided criteria.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 * @param {Object} criteria - The search and filter criteria.
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {Function} displayPage - The function to display the page.
 * @param {number} [currentPage=1] - The current page to display.
 * @param {String} sortingManner - The manner of sorting (e.g., "titleup", "titledown", "metaup", "metadown", "morphup", "morphdown").
 */
export function processRows(allRows, criteria, rowsPerPage, displayPage, currentPage = 1, sortingManner = 'titleup') {
    const {
        searchTerm = '',
        exactMatch = false,
        searchIn = { word: true, root: true, definition: false, etymology: false },
        filters = []
    } = criteria;

    console.log('Initial allRows:', allRows);
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
        console.log('After search term filtering:', filteredRows);
    }

    // Apply filter criteria
    if (filters.length > 0) {
        filteredRows = filteredRows.filter(row => filters.includes(row.type) || filters.includes(row.partofspeech?.toLowerCase()));
        console.log('After filter criteria:', filteredRows);
    }

    // Sort filtered rows based on the current sorting manner
    filteredRows = sortRows(filteredRows, sortingManner);
    console.log('After sorting:', filteredRows);

    // Update pagination and render boxes
    createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
    renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage);
    updateFloatingText(filteredRows, searchTerm, filters, searchIn);

    // Show "Settings Applied" notification
    const settingsAppliedText = document.createElement('div');
    settingsAppliedText.id = 'settings-applied-text';
    settingsAppliedText.innerText = 'Settings Applied';
    settingsAppliedText.style.color = 'green';
    settingsAppliedText.style.fontWeight = 'bold';
    document.body.appendChild(settingsAppliedText);

    setTimeout(() => {
        settingsAppliedText.remove();
    }, 1000);
}
/**
 * Handles advanced search functionality
 *
 * @param {Object} params - The search parameters
 * @param {Array} allRows - The array of all dictionary rows
 * @param {number} rowsPerPage - The number of rows to display per page
 * @param {Function} displayPage - The function to display the page
 * @param {String} sortingManner - The manner of sorting (e.g., "titleup", "titledown", "metaup", "metadown", "morphup", "morphdown").
 */
export function advancedSearch(params, allRows = [], rowsPerPage, displayPage, sortingManner = 'titleup') {
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
    console.log('Filtered rows before sorting:', filteredRows);

    // Sort filtered rows based on the current sorting manner
    filteredRows = sortRows(filteredRows, sortingManner);
    console.log('Filtered rows after sorting:', filteredRows);

    createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
    renderBox(filteredRows, allRows, params.searchTerm, params.exactMatch, searchIn, rowsPerPage, 1);
    updateFloatingText(filteredRows, params.searchTerm, [], searchIn);

    // Show "Settings Applied" notification
    const settingsAppliedText = document.createElement('div');
    settingsAppliedText.id = 'settings-applied-text';
    settingsAppliedText.innerText = 'Settings Applied';
    settingsAppliedText.style.color = 'green';
    settingsAppliedText.style.fontWeight = 'bold';
    document.body.appendChild(settingsAppliedText);

    setTimeout(() => {
        settingsAppliedText.remove();
    }, 1000);
}
