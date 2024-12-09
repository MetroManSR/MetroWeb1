import { fetchData } from './dictScripts/fetchData.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';
import { initializeEventListeners } from './dictScripts/init.js';
import { cleanData } from './dictScripts/csvUtils.js';
import { createPaginationControls } from './dictScripts/pagination.js';
import { processRows } from './dictScripts/processRows.js';
import { displayPage } from './dictScripts/dictSearch.js';

    // Function to show the loading message
function showLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

// Function to hide the loading message
function hideLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// Show the loading message when the dictionary is being loaded
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

    // Function to display error messages
    function displayError(message) {
        const errorContainer = document.getElementById('dict-error-message');
        errorContainer.innerHTML = `<p>${message}</p>`;
        errorContainer.style.display = 'block';
    }

    // Fetch the frontmatter to determine the language
    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified
    console.log('Language set to:', language);

    await setTexts(language);

    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    const rootsFile = location.pathname.includes('/en/') ? '../../assets/data/english-roots.csv' : '../../assets/data/balkeon-roots-es.csv';

    try {
        console.log('Fetching data...');
        const [dictionaryData, rootsData] = await Promise.all([fetchData(dictionaryFile, 'word'), fetchData(rootsFile, 'root')]);

        // Clean and sort data alphabetically
        const cleanedDictionaryData = cleanData(dictionaryData, 'word').sort((a, b) => a.word.localeCompare(b.word));
        const cleanedRootsData = cleanData(rootsData, 'root').sort((a, b) => a.word.localeCompare(b.word));

        // Assign unique IDs to roots and words separately, starting at 1
        cleanedDictionaryData.forEach((item, index) => { item.id = index + 1; });
        cleanedRootsData.forEach((item, index) => { item.id = index + 1; });

        // Combine the cleaned and sorted data for display
        allRows = [...cleanedDictionaryData, ...cleanedRootsData].sort((a, b) => a.word.localeCompare(b.word));
        filteredRows = allRows.filter(row => row.word && row.definition);

        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });

        console.log('Creating pagination controls...');
        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage, rowsPerPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        if ((searchTerm && searchTerm.trim()) || (wordID && parseInt(wordID) > 0) || (rootID && parseInt(rootID) > 0)) {
            const criteria = {
                searchTerm: searchTerm ? searchTerm.trim() : '',
                wordID: wordID,
                rootID: rootID
            };
            processRows(allRows, criteria, rowsPerPage, displayPage, currentPage);
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
