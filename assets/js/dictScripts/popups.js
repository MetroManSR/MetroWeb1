import { processAllSettings } from './processRows.js';

export function initAdvancedSearchPopup(allRows, rowsPerPage, displayPage, pendingChanges, currentLanguage) {
    const updatePendingChangesList = async () => {
        const pendingChangesContainer = document.getElementById('dict-pending-changes');
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage } = pendingChanges;
        let changesList = [];

        if (searchTerm) {
            const translatedSearchTerm = await getTranslatedText('searchTerm', currentLanguage);
            changesList.push(`<strong>${translatedSearchTerm}</strong>: "${searchTerm}"`);
        }
        if (exactMatch) {
            const translatedExactMatch = await getTranslatedText('exactMatch', currentLanguage);
            changesList.push(`<strong>${translatedExactMatch}</strong>: On`);
        }
        if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
            let searchInFields = [];
            if (searchIn.word) searchInFields.push(await getTranslatedText('searchInWord', currentLanguage));
            if (searchIn.root) searchInFields.push(await getTranslatedText('searchInRoot', currentLanguage));
            if (searchIn.definition) searchInFields.push(await getTranslatedText('searchInDefinition', currentLanguage));
            if (searchIn.etymology) searchInFields.push(await getTranslatedText('searchInEtymology', currentLanguage));
            const translatedSearchIn = await getTranslatedText('searchIn', currentLanguage);
            changesList.push(`<strong>${translatedSearchIn}</strong>: ${searchInFields.join(', ')}`);
        }
        if (filters.length > 0) {
            const translatedFilters = await getTranslatedText('filters', currentLanguage);
            const translatedFilterValues = await Promise.all(filters.map(async filter => await getTranslatedText(filter, currentLanguage)));
            changesList.push(`<strong>${translatedFilters}</strong>: ${translatedFilterValues.join(', ')}`);
        }
        if (rowsPerPage !== 20) {
            const translatedRowsPerPage = await getTranslatedText('rowsPerPage', currentLanguage);
            changesList.push(`<strong>${translatedRowsPerPage}</strong>: ${rowsPerPage}`);
        }

        const translatedPendingChanges = await getTranslatedText('pendingChanges', currentLanguage);
        const translatedNoPendingChanges = await getTranslatedText('noPendingChanges', currentLanguage);
        pendingChangesContainer.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : `<p>${translatedNoPendingChanges}</p>`;
    };

    document.getElementById('dict-apply-settings-button').addEventListener('click', () => {
        processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage);
    });

    document.getElementById('dict-advanced-search-button').addEventListener('click', () => {
        const advancedSearchPopup = document.getElementById('dict-advanced-search-popup');
        document.getElementById('dict-popup-overlay').classList.add('active');
        advancedSearchPopup.classList.add('active');

        // Load previous selections if any
        document.getElementById('dict-search-input').value = pendingChanges.searchTerm || '';
        document.getElementById('dict-search-in-word').checked = pendingChanges.searchIn.word;
        document.getElementById('dict-search-in-root').checked = pendingChanges.searchIn.root;
        document.getElementById('dict-search-in-definition').checked = pendingChanges.searchIn.definition;
        document.getElementById('dict-search-in-etymology').checked = pendingChanges.searchIn.etymology;
        document.getElementById('dict-exact-match').checked = pendingChanges.exactMatch;

        // Set selected filters
        const wordFilterSelect = document.getElementById('dict-word-filter');
        Array.from(wordFilterSelect.options).forEach(option => {
            option.selected = pendingChanges.filters.includes(option.value);
        });
    });

    document.getElementById('dict-close-popup-button').addEventListener('click', () => {
        document.getElementById('dict-advanced-search-popup').classList.remove('active');
        document.getElementById('dict-popup-overlay').classList.remove('active');
    });

    document.getElementById('dict-add-search-button-popup').addEventListener('click', async () => {
        const searchTerm = document.getElementById('dict-search-input').value.trim();
        const searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges.searchTerm = searchTerm;
        pendingChanges.exactMatch = exactMatch;
        pendingChanges.searchIn = searchIn;
        pendingChanges.filters = selectedFilters;
        
        await updatePendingChangesList(currentLanguage);
    });

    // Ensure all checkboxes are checked by default
    const searchInWord = document.getElementById('dict-search-in-word');
    const searchInRoot = document.getElementById('dict-search-in-root');
    const searchInDefinition = document.getElementById('dict-search-in-definition');
    const searchInEtymology = document.getElementById('dict-search-in-etymology');

    if (searchInWord) searchInWord.checked = true;
    if (searchInRoot) searchInRoot.checked = true;
    if (searchInDefinition) searchInDefinition.checked = true;
    if (searchInEtymology) searchInEtymology.checked = true;
}
