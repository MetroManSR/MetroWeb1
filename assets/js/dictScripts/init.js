import { updatePendingChangesList } from './initDefaultValues.js';
import { processAllSettings } from './processRows.js';

export function initializeFormEventListeners(allRows, pendingChanges, rowsPerPage, displayPage) {
    const language = document.querySelector('meta[name="language"]').content || 'en';

    const filterSelect = document.getElementById('dict-word-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            pendingChanges.filters = Array.from(filterSelect.selectedOptions).map(option => option.value);
            updatePendingChangesList(pendingChanges, language);
        });
    }

    const searchInput = document.getElementById('dict-search-input');
    const predictionBox = document.getElementById('dict-search-predictions');

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        predictionBox.style.width = `${searchInput.offsetWidth}px`;
        
        if (searchTerm.length === 0) {
            predictionBox.innerHTML = '';
            pendingChanges.searchTerm = '';
            updatePendingChangesList(pendingChanges, language);
            return;
        }

        const searchIn = pendingChanges.searchIn;
        const predictions = allRows
            .filter(row => {
                const titleMatch = searchIn.word && row.type === 'word' && row.title.toLowerCase().includes(searchTerm);
                const rootMatch = searchIn.root && row.type === 'root' && row.title.toLowerCase().includes(searchTerm);
                const definitionMatch = searchIn.definition && row.meta.toLowerCase().includes(searchTerm);
                const etymologyMatch = searchIn.etymology && row.morph.some(morphItem => morphItem.toLowerCase().includes(searchTerm));
                return titleMatch || rootMatch || definitionMatch || etymologyMatch;
            })
            .slice(0, 10)
            .map(row => row.title);

        if (predictions.length === 0) {
            predictionBox.innerHTML = '';
            pendingChanges.searchTerm = searchTerm;
            updatePendingChangesList(pendingChanges, language);
            return;
        }

        predictionBox.innerHTML = predictions.map(title => `<div>${highlight(title, searchTerm, pendingChanges.searchIn, { title })}</div>`).join('');
    });

    // Event listeners for advanced search checkboxes
    document.getElementById('dict-search-in-word').addEventListener('change', (event) => {
        pendingChanges.searchIn.word = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-root').addEventListener('change', (event) => {
        pendingChanges.searchIn.root = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-definition').addEventListener('change', (event) => {
        pendingChanges.searchIn.definition = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-search-in-etymology').addEventListener('change', (event) => {
        pendingChanges.searchIn.etymology = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-exact-match').addEventListener('change', (event) => {
        pendingChanges.exactMatch = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-ignore-diacritics').addEventListener('change', (event) => {
        pendingChanges.ignoreDiacritics = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-starts-with').addEventListener('change', (event) => {
        pendingChanges.startsWith = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    document.getElementById('dict-ends-with').addEventListener('change', (event) => {
        pendingChanges.endsWith = event.target.checked;
        updatePendingChangesList(pendingChanges, language);
    });

    const rowsPerPageInput = document.getElementById('dict-rows-per-page-input');
    if (rowsPerPageInput) {
        rowsPerPageInput.addEventListener('change', (event) => {
            pendingChanges.rowsPerPage = parseInt(event.target.value, 10) || 20;
            updatePendingChangesList(pendingChanges, language);
        });
    }
}
