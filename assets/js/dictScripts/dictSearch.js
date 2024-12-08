import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox } from './boxes.js';

export function displayPage(page, rowsPerPage, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false, filteredRows = [], allRows = []) {
    console.log('Displaying page:', page);
    renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, page);
}

export function filterAndDisplayWord(searchTerm, wordID, rootID, allRows, allRowsById, rowsPerPage, displayPage) {
    const searchIn = {
        word: document.getElementById('search-in-word')?.checked || false,
        root: document.getElementById('search-in-root')?.checked || false,
        definition: document.getElementById('search-in-definition')?.checked || false,
        etymology: document.getElementById('search-in-etymology')?.checked || false
    };

    const exactMatch = document.getElementById('exact-match')?.checked || false;
    const selectedFilters = Array.from(document.getElementById('word-filter').selectedOptions).map(option => option.value);

    const showAll = selectedFilters.length === 0;

    let filteredRows = [];

    if (searchTerm && searchTerm.trim()) {
        filteredRows = allRows.filter(row => {
            const wordMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
            const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
            return (wordMatch || rootMatch || definitionMatch || etymologyMatch) && (showAll || selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech?.toLowerCase()));
        });

        filteredRows.sort((a, b) => a.word.localeCompare(b.word));
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, 1);
    } else if (wordID && parseInt(wordID) > 0) {
        const row = allRowsById[parseInt(wordID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
        }
    } else if (rootID && parseInt(rootID) > 0) {
        const row = allRowsById[parseInt(rootID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
        }
    } else {
        // If no valid search term or ID, reset to show all rows
        filteredRows = allRows;
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
    }
}

export function advancedSearch(params, allRows, rowsPerPage, displayPage) {
    // Ensure at least one search option is selected
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

    // Advanced search filters can be implemented based on params
    // Example: Search in specific fields or match exact phrases
    filteredRows = allRows.filter(row => {
        const wordMatch = searchIn.word && (params.exactMatch ? row.word === params.searchTerm : row.word.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const rootMatch = searchIn.root && (params.exactMatch ? row.word === params.searchTerm : row.word.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const definitionMatch = searchIn.definition && (params.exactMatch ? row.definition === params.searchTerm : row.definition.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const etymologyMatch = searchIn.etymology && (params.exactMatch ? row.etymology === params.searchTerm : row.etymology.toLowerCase().includes(params.searchTerm.toLowerCase()));
        return wordMatch || rootMatch || definitionMatch || etymologyMatch;
    });

    filteredRows.sort((a, b) => a.word.localeCompare(b.word));
    createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
    renderBox(filteredRows, allRows, params.searchTerm, params.exactMatch, searchIn, rowsPerPage, 1);
}
