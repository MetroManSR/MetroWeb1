import { fetchData } from './dictScripts/fetchData.js';
import { highlight } from './dictScripts/searchHighlight.js';
import { createPaginationControls, updatePagination } from './dictScripts/pagination.js';
import { displayWarning } from './dictScripts/warnings.js';
import { getRelatedWordsByRoot } from './dictScripts/utils.js';
import { createDictionaryBox } from './dictScripts/boxes.js';
import { cleanData, sanitizeHTML } from './dictScripts/csvUtils.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded event triggered');
    // Display the loading message
    document.getElementById('loading-message').style.display = 'block';

    const defaultRowsPerPage = 20;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;

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
    let allRows = [];
    let filteredRows = [];
    let allRowsById = {};

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
        displayPage(currentPage);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        if ((searchTerm && searchTerm.trim()) || (wordID && parseInt(wordID) > 0) || (rootID && parseInt(rootID) > 0)) {
            filterAndDisplayWord(searchTerm ? searchTerm.trim() : '', wordID, rootID);
        }

        // Hide the loading message after JS is ready
        document.getElementById('loading-message').style.display = 'none';
    } catch (error) {
        console.error('Error loading data:', error);
        displayError('Failed to load dictionary data. Please try again later.');
        // Hide the loading message in case of an error
        document.getElementById('loading-message').style.display = 'none';
    }

    function displayPage(page, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false) {
        console.log('Displaying page:', page);
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dictionaryContainer = document.getElementById('dictionary');

        if (!dictionaryContainer) {
            console.error('Dictionary container not found');
            return;
        }

        dictionaryContainer.innerHTML = ''; // Clear previous entries

        const validRows = filteredRows.filter(row => row.word && row.definition);
        const rowsToDisplay = validRows.slice(start, end); // Ensure rowsToDisplay is defined

        rowsToDisplay.forEach((row, index) => {
            const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
            if (box) {
                setTimeout(() => {
                    dictionaryContainer.appendChild(box);
                }, index * 100); // Delay each box by 100ms for fade-in effect
            } else {
                console.error('Failed to create a valid object for:', row);
            }
        });

        updatePagination(currentPage, validRows, rowsPerPage);
    }

    function filterAndDisplayWord(searchTerm, wordID, rootID) {
        console.log('Filtering and displaying word:', searchTerm || wordID || rootID);
        const searchIn = {
            word: document.getElementById('search-in-word')?.checked || false,
            root: document.getElementById('search-in-root')?.checked || false,
            definition: document.getElementById('search-in-definition')?.checked || false,
            etymology: document.getElementById('search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('exact-match')?.checked || false;
        const selectedFilters = Array.from(document.getElementById('word-filter').selectedOptions).map(option => option.value);

        // If no filters are selected, show all
        const showAll = selectedFilters.length === 0;

        if ((!searchTerm.trim() && (!wordID || parseInt(wordID) <= 0) && (!rootID || parseInt(rootID) <= 0))) return;

        if (searchTerm && searchTerm.trim()) {
            filteredRows = allRows.filter(row => {
                const wordMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
                const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
                return showAll || selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech?.toLowerCase()) || wordMatch || rootMatch || definitionMatch || etymologyMatch;
            });

            filteredRows.sort((a, b) => a.word.localeCompare(b.word));
            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            displayPage(1, searchTerm, searchIn, exactMatch);
        } else if (wordID && parseInt(wordID) > 0) {
            const row = allRowsById[parseInt(wordID)];
            if (row) {
                filteredRows = [row];
                createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
                displayPage(1, '', searchIn, exactMatch);
            }
        } else if (rootID && parseInt(rootID) > 0) {
            const row = allRowsById[parseInt(rootID)];
            if (row) {
                filteredRows = [row];
                createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
                displayPage(1, '', searchIn, exactMatch);
            }
        }
    }

// Add event listener to the search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            filterAndDisplayWord(searchTerm, '', '');
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        filterAndDisplayWord(searchTerm, '', '');
    });

    // Add event listener to clear the search
    document.getElementById('clear-search-button').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        window.history.pushState({}, document.title, window.location.pathname); // Clear the URL
        displayPage(1);
    });

    document.getElementById('rows-per-page-button').addEventListener('click', () => {
        const value = parseInt(document.getElementById('rows-per-page-input').value, 10);
        if (value >= 5 && value <= 500) {
            rowsPerPage = value;
            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            displayPage(1);
        } else {
            displayWarning('rows-warning', 'Please enter a value between 5 and 500');
        }
    });

    // Initialize popup systems
    initAdvancedSearchPopup();
    initStatisticsPopup(allRows);
    console.log('Initialization complete');
});
