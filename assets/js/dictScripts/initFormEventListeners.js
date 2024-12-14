import { getTranslatedText } from './loadTexts.js';
import { processAllSettings } from './processRows.js';
import { boxClickListener } from './boxEvents.js';

export const defaultPendingChanges = {
    searchTerm: '',
    exactMatch: false,
    searchIn: { word: true, root: true, definition: false, etymology: false },
    filters: [],
    rowsPerPage: 20,
    sortOrder: 'titleup' // Default sort order
};

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

    boxClickListener(allRows, language);
    
}
