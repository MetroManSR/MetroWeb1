import { createPaginationControls, updatePagination } from './pagination.js';
import { createDictionaryBox } from './boxes.js';

// Function to create an empty box with gray tones
function createEmptyBox() {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'dictionary-box empty';
    emptyBox.style.backgroundColor = 'lightgray';
    return emptyBox;
}

// Function to create a no match box
function createNoMatchBox() {
    const noMatchBox = document.createElement('div');
    noMatchBox.className = 'dictionary-box no-match';
    noMatchBox.textContent = 'No match for your search';
    noMatchBox.style.backgroundColor = 'lightyellow';
    return noMatchBox;
}

export function displayPage(page, rowsPerPage, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false, filteredRows = [], allRows = []) {
    console.log('Displaying page:', page);
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const dictionaryContainer = document.getElementById('dictionary');

    if (!dictionaryContainer) {
        console.error('Dictionary container not found');
        return;
    }

    dictionaryContainer.innerHTML = ''; // Clear previous entries

    if (filteredRows.length === 0) {
        dictionaryContainer.appendChild(createNoMatchBox());
        updatePagination(page, filteredRows, rowsPerPage);
        return;
    }

    const validRows = filteredRows.filter(row => row.word && row.definition);
    const rowsToDisplay = validRows.slice(start, end); // Ensure rowsToDisplay is defined

    // Create empty boxes based on rowsPerPage
    for (let i = 0; i < rowsPerPage; i++) {
        const emptyBox = createEmptyBox();
        dictionaryContainer.appendChild(emptyBox);
    }

    // Fill the boxes with information one by one
    rowsToDisplay.forEach((row, index) => {
        const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        box.style.backgroundColor = row.type === 'word' ? 'lightblue' : 'lightgreen'; // Change color based on type
        setTimeout(() => {
            if (dictionaryContainer.children[index]) {
                dictionaryContainer.children[index].replaceWith(box);
            } else {
                console.error('Box not found for:', row);
            }
        }, index * 100); // Delay each box by 100ms for fade-in effect
    });

    updatePagination(page, filteredRows, rowsPerPage);
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

    // If no filters are selected, show all
    const showAll = selectedFilters.length === 0;

    if ((!searchTerm.trim() && (!wordID || parseInt(wordID) <= 0) && (!rootID || parseInt(rootID) <= 0))) return;

    let filteredRows = [];

    if (searchTerm && searchTerm.trim()) {
        filteredRows = allRows.filter(row => {
            const wordMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
            const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
            return showAll || selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech?.toLowerCase()) || wordMatch || rootMatch || definitionMatch || etymologyMatch;
        });

        filteredRows.sort((a, b) => a.word.localeCompare(b.word));
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        displayPage(1, rowsPerPage, searchTerm, searchIn, exactMatch, filteredRows, allRows);
    } else if (wordID && parseInt(wordID) > 0) {
        const row = allRowsById[parseInt(wordID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            displayPage(1, rowsPerPage, '', searchIn, exactMatch, filteredRows, allRows);
        }
    } else if (rootID && parseInt(rootID) > 0) {
        const row = allRowsById[parseInt(rootID)];
        if (row) {
            filteredRows = [row];
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            displayPage(1, rowsPerPage, '', searchIn, exactMatch, filteredRows, allRows);
        }
    } else {
        // If no valid search term or ID, reset to show all rows
        filteredRows = allRows;
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        displayPage(1, rowsPerPage, '', searchIn, exactMatch, filteredRows, allRows);
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
        const matches = [];
        for (let key in params) {
            if (row[key] && row[key].toLowerCase().includes(params[key].toLowerCase())) {
                matches.push(true);
            }
        }
        return matches.length === Object.keys(params).length;
    });

    filteredRows.sort((a, b) => a.word.localeCompare(b.word));
    createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
    displayPage(1, rowsPerPage, '', {}, false, filteredRows, allRows);
}
