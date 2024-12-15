import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox, createDictionaryBox, createNoMatchBox } from './boxes.js';
import { filteredRows} from "../mainDict.js";

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

    // Attach icons to the dictionary box
    attachIcons(box, row);
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
