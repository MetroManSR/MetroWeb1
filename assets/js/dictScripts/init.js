import { getRelatedWordsByRoot, highlight } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';

// Function to initialize event listeners and other functionalities
export function initializeEventListeners(allRows, allRowsById, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage) {
    let currentPage = 1; // Define currentPage
    let filteredRows = []; // Initialize filteredRows
    let previouslySelectedBox = null; // Track previously selected box

    // Sorting functionality
    let orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            console.log('Selected order:', pendingChanges.sortOrder);
            updatePendingChangesList();
        });
    }

    // Toggle filter options
    let toggleFilterButton = document.getElementById('dict-toggle-filter-button');
    if (toggleFilterButton) {
        toggleFilterButton.addEventListener('click', () => {
            let filterSortingContainer = document.getElementById('dict-filter-sorting-container');
            filterSortingContainer.classList.toggle('dict-filter-cont-hidden');
            filterSortingContainer.classList.toggle('dict-filter-cont-visible');
        });
    }

    // Initialize popups
    let advancedSearchButton = document.getElementById('dict-advanced-search-button');
    if (advancedSearchButton) {
        advancedSearchButton.addEventListener('click', () => {
            initAdvancedSearchPopup(allRows, rowsPerPage, displayPage);
        });
    }

    let viewStatisticsButton = document.getElementById('dict-view-statistics-button');
    if (viewStatisticsButton) {
        viewStatisticsButton.addEventListener('click', () => {
            initStatisticsPopup(allRows);
        });
    }

    // Related words event handler
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.addEventListener('click', async (e) => {
        const box = e.target.closest('.dictionary-box');
        if (!box) return;

        const rowId = parseInt(box.id.replace('entry-', ''), 10);
        const row = allRowsById[rowId];

        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected-word', 'selected-root');
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        if (box === previouslySelectedBox) {
            previouslySelectedBox = null;
            return; // Deselect the current box
        }

        // Highlight the clicked box
        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        // Display related words or derivative words
        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em'; // Make the font smaller

        const language = document.querySelector('meta[name="language"]').content || 'en';

        if (row.type === 'root') {
            // Display derivative words for roots
            const derivativeWords = allRows.filter(r => r.type !== 'root' && r.morph && r.morph.includes(row.title) && r.id !== row.id);
            if (derivativeWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('derivativeWords', language)}:</strong> ${derivativeWords.map(dw => `<a href="?entry-${dw.id}" style="color: green;">${highlight(dw.title, pendingChanges.searchTerm)}</a>`).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('derivativeWords', language)}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        } else {
            // Display related words for words
            const relatedWords = getRelatedWordsByRoot(row.morph, allRows).filter(rw => rw.id !== row.id);
            if (relatedWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('relatedWords', language)}:</strong> ${relatedWords.map(rw => `<a href="?entry-${rw.id}" style="color: green;">${highlight(rw.title, pendingChanges.searchTerm)}</a>`).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('relatedWords', language)}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        }

        // Make the list scrollable if it exceeds three lines
        if (relatedWordsElement.scrollHeight > 3 * parseFloat(getComputedStyle(relatedWordsElement).lineHeight)) {
            relatedWordsElement.style.maxHeight = '3em';
            relatedWordsElement.style.overflowY = 'auto';
        }

        box.appendChild(relatedWordsElement);

        previouslySelectedBox = box; // Set the clicked box as the previously selected one
    });

    // Add event listeners for pagination buttons
    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetPage = parseInt(e.target.dataset.page, 10);
            if (!isNaN(targetPage)) {
                goToPage(targetPage);
            }
        });
    });

    function goToPage(pageNumber) {
        if (!isNaN(pageNumber) && pageNumber >= 1) {
            currentPage = pageNumber;
        } else {
            currentPage = 1; // Default to first page if invalid
        }

        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        updatePagination(currentPage, totalPages);
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, filteredRows, allRows);
    }

    // Initialize with the first page
    goToPage(1);
} 
