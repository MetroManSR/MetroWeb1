import { processAllSettings } from './processRows.js';
import { universalPendingChanges, updatePendingChangesList } from './initFormEventListeners.js';


export function initAdvancedSearchPopup(allRows, rowsPerPage, displayPage, pendingChanges, currentLanguage) {
   
    pendingChanges = universalPendingChanges;
    
    const advancedSearchPopup = document.getElementById('dict-advanced-search-popup');
    const popupOverlay = document.getElementById('dict-popup-overlay-advse');

    if (advancedSearchPopup.classList.contains('active')) {
        advancedSearchPopup.classList.remove('active');
        popupOverlay.classList.remove('active');
    } else {
        // Add class to make popup visible
        popupOverlay.classList.add('active');
        advancedSearchPopup.classList.add('active');

        // Load previous selections if any
        document.getElementById('dict-search-input').value = pendingChanges.searchTerm || '';
        document.getElementById('dict-search-in-word').checked = pendingChanges.searchIn.word;
        document.getElementById('dict-search-in-root').checked = pendingChanges.searchIn.root;
        document.getElementById('dict-search-in-definition').checked = pendingChanges.searchIn.definition;
        document.getElementById('dict-search-in-etymology').checked = pendingChanges.searchIn.etymology;
        document.getElementById('dict-exact-match').checked = pendingChanges.exactMatch;

        // New filters
        document.getElementById('dict-ignore-diacritics').checked = pendingChanges.ignoreDiacritics;
        document.getElementById('dict-starts-with').checked = pendingChanges.startsWith;
        document.getElementById('dict-ends-with').checked = pendingChanges.endsWith;

        // Set selected filters
        const wordFilterSelect = document.getElementById('dict-word-filter');
        Array.from(wordFilterSelect.options).forEach(option => {
            option.selected = pendingChanges.filters.includes(option.value);
        });
    }

    document.getElementById('dict-close-popup-button').addEventListener('click', () => {
        advancedSearchPopup.classList.remove('active');
        popupOverlay.classList.remove('active');
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

        // New filters
        const ignoreDiacritics = document.getElementById('dict-ignore-diacritics')?.checked || false;
        const startsWith = document.getElementById('dict-starts-with')?.checked || false;
        const endsWith = document.getElementById('dict-ends-with')?.checked || false;

        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges.searchTerm = searchTerm;
        pendingChanges.exactMatch = exactMatch;
        pendingChanges.searchIn = searchIn;
        pendingChanges.filters = selectedFilters;
        
        // New filters
        pendingChanges.ignoreDiacritics = ignoreDiacritics;
        pendingChanges.startsWith = startsWith;
        pendingChanges.endsWith = endsWith;

        await updatePendingChangesList(pendingChanges, currentLanguage);
        processAllSettings(pendingChanges, allRows, rowsPerPage, displayPage, 1, pendingChanges.sortOrder);
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

// Initialize Statistics Popup
export function initStatisticsPopup(allRows) {
    const statisticsPopup = document.getElementById('dict-statistics-popup');
    const popupOverlay = document.getElementById('dict-popup-overlay');

    if (statisticsPopup.classList.contains('active')) {
        statisticsPopup.classList.remove('active');
        popupOverlay.classList.remove('active');
    } else {
        const totalWords = allRows.filter(row => row.type === 'word').length;
        const totalRoots = allRows.filter(row => row.type === 'root').length;

        const partOfSpeechCounts = allRows.reduce((counts, row) => {
            if (row.type === 'word' && row.partofspeech) {
                counts[row.partofspeech] = (counts[row.partofspeech] || 0) + 1;
            }
            return counts;
        }, {});

        statisticsPopup.innerHTML = `
            <h3>Statistics</h3>
            <p>Total Words: ${totalWords}</p>
            <p>Total Roots: ${totalRoots}</p>
            <h4>Total Words per Part of Speech:</h4>
            <ul>
                ${Object.entries(partOfSpeechCounts).map(([pos, count]) => `<li>${pos}: ${count}</li>`).join('')}
            </ul>
            <button id="dict-close-statistics-button" class="btn">Close</button>
        `;

        statisticsPopup.classList.add('active');
        popupOverlay.classList.add('active');

        document.getElementById('dict-close-statistics-button').addEventListener('click', () => {
            statisticsPopup.classList.remove('active');
            popupOverlay.classList.remove('active');
        });
    }
}
