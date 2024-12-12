import { getRelatedWordsByRoot, highlight, createHyperlink } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './popups.js'; // Ensure this is imported if used

export function initializeEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage) {
    let currentPage = 1;
    let filteredRows = [];
    let previouslySelectedBox = null;
    let lastClickTime = 0;

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

    async function handleClickEvent(e) {
        const now = Date.now();
        if (now - lastClickTime < 250) return; // 0.25 second cooldown
        lastClickTime = now;

        e.stopPropagation(); // Stop event propagation to avoid duplicate events
        e.preventDefault();  // Prevent default action to ensure correct handling

        const box = e.target.closest('.dictionary-box');
        if (!box) return;

        const rowId = parseInt(box.id.replace('entry-', ''), 10);
        const row = allRows.find(r => r.id === rowId);

        if (!row) {
            console.error(`Row with id ${rowId} not found.`);
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

        const language = document.querySelector('meta[name="language"]').content || 'en';

        let derivativeWordsLabel = '';
        let relatedWordsLabel = '';

        if (row.type === 'root') {
            derivativeWordsLabel = await getTranslatedText('derivativeWords', language);
            if (row.related && row.related.length > 0) {
                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${row.related.map(dw => createHyperlink(dw, pendingChanges.searchTerm)).join(', ')}`;
            } else if (pendingChanges.searchTerm) {
                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        } else {
            relatedWordsLabel = await getTranslatedText('relatedWords', language);
            const relatedWords = row.related || [];

            if (relatedWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${relatedWords.map(rw => createHyperlink(rw, pendingChanges.searchTerm)).join(', ')}`;
            } else if (pendingChanges.searchTerm) {
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
    dictionaryContainer.addEventListener('pointerdown', handleClickEvent);

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
