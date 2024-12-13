import { processAllSettings } from './processRows.js';
import { getRelatedWordsByRoot, highlight, createHyperlink } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js';

export async function updatePendingChangesList(pendingChanges, language) {
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (!pendingChangesElement) return;

    const { searchTerm, exactMatch, searchIn, filters, ignoreDiacritics, startsWith, endsWith, rowsPerPage } = pendingChanges;
    let changesList = [];

    if (searchTerm) {
        const translatedSearchTerm = await getTranslatedText('searchTerm', language);
        changesList.push(`<strong>${translatedSearchTerm}</strong>: "${searchTerm}"`);
    }
    if (exactMatch) {
        const translatedExactMatch = await getTranslatedText('exactMatch', language);
        changesList.push(`<strong>${translatedExactMatch}</strong>: ${translatedExactMatch}`);
    }
    if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
        let searchInFields = [];
        if (searchIn.word) searchInFields.push(await getTranslatedText('searchInWord', language));
        if (searchIn.root) searchInFields.push(await getTranslatedText('searchInRoot', language));
        if (searchIn.definition) searchInFields.push(await getTranslatedText('searchInDefinition', language));
        if (searchIn.etymology) searchInFields.push(await getTranslatedText('searchInEtymology', language));
        const translatedSearchIn = await getTranslatedText('searchIn', language);
        changesList.push(`<strong>${translatedSearchIn}</strong>: ${searchInFields.join(', ')}`);
    }
    if (ignoreDiacritics) {
        const translatedIgnoreDiacritics = await getTranslatedText('ignoreDiacritics', language);
        changesList.push(`<strong>${translatedIgnoreDiacritics}</strong>`);
    }
    if (startsWith) {
        const translatedStartsWith = await getTranslatedText('startsWith', language);
        changesList.push(`<strong>${translatedStartsWith}</strong>`);
    }
    if (endsWith) {
        const translatedEndsWith = await getTranslatedText('endsWith', language);
        changesList.push(`<strong>${translatedEndsWith}</strong>`);
    }
    if (filters.length > 0) {
        const translatedFilters = await getTranslatedText('filters', language);
        const translatedFilterValues = await Promise.all(filters.map(async filter => await getTranslatedText(filter, language)));
        changesList.push(`<strong>${translatedFilters}</strong>: ${translatedFilterValues.join(', ')}`);
    }
    if (rowsPerPage !== 20) {
        const translatedRowsPerPage = await getTranslatedText('rowsPerPage', language);
        changesList.push(`<strong>${translatedRowsPerPage}</strong>: ${rowsPerPage}`);
    }

    const translatedPendingChanges = await getTranslatedText('pendingChanges', language);
    const translatedNoPendingChanges = await getTranslatedText('noPendingChanges', language);
    pendingChangesElement.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : `<p>${translatedNoPendingChanges}</p>`;
}

export function initializeEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage) {
    const language = document.querySelector('meta[name="language"]').content || 'en';
    let currentPage = 1;
    let previouslySelectedBox = null;
    let lastClickTime = 0;

    // Ensure pendingChanges list is visible on page load
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (pendingChangesElement) {
        pendingChangesElement.style.display = 'block';
    }

    updatePendingChangesList(pendingChanges, language);

    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
                updatePendingChangesList(pendingChanges, language);
        });
    }
    
    const filterSelect = document.getElementById('dict-word-filter');
if (filterSelect) {
    filterSelect.addEventListener('change', () => {
        pendingChanges.filters = Array.from(filterSelect.selectedOptions).map(option => option.value);
            updatePendingChangesList(pendingChanges,  language);
    });
}

    const toggleFilterButton = document.getElementById('dict-toggle-filter-button');
if (toggleFilterButton) {
    toggleFilterButton.addEventListener('click', () => {
        const filterSortingContainer = document.getElementById('dict-filter-sorting-container');
        filterSortingContainer.classList.toggle('dict-filter-cont-hidden');
        filterSortingContainer.classList.toggle('dict-filter-cont-visible');
    });
}

    const advancedSearchButton = document.getElementById('dict-advanced-search-button');
    if (advancedSearchButton) {
        advancedSearchButton.addEventListener('click', () => {
            initAdvancedSearchPopup(allRows, rowsPerPage, displayPage, pendingChanges);
        });
    }

    const viewStatisticsButton = document.getElementById('dict-view-statistics-button');
    if (viewStatisticsButton) {
        viewStatisticsButton.addEventListener('click', () => {
            initStatisticsPopup(allRows);
        });
    }

    const applySettingsButton = document.getElementById('dict-apply-settings-button');
    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', () => {
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
        });
    }

    const cleanSettingsButton = document.getElementById('dict-clear-settings-button');
if (cleanSettingsButton) {
    cleanSettingsButton.addEventListener('click', () => {
        pendingChanges = {
            searchTerm: '',
            exactMatch: false,
            searchIn: { word: true, root: true, definition: false, etymology: false },
            filters: [],
            rowsPerPage: 20,
            sortOrder: 'titleup' // Default sort order
        };
        
        // Reset form fields in the advanced search popup
        document.getElementById('dict-search-input').value = '';
        document.getElementById('dict-search-in-word').checked = true;
        document.getElementById('dict-search-in-root').checked = true;
        document.getElementById('dict-search-in-definition').checked = true;
        document.getElementById('dict-search-in-etymology').checked = false;
        document.getElementById('dict-exact-match').checked = false;

        // Reset selected filters
        const wordFilterSelect = document.getElementById('dict-word-filter');
        Array.from(wordFilterSelect.options).forEach(option => {
            option.selected = false;
        });

        updatePendingChangesList(pendingChanges, language);
        processAllSettings(pendingChanges, allRows, pendingChanges.rowsPerPage, displayPage, 1, pendingChanges.sortOrder);
        // Remove URL parameters without reloading the page
        history.pushState({}, document.title, window.location.pathname);
    });
}

    const cleanSearchButton = document.getElementById('dict-clear-search-button');
    if (cleanSearchButton) {
        cleanSearchButton.addEventListener('click', () => {
            pendingChanges.searchTerm = '';
            document.getElementById('dict-search-input').value = '';
                updatePendingChangesList(pendingChanges, language);
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

const searchInput = document.getElementById('dict-search-input');
const predictionBox = document.getElementById('dict-search-predictions');

// Handle input event for the search input
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();
    predictionBox.style.width = `${searchInput.offsetWidth}px`;
    
    if (searchTerm.length === 0) {
        predictionBox.innerHTML = '';
        pendingChanges.searchTerm = ''; // Clear searchTerm in pending changes
        updatePendingChangesList(pendingChanges, currentLanguage); // Update pending changes list
        return;
    }

    const searchIn = pendingChanges.searchIn;

    // Generate predictions based on the current search criteria
    const predictions = allRows
        .filter(row => {
            const titleMatch = searchIn.word && row.type === 'word' && row.title.toLowerCase().includes(searchTerm);
            const rootMatch = searchIn.root && row.type === 'root' && row.title.toLowerCase().includes(searchTerm);
            const definitionMatch = searchIn.definition && row.meta.toLowerCase().includes(searchTerm);
            const etymologyMatch = searchIn.etymology && row.morph.some(morphItem => morphItem.toLowerCase().includes(searchTerm));
            return titleMatch || rootMatch || definitionMatch || etymologyMatch;
        })
        .slice(0, 10) // Limit to the first 10 matches
        .map(row => row.title);

    if (predictions.length === 0) {
        predictionBox.innerHTML = '';
        pendingChanges.searchTerm = searchTerm; // Update searchTerm in pending changes
        updatePendingChangesList(pendingChanges, currentLanguage); // Update pending changes list
        return;
    }

    predictionBox.innerHTML = predictions.map(title => `<div>${highlight(title, searchTerm, pendingChanges.searchIn, { title })}</div>`).join('');
    // Add click event to predictions
    Array.from(predictionBox.children).forEach((prediction, index) => {
        prediction.addEventListener('click', () => {
            searchInput.value = predictions[index];
            predictionBox.innerHTML = '';
            pendingChanges.searchTerm = predictions[index]; // Update searchTerm in pending changes
            updatePendingChangesList(pendingChanges, currentLanguage); // Update pending changes list
        });
    });

    // Update pending changes list while typing
    pendingChanges.searchTerm = searchTerm;
    updatePendingChangesList(pendingChanges, currentLanguage);
});

// Hide prediction box if input search is not selected
document.addEventListener('focusin', (e) => {
    if (!searchInput.contains(e.target) && !predictionBox.contains(e.target)) {
        predictionBox.innerHTML = '';
    }
});

// Handle focus event to show predictions if input is not empty
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
        searchInput.dispatchEvent(new Event('input'));
    }
});

// Hide prediction box if input search is not selected
document.addEventListener('focusin', (e) => {
    if (!searchInput.contains(e.target) && !predictionBox.contains(e.target)) {
        predictionBox.innerHTML = '';
    }
});

// Handle focus event to show predictions if input is not empty
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
        searchInput.dispatchEvent(new Event('input'));
    }
}); 
    
// Hide prediction box if input search is not selected
document.addEventListener('focusin', (e) => {
    if (!searchInput.contains(e.target) && !predictionBox.contains(e.target)) {
        predictionBox.innerHTML = '';
    }
});

// Handle focus event to show predictions if input is not empty
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
        searchInput.dispatchEvent(new Event('input'));
    }
}); 

    const rowsPerPageSelect = document.getElementById('dict-rows-per-page-input');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', () => {
            pendingChanges.rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
                updatePendingChangesList(pendingChanges, language);
        });
    }

async function handleClickEvent(e) {
    const now = Date.now();
    if (now - lastClickTime < 250) return; // 0.25 second cooldown
    lastClickTime = now;

    const target = e.target;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.icon-container')) {
        // Ignore clicks on links, buttons, and the icon container
        return;
    }

    e.stopPropagation(); // Stop event propagation to avoid duplicate events
    e.preventDefault();  // Prevent default action to ensure correct handling

    // Find the closest .dictionary-box element
    const box = target.closest('.dictionary-box');
    if (!box) return;

    // Extract the type and row ID from the box's ID attribute
    const [type, id] = box.id.split('-');
    const rowId = parseInt(id, 10);
    const row = allRows.find(r => r.id === rowId && r.type === type);

    if (!row) {
        console.error(`Row with id ${rowId} and type ${type} not found.`);
        return;
    }

    if (previouslySelectedBox) {
        previouslySelectedBox.classList.remove('selected-word', 'selected-root');
        const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
        if (previousRelatedWords) {
            previouslySelectedBox.removeChild(previousRelatedWords);
        }
    }

    if (box === previouslySelectedBox) {
        previouslySelectedBox = null;
        return;
    }

    box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

    const relatedWordsElement = document.createElement('div');
    relatedWordsElement.className = 'related-words';
    relatedWordsElement.style.fontSize = '0.85em';

    

    let derivativeWordsLabel = '';
    let relatedWordsLabel = '';

    if (row.type === 'root') {
        derivativeWordsLabel = await getTranslatedText('derivativeWords', language);
        if (row.related && row.related.length > 0) {
            console.log('Derivatives:', row.related); // Debugging

            // Ensure the displayed word is not shown as a related word
            const relatedWordsHtml = row.related
                .filter(dw => dw.toLowerCase() !== row.title.toLowerCase())
                .map(dw => {
                    // Find the related word in the allRows array
                    const relatedWord = typeof dw === 'string' ? allRows.find(r => r.title.trim().toLowerCase() === dw.trim().toLowerCase()) : dw;

                    // Log for debugging
                    console.log('Derivative word:', dw, 'Related word:', relatedWord);

                    // Return a string with the title and ID, formatted with a hyperlink
                    return relatedWord ? `${relatedWord.title} [${relatedWord.id}]: ${createHyperlink(relatedWord.title, pendingChanges.searchTerm, allRows)}` : dw;
                }).join(', ');

            relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${relatedWordsHtml}`;
        } else {
            relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
        }

        // Ensure `morph` exists and has more than one element
        if (row.morph && row.morph.length > 1) {
            console.log('Morph length is greater than 1:', row.morph); // Debugging
            const rootButtonsElement = document.createElement('div');
            rootButtonsElement.className = 'root-buttons';
            for (const root of row.morph) {
                console.log('Creating button for root:', root); // Debugging
                const rootButton = document.createElement('button');
                rootButton.innerText = root;
                rootButton.addEventListener('click', async () => {
                    console.log('Clicked root button:', root); // Debugging
                    const rootRelatedWords = allRows.filter(r => r.root === root && r.title.toLowerCase() !== row.title.toLowerCase())
                        .map(r => `${r.title} [${r.id}]: ${createHyperlink(r.title, pendingChanges.searchTerm, allRows)}`)
                        .join(', ');

                    relatedWordsLabel = await getTranslatedText('relatedWords', language);
                    relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${rootRelatedWords}`;
                });
                rootButtonsElement.appendChild(rootButton);
            }
            relatedWordsElement.appendChild(rootButtonsElement);
        }
    } else {
        relatedWordsLabel = await getTranslatedText('relatedWords', language);
        const relatedWords = row.related || [];

        if (relatedWords.length > 0) {
            console.log('Related Words:', relatedWords); // Debugging
            const relatedWordsHtml = relatedWords
                .filter(rw => rw.toLowerCase() !== row.title.toLowerCase())
                .map(rw => {
                    const relatedWord = typeof rw === 'string' ? allRows.find(r => r.title.trim().toLowerCase() === rw.trim().toLowerCase()) : rw;
                    console.log('Related word:', rw, 'Related word:', relatedWord);
                    return relatedWord ? `${relatedWord.title} [${relatedWord.id}]: ${createHyperlink(relatedWord.title, pendingChanges.searchTerm, allRows)}` : rw;
                }).join(', ');

            relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${relatedWordsHtml}`;
        } else {
            relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
        }
    }

    if (relatedWordsElement.scrollHeight > 3 * parseFloat(getComputedStyle(relatedWordsElement).lineHeight)) {
        relatedWordsElement.style.maxHeight = '3em';
        relatedWordsElement.style.overflowY = 'auto';
    }

    box.appendChild(relatedWordsElement);

    previouslySelectedBox = box;
}

    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.addEventListener('click', handleClickEvent, true); // Use capturing phase

    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetPage = parseInt(e.target.dataset.page, 10);
            if (!isNaN(targetPage)) {
                navigateToPage(targetPage);
            }
        });
    });

    function navigateToPage(pageNumber) {
        if (!isNaN(pageNumber) && pageNumber >= 1) {
            currentPage = pageNumber;
        } else {
            currentPage = 1;
        }

        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        updatePagination(currentPage, totalPages);
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, filteredRows, allRows);
    }

    navigateToPage(1);
} 
