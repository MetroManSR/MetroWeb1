import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox, updateFloatingText, createDictionaryBox } from './boxes.js';

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

/*export function filterAndDisplayWord(searchTerm, wordID, rootID, allRows = [], allRowsById = {}, rowsPerPage, displayPage) {
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
        updateFloatingText(filteredRows, searchTerm, selectedFilters, searchIn);
    } else if (wordID && parseInt(wordID) > 0) {
        const row = allRowsById[parseInt(wordID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
            updateFloatingText(filteredRows, searchTerm, selectedFilters, searchIn);
        }
    } else if (rootID && parseInt(rootID) > 0) {
        const row = allRowsById[parseInt(rootID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
            updateFloatingText(filteredRows, searchTerm, selectedFilters, searchIn);
        }
    } else {
        filteredRows = allRows.filter(row => {
            const filterMatch = selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech?.toLowerCase());
            return showAll || filterMatch;
        });

        filteredRows.sort((a, b) => a.word.localeCompare(b.word));
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        renderBox(filteredRows, allRows, '', exactMatch, searchIn, rowsPerPage, 1);
        updateFloatingText(filteredRows, '', selectedFilters, searchIn);
    }
}

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
        const wordMatch = searchIn.word && (params.exactMatch ? row.word === params.searchTerm : row.word.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const rootMatch = searchIn.root && (params.exactMatch ? row.word === params.searchTerm : row.word.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const definitionMatch = searchIn.definition && (params.exactMatch ? row.definition === params.searchTerm : row.definition.toLowerCase().includes(params.searchTerm.toLowerCase()));
        const etymologyMatch = searchIn.etymology && (params.exactMatch ? row.etymology === params.searchTerm : row.etymology.toLowerCase().includes(params.searchTerm.toLowerCase()));
        return wordMatch || rootMatch || definitionMatch || etymologyMatch;
    });

    filteredRows.sort((a, b) => a.word.localeCompare(b.word));
    createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
    renderBox(filteredRows, allRows, params.searchTerm, params.exactMatch, searchIn, rowsPerPage, 1);
    updateFloatingText(filteredRows, params.searchTerm, [], searchIn);
}
