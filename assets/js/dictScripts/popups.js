import { processAllSettings } from './processRows.js';
import { updatePendingChangesList } from './init.js';

export function initAdvancedSearchPopup(allRows, rowsPerPage, displayPage, pendingChanges, currentLanguage) {
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
        
        await updatePendingChangesList(pendingChanges, currentLanguage);
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
