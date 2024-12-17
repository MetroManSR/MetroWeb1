import { processAllSettings } from './processRows.js';
import { universalPendingChanges, updateUniversalPendingChanges,  defaultPendingChanges, updatePendingChangesList } from './initFormEventListeners.js';
import { filteredRows } from '../mainDict.js';

const advancedSearchPopup = document.getElementById('dict-advanced-search-popup');
const advancedSearchOverlay = document.getElementById('popup-overlay');
const closeAdvancedSearch = document.getElementById('dict-close-advanced-search');
const addSearchBtnPopup = document.getElementById('dict-add-search-btn-popup');

export async function initAdvancedSearchPopup(allRows, rowsPerPage, currentLanguage) {
    // Load previous selections if any 

    
    const pendingChanges = universalPendingChanges ? universalPendingChanges : { ...defaultPendingChanges };

    await advancedSearchPopup.classList.remove('hidden');
    await advancedSearchOverlay.classList.add('active');   
    await closeAdvancedSearch.classList.add('active');   
   
        document.getElementById('dict-search-input').value = pendingChanges.searchTerm || '';
        document.getElementById('dict-search-in-word').checked = pendingChanges.searchIn.word;
        document.getElementById('dict-search-in-root').checked = pendingChanges.searchIn.root;
        document.getElementById('dict-search-in-definition').checked = pendingChanges.searchIn.definition;
        document.getElementById('dict-search-in-etymology').checked = pendingChanges.searchIn.etymology;
        document.getElementById('dict-exact-match').checked = pendingChanges.exactMatch;
        document.getElementById('dict-ignore-diacritics').checked = pendingChanges.ignoreDiacritics;
        document.getElementById('dict-starts-with').checked = pendingChanges.startsWith;
        document.getElementById('dict-ends-with').checked = pendingChanges.endsWith;

        const wordFilterSelect = document.getElementById('dict-word-filter');
        Array.from(wordFilterSelect.options).forEach(option => {
            option.selected = pendingChanges.filters.includes(option.value);
        });
    

    closeAdvancedSearch.addEventListener('click', async () => {
        await advancedSearchPopup.classList.remove('active');
        await advancedSearchOverlay.classList.remove('active');
        await closeAdvancedSearch.classList.remove('active');

    });

    addSearchBtnPopup.addEventListener('click', async () => {
        const searchTerm = document.getElementById('dict-search-input').value.trim();
        const searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        const ignoreDiacritics = document.getElementById('dict-ignore-diacritics')?.checked || false;
        const startsWith = document.getElementById('dict-starts-with')?.checked || false;
        const endsWith = document.getElementById('dict-ends-with')?.checked || false;

        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges.searchTerm = searchTerm;
        pendingChanges.exactMatch = exactMatch;
        pendingChanges.searchIn = searchIn;
        pendingChanges.filters = selectedFilters;
        pendingChanges.ignoreDiacritics = ignoreDiacritics;
        pendingChanges.startsWith = startsWith;
        pendingChanges.endsWith = endsWith;

        updatePendingChangesList(pendingChanges);
        await updatePendingChangesList(currentLanguage);
        await processAllSettings(allRows, rowsPerPage, 1, pendingChanges.sortOrder);
    });
}

export async function initStatisticsPopup(allRows) {
    const statisticsPopup = document.getElementById('dict-statistics-popup');
    const popupOverlay = document.getElementById('dict-statistics-popup-overlay');

    if (statisticsPopup.classList.contains('active')) {
       await statisticsPopup.classList.remove('active');
       await popupOverlay.classList.remove('active');
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

        document.getElementById('dict-close-statistics-button').addEventListener('click', async () => {
           await statisticsPopup.classList.remove('active');
           await popupOverlay.classList.remove('active');
        });
    }
}
