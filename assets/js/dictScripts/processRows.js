import { createPaginationControls, updatePagination } from './pagination.js';
import { renderBox, updateFloatingText, createDictionaryBox, createNoMatchBox } from './boxes.js';
import { highlight } from './utils.js';

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
    console.log("Duplicates cleaned up.");
}

/**
 * Processes all settings including search, filters, sorting, and advanced search criteria.
 *
 * @param {Object} params - The search parameters.
 * @param {Array} allRows - The array of all dictionary rows.
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {Function} displayPage - The function to display the page.
 * @param {number} [currentPage=1] - The current page to display.
 * @param {String} sortingManner - The manner of sorting (e.g., "titleup", "titledown", "metaup", "metadown", "morphup", "morphdown").
 */
export function processAllSettings(params, allRows = [], rowsPerPage, displayPage, currentPage = 1, sortingManner = 'titleup') {
    const {
        searchTerm = '',
        exactMatch = false,
        searchIn = { word: true, root: true, definition: false, etymology: false },
        filters = [],
        ignoreDiacritics = false,
        startsWith = false,
        endsWith = false,
        rowsPerPage: paramsRowsPerPage = 20
    } = params;

    console.log('Initial allRows:', allRows);
    let filteredRows = [];

    // Normalize and remove diacritics if needed
    const normalize = (text) => ignoreDiacritics ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;

    // Apply search term filtering
    if (searchTerm) {
        filteredRows = allRows.filter(row => {
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
        });
    }

    // Apply filter criteria for parts of speech
    if (filters.length > 0) {
        filteredRows = filteredRows.filter(row => filters.includes(row.partofspeech?.toLowerCase()));
        console.log('After filter criteria:', filteredRows);
    }

    // Remove duplicates using isUniqueResult
    const uniqueRows = [];
    filteredRows.forEach(row => {
        if (isUniqueResult(row, uniqueRows)) {
            uniqueRows.push(row);
        }
    });
    filteredRows = uniqueRows;

    console.log('After removing duplicates:', filteredRows);

    // Clear previous rows before rendering new ones
    const renderContainer = document.getElementById('dict-dictionary'); // Ensure the correct container ID
    renderContainer.innerHTML = '';

    // Sort filtered rows based on the current sorting manner
    filteredRows = sortRows(filteredRows, sortingManner);
    console.log('After sorting:', filteredRows);

    // Highlight terms in the filtered rows based on search criteria
    filteredRows = filteredRows.map(row => highlight(row, searchTerm, searchIn, row));

    // Render the filtered rows into the container
    filteredRows.forEach(async row => {
        const box = await createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        if (box) {
            renderContainer.appendChild(box);
        }
    });

    // Call cleanUpDuplicates to ensure no duplicate boxes are present
    cleanUpDuplicates();

    // Update pagination and floating text
    createPaginationControls(paramsRowsPerPage, filteredRows, currentPage, displayPage);
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

/**
 * Displays a specific word or root entry by ID.
 *
 * @param {Object} row - The dictionary row to display.
 * @param {Array} allRows - The array of all dictionary rows.
 */
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
