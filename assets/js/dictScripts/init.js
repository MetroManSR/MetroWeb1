import { processAllSettings } from './processRows.js';

export function initializeEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage) {
    let currentPage = 1;
    let previouslySelectedBox = null;
    let lastClickTime = 0;

    // Ensure pendingChanges list is visible on page load
    const pendingChangesElement = document.getElementById('dict-pending-changes');
    if (pendingChangesElement) {
        pendingChangesElement.style.display = 'block';
    }

    function updatePendingChangesList() {
        if (!pendingChangesElement) return;

        const changes = [];
        if (pendingChanges.searchTerm) changes.push(`Search Term: ${pendingChanges.searchTerm}`);
        if (pendingChanges.exactMatch) changes.push('Exact Match');
        if (pendingChanges.filters.length) changes.push(`Filters: ${pendingChanges.filters.join(', ')}`);
        if (pendingChanges.sortOrder) changes.push(`Sort Order: ${pendingChanges.sortOrder}`);

        pendingChangesElement.innerHTML = changes.length ? `Pending Changes: ${changes.join(', ')}` : 'No pending changes.';
    }

    updatePendingChangesList();

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
                rowsPerPage: 20
            };
            updatePendingChangesList();
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

    const cleanSearchButton = document.getElementById('dict-clear-search-button');
    if (cleanSearchButton) {
        cleanSearchButton.addEventListener('click', () => {
            pendingChanges.searchTerm = '';
            document.getElementById('dict-search-input').value = '';
            updatePendingChangesList();
            processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
            // Remove URL parameters without reloading the page
            history.pushState({}, document.title, window.location.pathname);
        });
    }

    const searchInput = document.getElementById('dict-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            pendingChanges.searchTerm = e.target.value;
            updatePendingChangesList();
        });
    }

    const rowsPerPageSelect = document.getElementById('dict-rows-per-page-input');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', () => {
            pendingChanges.rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
            updatePendingChangesList();
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

        const box = target.closest('.dictionary-box');
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
                console.log('Derivatives:', row.related); // Debugging
                const relatedWordsHtml = row.related.map(dw => {
                    if (typeof dw === 'string') {
                        const relatedWord = allRows.find(r => r.title.trim().toLowerCase() === dw.trim().toLowerCase());
                        console.log('Related word from string:', dw, 'Related word:', relatedWord);
                        return relatedWord ? `${dw} [${relatedWord.id}]: ${createHyperlink(dw, pendingChanges.searchTerm, allRows)}` : dw;
                    }
                    console.log('Derivative word:', dw);
                    return `${dw.title} [${dw.id}]: ${createHyperlink(dw.title, pendingChanges.searchTerm, allRows)}`;
                }).join(', ');
                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${relatedWordsHtml}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        } else {
            relatedWordsLabel = await getTranslatedText('relatedWords', language);
            const relatedWords = row.related || [];

            if (relatedWords.length > 0) {
                console.log('Related Words:', relatedWords); // Debugging
                const relatedWordsHtml = relatedWords.map(rw => {
                    if (typeof rw === 'string') {
                        const relatedWord = allRows.find(r => r.title.trim().toLowerCase() === rw.trim().toLowerCase());
                        console.log('Related word from string:', rw, 'Related word:', relatedWord);
                        return relatedWord ? `${rw} [${relatedWord.id}]: ${createHyperlink(rw, pendingChanges.searchTerm, allRows)}` : rw;
                    }
                    console.log('Related word:', rw);
                    return `${rw.title} [${rw.id}]: ${createHyperlink(rw.title, pendingChanges.searchTerm, allRows)}`;
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
