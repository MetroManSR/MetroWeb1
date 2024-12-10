import { processRows } from './processRows.js';

export function initAdvancedSearchPopup(allRows, rowsPerPage, displayPage) {
    let pendingChanges = {
        searchTerm: '',
        exactMatch: false,
        searchIn: { word: true, root: true, definition: false, etymology: false },
        filters: [],
        rowsPerPage: 20
    };

    const updatePendingChangesList = () => {
        const pendingChangesContainer = document.getElementById('dict-pending-changes');
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage } = pendingChanges;
        let changesList = [];

        if (searchTerm) changesList.push(`Search Term: "${searchTerm}"`);
        if (exactMatch) changesList.push(`Exact Match: On`);
        if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
            let searchInFields = [];
            if (searchIn.word) searchInFields.push('Word');
            if (searchIn.root) searchInFields.push('Root');
            if (searchIn.definition) searchInFields.push('Definition');
            if (searchIn.etymology) searchInFields.push('Etymology');
            changesList.push(`Search In: ${searchInFields.join(', ')}`);
        }
        if (filters.length > 0) changesList.push(`Filters: ${filters.join(', ')}`);
        if (rowsPerPage !== 20) changesList.push(`Rows Per Page: ${rowsPerPage}`);

        pendingChangesContainer.innerHTML = changesList.length > 0 ? `<ul>${changesList.map(item => `<li>${item}</li>`).join('')}</ul>` : 'No pending changes';
    };

    document.getElementById('dict-apply-settings-button').addEventListener('click', () => {
        const { searchTerm, exactMatch, searchIn, filters } = pendingChanges;
        const criteria = { searchTerm, exactMatch, searchIn, filters };
        processRows(allRows, criteria, rowsPerPage, displayPage);
    });

    document.getElementById('dict-advanced-search-button').addEventListener('click', () => {
        document.getElementById('dict-advanced-search-popup').classList.add('active');
        document.getElementById('dict-popup-overlay').classList.add('active');
    });

    document.getElementById('dict-close-popup-button').addEventListener('click', () => {
        document.getElementById('dict-advanced-search-popup').classList.remove('active');
        document.getElementById('dict-popup-overlay').classList.remove('active');
    });

    document.getElementById('dict-add-search-button-popup').addEventListener('click', () => {
        const searchTerm = document.getElementById('dict-search-input').value.trim();
        const searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges = { ...pendingChanges, searchTerm, exactMatch, searchIn, filters: selectedFilters };
        updatePendingChangesList();
    });

    document.getElementById('dict-apply-search-button-popup').addEventListener('click', () => {
        const { searchTerm, exactMatch, searchIn, filters, rowsPerPage } = pendingChanges;
        const criteria = { searchTerm, exactMatch, searchIn, filters };
        processRows(allRows, criteria, rowsPerPage, displayPage);
        pendingChanges = { searchTerm: '', exactMatch: false, searchIn: { word: false, root: false, definition: false, etymology: false }, filters: [], rowsPerPage: 20 };
        updatePendingChangesList();
        document.getElementById('dict-advanced-search-popup').classList.remove('active');
        document.getElementById('dict-popup-overlay').classList.remove('active');
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

export function initStatisticsPopup(allRows) {
    document.getElementById('dict-view-statistics-button').addEventListener('click', () => {
        const totalWords = allRows.filter(row => row.type === 'word').length;
        const totalRoots = allRows.filter(row => row.type === 'root').length;

        const partOfSpeechCounts = allRows.reduce((counts, row) => {
            if (row.type === 'word' && row.partofspeech) {
                counts[row.partofspeech] = (counts[row.partofspeech] || 0) + 1;
            }
            return counts;
        }, {});

        const statisticsContainer = document.getElementById('dict-statistics-popup');
        statisticsContainer.innerHTML = `
            <h3>Statistics</h3>
            <p>Total Words: ${totalWords}</p>
            <p>Total Roots: ${totalRoots}</p>
            <h4>Total Words per Part of Speech:</h4>
            <ul>
                ${Object.entries(partOfSpeechCounts).map(([pos, count]) => `<li>${pos}: ${count}</li>`).join('')}
            </ul>
            <button id="dict-close-statistics-button" class="btn">Close</button>
        `;

        statisticsContainer.classList.add('active');
        document.getElementById('dict-popup-overlay').classList.add('active');

        document.getElementById('dict-close-statistics-button').addEventListener('click', () => {
            statisticsContainer.classList.remove('active');
            document.getElementById('dict-popup-overlay').classList.remove('active');
        });
    });
}
