import { fetchData } from './dictScripts/fetchData.js';
import { createPaginationControls } from './dictScripts/pagination.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';
import { filterAndDisplayWord, displayPage } from './dictScripts/dictSearch.js';
import { initializeEventListeners } from './dictScripts/init.js';
import { cleanData } from './dictScripts/csvUtils.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded event triggered');
    // Display the loading message
    document.getElementById('loading-message').style.display = 'block';

    const defaultRowsPerPage = 20;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
    let filteredRows = [];
    let allRows = [];
    let allRowsById = {};

    // Function to display error messages
    function displayError(message) {
        const errorContainer = document.getElementById('error-message');
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
        displayPage(currentPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        if ((searchTerm && searchTerm.trim()) || (wordID && parseInt(wordID) > 0) || (rootID && parseInt(rootID) > 0)) {
            filterAndDisplayWord(searchTerm ? searchTerm.trim() : '', wordID, rootID, allRows, allRowsById, rowsPerPage, displayPage);
        }

        // Hide the loading message after JS is ready
        document.getElementById('loading-message').style.display = 'none';
    } catch (error) {
        console.error('Error loading data:', error);
        displayError('Failed to load dictionary data. Please try again later.');
        // Hide the loading message in case of an error
        document.getElementById('loading-message').style.display = 'none';
    }

    // Initialize event listeners
    initializeEventListeners(allRows, allRowsById, rowsPerPage);

    // Initialize popup systems
    initAdvancedSearchPopup();
    initStatisticsPopup(allRows);
    console.log('Initialization complete');
});
