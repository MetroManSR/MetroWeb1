import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox, updateFloatingText, createDictionaryBox, createNoMatchBox } from './boxes.js';
import { highlight } from './utils.js';
import { filteredRows, updateFilteredRows } from "../mainDict.js";
import { universalPendingChanges, defaultPendingChanges } from './initFormEventListeners.js';

/**
 * Sorts rows based on the specified sorting manner.
 *
 * @param {Array} rows - The array of rows to sort.
 * @param {String} sortingManner - The manner of sorting (e.g., "titleup", "titledown", "metaup", "metadown", "morphup", "morphdown").
 * @returns {Array} - The sorted array of rows.
 */
export function sortRows(rows, sortingManner) {
    //console.log(`Sorting rows by: ${sortingManner}`);
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
            return rows.sort((a, b) => {
                const morphA = Array.isArray(a.morph) ? a.morph.join(' ') : a.morph || '';
                const morphB = Array.isArray(b.morph) ? b.morph.join(' ') : b.morph || '';
                return morphA.localeCompare(morphB);
            });
        case 'morphdown':
            return rows.sort((a, b) => {
                const morphA = Array.isArray(a.morph) ? a.morph.join(' ') : a.morph || '';
                const morphB = Array.isArray(b.morph) ? b.morph.join(' ') : b.morph || '';
                return morphB.localeCompare(morphA);
            });
        default:
            return rows.sort((a, b) => a.title.localeCompare(b.title));
    }
}

/**
 * Checks if a row is unique based on its ID.
 *
 * @param {Object} row - The row to check.
 * @param {Array} existingRows - The array of existing rows.
 * @returns {boolean} - True if the row is unique, false otherwise.
 */
function isUniqueResult(row, existingRows) {
    return !existingRows.some(existingRow => existingRow.id === row.id);
}

/**
 * Removes duplicated dictionary boxes based on their unique IDs.
 */
function cleanUpDuplicates() {
    const renderContainer = document.getElementById('dict-dictionary');
    if (!renderContainer) {
        console.error("Error: 'dict-dictionary' element not found in the DOM.");
        return;
    }

    const seenIds = new Set();
    const children = Array.from(renderContainer.children);
    
    children.forEach(child => {
        const childId = child.id;
        if (seenIds.has(childId)) {
            renderContainer.removeChild(child);
        } else {
            seenIds.add(childId);
        }
    });
    //console.log("Duplicates cleaned up.");
}

export async function processAllSettings(allRows = [], rowsPerPage = 20, currentPage = 1, sortingManner = 'titleup') {
    
    let params = universalPendingChanges ? universalPendingChanges : defaultPendingChanges ;
    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified

    const {
        searchTerm, 
        exactMatch,
        searchIn, 
        filters, 
        ignoreDiacritics,
        startsWith,
        endsWith
    } = params;

    console.log('Initial allRows:', allRows.length);
    updateFilteredRows([]);

    console.log("Rows per page", rowsPerPage);

    const normalize = (text) => ignoreDiacritics ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;

    if (searchTerm) {
        updateFilteredRows(allRows.filter(row => {
            const normalizedTitle = normalize(row.title.toLowerCase());
            const normalizedMeta = normalize(row.meta.toLowerCase());
            const normalizedMorph = row.morph.map(morphItem => normalize(morphItem.toLowerCase()));
            const term = normalize(searchTerm.toLowerCase());

            const titleMatch = searchIn.word && row.type === 'word' && (
                (exactMatch && normalizedTitle === term) ||
                (startsWith && normalizedTitle.startsWith(term)) ||
                (endsWith && normalizedTitle.endsWith(term)) ||
                (!exactMatch && !startsWith && !endsWith && normalizedTitle.includes(term))
            );

            const rootMatch = searchIn.root && row.type === 'root' && (
                (exactMatch && normalizedTitle === term) ||
                (startsWith && normalizedTitle.startsWith(term)) ||
                (endsWith && normalizedTitle.endsWith(term)) ||
                (!exactMatch && !startsWith && !endsWith && normalizedTitle.includes(term))
            );

            const definitionMatch = searchIn.definition && (
                (exactMatch && normalizedMeta === term) ||
                (startsWith && normalizedMeta.startsWith(term)) ||
                (endsWith && normalizedMeta.endsWith(term)) ||
                (!exactMatch && !startsWith && !endsWith && normalizedMeta.includes(term))
            );

            const etymologyMatch = searchIn.etymology && (
                (exactMatch && normalizedMorph.includes(term)) ||
                (startsWith && normalizedMorph.some(item => item.startsWith(term))) ||
                (endsWith && normalizedMorph.some(item.endsWith(term))) ||
                (!exactMatch && !startsWith && !endsWith && normalizedMorph.some(item => item.includes(term)))
            );

            return titleMatch || rootMatch || definitionMatch || etymologyMatch;
        }));
    } else {
        updateFilteredRows(allRows);
    }

    if (filters.length > 0) {
        filteredRows = filteredRows.filter(row => filters.includes(row.partofspeech?.toLowerCase()));
        console.log('After filter criteria:', filteredRows.length);
    }


    let sortedRows = sortRows(filteredRows, sortingManner);
    
    updateFilteredRows(sortedRows);
    console.log('After sorting:', filteredRows.length);

    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    console.log(`Total rows: ${totalRows}, Total pages: ${totalPages}, Current page: ${currentPage}`);

    const uniqueRows = [];
    filteredRows.forEach(row => {
        if (isUniqueResult(row, uniqueRows)) {
            uniqueRows.push(row);
        }
    });
    updateFilteredRows(uniqueRows);
    console.log('After removing duplicates:', filteredRows.length);

    const renderContainer = document.getElementById('dict-dictionary');
    if (renderContainer) {
        renderContainer.innerHTML = '';
    } else {
        console.error("Error: 'dict-dictionary' element not found in the DOM.");
        return;
    }
    
    //cleanUpDuplicates();

    if (filteredRows.length === 0) {
        const noMatchBox = await createNoMatchBox(language, 'dict-search-input', searchTerm, allRows);
        renderContainer.appendChild(noMatchBox);
    }

    await renderBox(allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage);

    updatePagination(currentPage, rowsPerPage);
    
    updateFloatingText(searchTerm, filters, searchIn);

    const settingsAppliedText = document.createElement('div');
    settingsAppliedText.id = 'settings-applied-text';
    settingsAppliedText.innerText = 'Settings Applied';
    settingsAppliedText.style.color = 'green';
    settingsAppliedText.style.fontWeight = 'bold';
    document.body.appendChild(settingsAppliedText);

    setTimeout(() => {
        settingsAppliedText.remove();
    }, 1000);

    console.log('Process complete.');
}

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
export function displayPage(page, rowsPerPage, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false, allRows = []) {
    //console.log('Displaying page:', page);
    renderBox(allRows, searchTerm, exactMatch, searchIn, rowsPerPage, page);
}

/**
 * Displays a specific word or root entry by ID.
 *
 * @param {Object} row - The dictionary row to display.
 * @param {Array} allRows - The array of all dictionary rows.
 */
export function displaySpecificEntry(language, row, allRows) {
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.innerHTML = ''; // Clear previous entries

    if (!row) {
        const noMatchBox = createNoMatchBox(language, row.title, allRows);
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

/**
 * Performs an exact and unique word search.
 *
 * @param {string} term - The search term.
 * @param {Array} allRows - The array of all dictionary rows.
 */
export function wordSpecific(term, allRows) {
    const specificWord = allRows.find(row => row.type === 'word' && row.title.toLowerCase() === term.toLowerCase());
    displaySpecificEntry(specificWord, allRows);
}

/**
 * Performs an exact and unique root search.
 *
 * @param {string} term - The search term.
 * @param {Array} allRows - The array of all dictionary rows.
 */
export function rootSpecific(term, allRows) {
    const specificRoot = allRows.find(row => row.type === 'root' && row.title.toLowerCase() === term.toLowerCase());
    displaySpecificEntry(specificRoot, allRows);
}

/**
 * Handles the rows per page customization.
 *
 * @param {Event} e - The event object.
 */
export function handleRowsPerPageChange(e) {
    const rowsPerPage = parseInt(e.target.value, 10);
    if (!isNaN(rowsPerPage) && rowsPerPage > 0) {
        pendingChanges.rowsPerPage = rowsPerPage;
    }
}

function splitArrayIntoChunks(array, chunkSize) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        let chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}
