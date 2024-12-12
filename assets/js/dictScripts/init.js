import { getRelatedWordsByRoot, highlight } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js'; // Ensure this is imported if used

export function initializeEventListeners(allRows, allRowsById, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage) {
    let currentPage = 1;
    let filteredRows = [];
    let previouslySelectedBox = null;

    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.addEventListener('change', () => {
            pendingChanges.sortOrder = orderBySelect.value;
            updatePendingChangesList();
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
            initAdvancedSearchPopup(allRows, rowsPerPage, displayPage);
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
            const { searchTerm, exactMatch, searchIn, filters } = pendingChanges;
            const criteria = { searchTerm, exactMatch, searchIn, filters };
            processRows(allRows, criteria, rowsPerPage, displayPage);
        });
    }

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
            return;
        }

        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em';

        const language = document.querySelector('meta[name="language"]').content || 'en';

        if (row.type === 'root') {
            if (row.related && row.related.length > 0) {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('derivativeWords', language)}:</strong> ${row.related.map(dw => `<a href="?entry-${dw.id}" style="color: green;">${highlight(dw.title, pendingChanges.searchTerm)}</a>`).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('derivativeWords', language)}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        } else {
            const relatedWords = row.related || [];

            relatedWordsElement.innerHTML = `<strong>${await getTranslatedText('relatedWords', language)}:</strong> ${relatedWords.length > 0 ? relatedWords.map(rw => `<a href="?entry-${rw.id}" style="color: green;">${highlight(rw.title, pendingChanges.searchTerm)}</a>`).join(', ') : await getTranslatedText('noneFound', language)}`;
        }

        if (relatedWordsElement.scrollHeight > 3 * parseFloat(getComputedStyle(relatedWordsElement).lineHeight)) {
            relatedWordsElement.style.maxHeight = '3em';
            relatedWordsElement.style.overflowY = 'auto';
        }

        box.appendChild(relatedWordsElement);

        previouslySelectedBox = box;
    });

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
            currentPage = 1;
        }

        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        updatePagination(currentPage, totalPages);
        displayPage(currentPage, rowsPerPage, pendingChanges.searchTerm, pendingChanges.searchIn, pendingChanges.exactMatch, filteredRows, allRows);
    }

    goToPage(1);
}
