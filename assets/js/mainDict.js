import { fetchData } from './dictScripts/fetchData.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';
import { initializeEventListeners } from './dictScripts/init.js';
import { cleanData } from './dictScripts/csvUtils.js';
import { createPaginationControls } from './dictScripts/pagination.js';
import { processRows, advancedSearch } from './dictScripts/processRows.js';
import { displayPage, wordSpecific, rootSpecific, displaySpecificEntry } from './dictScripts/dictSearch.js';

function showLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

function hideLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

showLoadingMessage();

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded event triggered');

    hideLoadingMessage();

    const defaultRowsPerPage = 20;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
    let filteredRows = [];
    let allRows = [];
    let allRowsById = {};

    function displayError(message) {
        const errorContainer = document.getElementById('dict-error-message');
        errorContainer.innerHTML = `<p>${message}</p>`;
        errorContainer.style.display = 'block';
    }

    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified
    console.log('Language set to:', language);

    await setTexts(language);

    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    const rootsFile = location.pathname.includes('/en/') ? '../../assets/data/english-roots.csv' : '../../assets/data/balkeon-roots-es.csv';

    try {
        console.log('Fetching data...');
        const [dictionaryData, rootsData] = await Promise.all([fetchData(dictionaryFile, 'word'), fetchData(rootsFile, 'root')]);

        const cleanedDictionaryData = cleanData(dictionaryData, 'word').sort((a, b) => a.title.localeCompare(b.title));
        const cleanedRootsData = cleanData(rootsData, 'root').sort((a, b) => a.title.localeCompare(b.title));

        cleanedDictionaryData.forEach((item, index) => { item.id = index + 1; });
        cleanedRootsData.forEach((item, index) => { item.id = index + 1; });

        allRows = [...cleanedDictionaryData, ...cleanedRootsData].sort((a, b) => a.title.localeCompare(b.title));
        filteredRows = allRows.filter(row => row.title && row.meta);

        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });

        console.log('Creating pagination controls...');
        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage, rowsPerPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);

        // Handle URL parameters
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        const wordSpecificTerm = params.get('wordSpecific');
        const rootSpecificTerm = params.get('rootSpecific');
        
        if (searchTerm && searchTerm.trim()) {
            const criteria = { searchTerm: searchTerm.trim() };
            processRows(allRows, criteria, rowsPerPage, displayPage, currentPage);
        } else if (wordID && parseInt(wordID) > 0) {
            displaySpecificEntry(allRowsById[wordID], allRows);
        } else if (rootID && parseInt(rootID) > 0) {
            displaySpecificEntry(allRowsById[rootID], allRows);
        } else if (wordSpecificTerm && wordSpecificTerm.trim()) {
            wordSpecific(wordSpecificTerm, allRows);
        } else if (rootSpecificTerm && rootSpecificTerm.trim()) {
            rootSpecific(rootSpecificTerm, allRows);
        }

        // Initialize advanced search form
        const advancedSearchForm = document.getElementById('advanced-search-form');
        if (advancedSearchForm) {
            advancedSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(advancedSearchForm);
                const params = {
                    searchTerm: formData.get('search-term'),
                    word: formData.get('search-in-word') === 'on',
                    root: formData.get('search-in-root') === 'on',
                    definition: formData.get('search-in-definition') === 'on',
                    etymology: formData.get('search-in-etymology') === 'on',
                    exactMatch: formData.get('exact-match') === 'on'
                };
                advancedSearch(params, allRows, rowsPerPage, displayPage);
            });
        }

        // Hide the loading message after JS is ready
        document.getElementById('dict-loading-message').style.display = 'none';
    } catch (error) {
        console.error('Error loading data:', error);
        displayError('Failed to load dictionary data. Please try again later.');
        // Hide the loading message in case of an error
        document.getElementById('dict-loading-message').style.display = 'none';
    }

    // Initialize event listeners
    initializeEventListeners(allRows, allRowsById, rowsPerPage);

    // Initialize popup systems
    initAdvancedSearchPopup(allRows, rowsPerPage, displayPage);
    initStatisticsPopup(allRows);
    console.log('Initialization complete');
});
