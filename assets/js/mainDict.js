import { fetchData } from './dictScripts/fetchData.js';
import { highlight } from './dictScripts/searchHighlight.js';
import { createPaginationControls, updatePagination } from './dictScripts/pagination.js';
import { displayWarning } from './dictScripts/warnings.js';
import { getRelatedWordsByRoot } from './dictScripts/utils.js';
import { createDictionaryBox } from './dictScripts/boxes.js';

document.addEventListener('DOMContentLoaded', async function() {
    const defaultRowsPerPage = 20;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
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
        filteredRows = allRows;
        console.log('Processed rows:', allRows);

        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });
        console.log('allRowsById:', allRowsById);

        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search');
        const searchId = params.get('id');
        if ((searchTerm && searchTerm.trim()) || (searchId && parseInt(searchId) > 0)) {
            filterAndDisplayWord(searchTerm ? searchTerm.trim() : '', searchId);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }

    function cleanData(data, type) {
        return data.map((row, index) => {
            console.log(`Cleaning row ${index + 1}:`, row);

            if (type === 'root') {
                const raw = row.word || '';
                const [root, rest] = raw.split(' = ');
                const [translation, meta] = rest ? rest.split(' (') : ['', ''];
                const [notes, origin] = meta ? meta.slice(0, -1).split(', ') : ['', ''];

                const cleanedRow = {
                    id: row.id, // Assign unique ID from original data
                    word: sanitizeHTML(root ? root.trim() : ''),
                    definition: sanitizeHTML(translation ? translation.trim() : ''),
                    notes: sanitizeHTML(notes ? notes.trim() : ''),
                    etymology: sanitizeHTML(origin ? origin.trim() : ''),
                    type: 'root'
                };

                console.log('Cleaned root row:', cleanedRow);
                return cleanedRow;
            } else {
                const cleanedRow = {
                    ...row,
                    id: row.id, // Ensure ID is carried over
                    word: row.word.trim(),
                    partOfSpeech: row.partOfSpeech ? row.partOfSpeech.trim() : '',
                    definition: row.definition ? row.definition.trim() : '',
                    explanation: row.explanation ? row.explanation.trim() : '',
                    etymology: row.etymology ? row.etymology.trim() : '',
                    type: 'word'
                };

                console.log('Cleaned word row:', cleanedRow);
                return cleanedRow;
            }
        });
    }

    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function displayPage(page, searchTerm = '', searchIn = { word: true, definition: false, etymology: false }, exactMatch = false) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dictionaryContainer = document.getElementById('dictionary');
        dictionaryContainer.innerHTML = ''; // Clear previous entries

        const rowsToDisplay = filteredRows.slice(start, end);
        console.log('Rows to display:', rowsToDisplay);

        rowsToDisplay.forEach(row => {
            const box = createDictionaryBox(row, searchTerm, exactMatch, searchIn);
            if (box && box instanceof Node) {
                dictionaryContainer.appendChild(box);
                console.log('Appended box:', box);
            } else {
                console.error('Failed to create a valid object for:', row);
            }
        });

        updatePagination(page, filteredRows, rowsPerPage);
    }

    function filterAndDisplayWord(searchTerm, searchId) {
        const searchIn = {
            word: document.getElementById('search-in-word').checked,
            definition: document.getElementById('search-in-definition').checked,
            etymology: document.getElementById('search-in-etymology').checked
        };
        const exactMatch = document.getElementById('exact-match').checked;

        if ((!searchTerm.trim() && (!searchId || parseInt(searchId) <= 0))) return;

        if (searchTerm && searchTerm.trim()) {
            filteredRows = allRows.filter(row => {
                const wordMatch = searchIn.word && searchTerm && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const definitionMatch = searchIn.definition && searchTerm && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
                const etymologyMatch = searchIn.etymology && searchTerm && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
                return wordMatch || definitionMatch || etymologyMatch;
            });

            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            displayPage(1, searchTerm, searchIn, exactMatch);
        } else if (searchId && parseInt(searchId) > 0) {
            const row = allRowsById[parseInt(searchId)];
            if (row) {
                filteredRows = [row];
                createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
                displayPage(1, row.word, searchIn, exactMatch);
            }
        }
    }

    // Add event listener to the search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            filterAndDisplayWord(searchTerm, '');
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        filterAndDisplayWord(searchTerm, '');
    });

    // Add event listener to clear the search
    document.getElementById('clear-search-button').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
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
        filterAndDisplayWord(searchTerm, '');
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    // Ensure all checkboxes are checked by default
    document.getElementById('search-in-word').checked = true;
    document.getElementById('search-in-definition').checked = true;
    document.getElementById('search-in-etymology').checked = true;
});
