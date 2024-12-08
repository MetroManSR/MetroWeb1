import { createPaginationControls, updatePagination } from './pagination.js';
import { createDictionaryBox } from './boxes.js';

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

    const validRows = filteredRows.filter(row => row.word && row.definition);
    const rowsToDisplay = validRows.slice(start, end); // Ensure rowsToDisplay is defined
    console.log('Filtered Rows:', filteredRows, ' - ', rowsToDisplay)

    rowsToDisplay.forEach((row, index) => {
        const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        if (box) {
            setTimeout(() => {
                dictionaryContainer.appendChild(box);
            }, index * 100); // Delay each box by 100ms for fade-in effect
        } else {
            console.error('Failed to create a valid object for:', row);
        }
    });

    console.log('Updating Pagination')

    updatePagination(page, rowsToDisplay, rowsPerPage);
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

    console.log('DictSearch: 52 - 80')

    if (searchTerm && searchTerm.trim()) {
        filteredRows = allRows.filter(row => {
            const wordMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
            const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
            const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
            return showAll || selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech?.toLowerCase()) || wordMatch || rootMatch || definitionMatch || etymologyMatch;
        });

        filteredRows.sort((a, b) => a.word.localeCompare(b.word));
        console.log(`Rows per page: ${rowsPerPage} `);
        console.log(`Filtered Rows: ${filteredRows} `);
        console.log(`Display page: ${displayPage} `);
        createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
        displayPage(1, rowsPerPage, searchTerm, searchIn, exactMatch, filteredRows, allRows);
        
    } else if (wordID && parseInt(wordID) > 0) {
        const row = allRowsById[parseInt(wordID)];
        if (row) {
            filteredRows = [row];
            console.log(`Rows per page: ${rowsPerPage} `);
            console.log(`Filtered Rows: ${filteredRows} `);
            console.log(`Display page: ${displayPage} `);
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            displayPage(1, rowsPerPage, '', searchIn, exactMatch, filteredRows, allRows);
        }
    } else if (rootID && parseInt(rootID) > 0) {
        const row = allRowsById[parseInt(rootID)];
        if (row) {
            filteredRows = [row];
            console.log(`Rows per page: ${rowsPerPage} `);
            console.log(`Filtered Rows: ${filteredRows} `);
            console.log(`Display page: ${displayPage} `);
            createPaginationControls(rowsPerPage, filteredRows, 1, displayPage);
            displayPage(1, rowsPerPage, '', searchIn, exactMatch, filteredRows, allRows);
        }
    }
}
