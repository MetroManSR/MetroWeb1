import { fetchData } from './dictScripts/fetchData.js';
import { highlight } from './dictScripts/searchHighlight.js';
import { createPaginationControls, updatePagination } from './dictScripts/pagination.js';
import { displayWarning } from './dictScripts/warnings.js';
import { getRelatedWordsByRoot } from './dictScripts/utils.js';
import { createDictionaryBox } from './dictScripts/boxes.js';
import { cleanData, sanitizeHTML } from './dictScripts/csvUtils.js';
import { setTexts } from './dictScripts/loadTexts.js';

document.addEventListener('DOMContentLoaded', async function() {
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

    await setTexts(language);

    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    const rootsFile = location.pathname.includes('/en/') ? '../../assets/data/english-roots.csv' : '../../assets/data/balkeon-roots-es.csv';
    let allRows = [];
    let filteredRows = [];
    let allRowsById = {};

    try {
        const [dictionaryData, rootsData] = await Promise.all([fetchData(dictionaryFile, 'word'), fetchData(rootsFile, 'root')]);
        console.log('Fetched dictionary data:', dictionaryData);
        console.log('Fetched roots data:', rootsData);

        allRows = [...cleanData(dictionaryData, 'word'), ...cleanData(rootsData, 'root')];
        filteredRows = allRows.sort((a, b) => a.word.localeCompare(b.word));
        console.log('Processed rows:', allRows);

        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });
        console.log('allRowsById:', allRowsById);

        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('searchTerm');
        const wordID = params.get('wordID');
        const rootID = params.get('rootID');
        if ((searchTerm && searchTerm.trim()) || (wordID && parseInt(wordID) > 0) || (rootID && parseInt(rootID) > 0)) {
            filterAndDisplayWord(searchTerm ? searchTerm.trim() : '', wordID, rootID);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        displayError('Failed to load dictionary data. Please try again later.');
    }

    function displayPage(page, searchTerm = '', searchIn = { word: true, root: true, definition: false, etymology: false }, exactMatch = false) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dictionaryContainer = document.getElementById('dictionary');

        if (!dictionaryContainer) {
            console.error('Dictionary container not found');
            return;
        }

        dictionaryContainer.innerHTML = ''; // Clear previous entries

        const rowsToDisplay = filteredRows.slice(start, end);
        console.log('Rows to display:', rowsToDisplay);

        rowsToDisplay.forEach((row, index) => {
            const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
            if (box) {
                setTimeout(() => {
                    dictionaryContainer.appendChild(box);
                    console.log('Appended box:', box);
                }, index * 100); // Delay each box by 100ms for fade-in effect
            } else {
                console.error('Failed to create a valid object for:', row);
            }
        });

        updatePagination(currentPage, filteredRows, rowsPerPage);
    }

    function filterAndDisplayWord(searchTerm, wordID, rootID) {
        const searchIn = {
            word: document.getElementById('search-in-word').checked,
            root: document.getElementById('search-in-root').checked,
            definition: document.getElementById('search-in-definition').checked,
            etymology: document.getElementById('search-in-etymology').checked
        };

        const exactMatch = document.getElementById('exact-match').checked;
        const selectedFilters = Array.from(document.getElementById('word-filter').selectedOptions).map(option => option.value);

        // Ensure at least one checkbox is checked
        if (selectedFilters.length === 0) {
            alert('At least one filter must be selected.');
            return;
        }

        if ((!searchTerm.trim() && (!wordID || parseInt(wordID) <= 0) && (!rootID || parseInt(rootID) <= 0))) return;

        if (searchTerm && searchTerm.trim()) {
            filteredRows = allRows.filter(row => {
                const wordMatch = searchIn.word && row.type === 'word' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const rootMatch = searchIn.root && row.type === 'root' && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
                const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
                return selectedFilters.includes(row.type) || selectedFilters.includes(row.partOfSpeech.toLowerCase()) || wordMatch || rootMatch || definitionMatch || etymologyMatch;
            });

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

    // Popup window functionality
    document.getElementById('advanced-search-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.add('active');
        document.getElementById('popup-overlay').classList.add('active');
    });

    document.getElementById('close-popup-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    document.getElementById('apply-search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        filterAndDisplayWord(searchTerm, '', '');
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    document.getElementById('apply-filter-button').addEventListener('click', () => {
        filterAndDisplayWord(document.getElementById('search-input').value.trim(), '', '');
    });

    // Ensure all checkboxes are checked by default
    document.getElementById('search-in-word').checked = true;
    document.getElementById('search-in-root').checked = true;
    document.getElementById('search-in-definition').checked = true;
    document.getElementById('search-in-etymology').checked = true;
});
