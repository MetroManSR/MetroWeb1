import { fetchData } from './dictScripts/fetchData.js';
import { highlight } from './dictScripts/searchHighlight.js';
import { createPaginationControls, updatePagination } from './dictScripts/pagination.js';
import { displayWarning } from './dictScripts/warnings.js';
import { calculateSimilarity, displayRelatedWords } from './dictScripts/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const defaultRowsPerPage = 100;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    let allRows = [];
    let filteredRows = [];
    let allRowsById = {};

    fetchData(dictionaryFile).then(data => {
        allRows = data;
        filteredRows = allRows;
        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });
        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage);

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search');
        const searchId = params.get('id');
        if (searchTerm && searchTerm.trim() && searchId && parseInt(searchId) > 0) {
            filterAndDisplayWord(searchTerm.trim(), searchId);
        }
    });

    // Function to create a dictionary box
    function createDictionaryBox({ word, partOfSpeech, definition, explanation, etymology }, searchTerm, exactMatch, searchIn) {
        const box = document.createElement('div');
        box.className = 'dictionary-box';

        const title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = searchIn.word && (exactMatch ? word === searchTerm : word.toLowerCase().includes(searchTerm.toLowerCase())) ? highlight(word, searchTerm) : word;

        const partOfSpeechElement = document.createElement('span');
        partOfSpeechElement.className = 'part-of-speech';
        partOfSpeechElement.textContent = `(${partOfSpeech})`;

        const meaningElement = document.createElement('div');
        meaningElement.className = 'meaning';
        meaningElement.innerHTML = searchIn.definition && (exactMatch ? definition === searchTerm : definition.toLowerCase().includes(searchTerm.toLowerCase())) ? highlight(`Definition: ${definition}`, searchTerm) : `Definition: ${definition}`;

        const explanationElement = document.createElement('div');
        explanationElement.className = 'explanation';
        explanationElement.innerHTML = explanation ? (searchIn.definition && (exactMatch ? explanation === searchTerm : explanation.toLowerCase().includes(searchTerm.toLowerCase())) ? highlight(`Explanation: ${explanation}`, searchTerm) : `Explanation: ${explanation}`) : '';

        const rootElement = document.createElement('div');
        rootElement.className = 'root';
        const highlightedEtymology = searchIn.etymology && (exactMatch ? etymology === searchTerm : etymology.toLowerCase().includes(searchTerm.toLowerCase())) ? highlight(etymology, searchTerm) : etymology;
        const etymologyRoots = etymology.split(',').map(root => root.trim());
        const etymologyLinks = etymologyRoots.map(root => {
            const etymologyRow = allRows.find(row => row.word.toLowerCase() === root.toLowerCase());
            return etymologyRow ? `<a href="?search=${root}&id=${etymologyRow.id}">${highlight(root, searchTerm)}</a>` : root;
        }).join(', ');
        rootElement.innerHTML = `Etymology: ${etymologyLinks}`;

        box.appendChild(title);
        box.appendChild(partOfSpeechElement);
        box.appendChild(meaningElement);
        if (explanation) box.appendChild(explanationElement);
        box.appendChild(rootElement);

        // Add related words section
        const relatedWords = displayRelatedWords(word, allRows);
        if (relatedWords) {
            const relatedWordsElement = document.createElement('div');
            relatedWordsElement.className = 'related-words';
            relatedWordsElement.innerHTML = `Related Words: ${relatedWords}`;
            box.appendChild(relatedWordsElement);
        }

        return box;
    }

    // Function to display rows of the current page
    function displayPage(page, searchTerm = '', searchIn = { word: true, definition: false, etymology: false }, exactMatch = false) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dictionaryContainer = document.getElementById('dictionary');
        dictionaryContainer.innerHTML = ''; // Clear previous entries

        filteredRows.slice(start, end).forEach(row => {
            const box = createDictionaryBox(row, searchTerm, exactMatch, searchIn);
            dictionaryContainer.appendChild(box);
        });

        updatePagination(page, filteredRows, rowsPerPage);
    }

    // Function to filter rows based on search term with options
    function filterAndDisplayWord(searchTerm, searchId) {
        const searchIn = {
            word: document.getElementById('search-in-word').checked,
            definition: document.getElementById('search-in-definition').checked,
            etymology: document.getElementById('search-in-etymology').checked
        };
        const exactMatch = document.getElementById('exact-match').checked;

        if (!searchTerm.trim() && (!searchId || parseInt(searchId) <= 0)) return;

        if (searchTerm && searchTerm.trim()) {
            filteredRows = allRows.filter(row => {
                const wordMatch = searchIn.word && (exactMatch ? row.word === searchTerm : row.word.toLowerCase().includes(searchTerm.toLowerCase()));
                const definitionMatch = searchIn.definition && (exactMatch ? row.definition === searchTerm : row.definition.toLowerCase().includes(searchTerm.toLowerCase()));
                const etymologyMatch = searchIn.etymology && (exactMatch ? row.etymology === searchTerm : row.etymology.toLowerCase().includes(searchTerm.toLowerCase()));
                return wordMatch || definitionMatch || etymologyMatch;
            });

            createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
            displayPage(1, searchTerm, searchIn, exactMatch);

            if (filteredRows.length === 1) {
                displayRelatedWords(filteredRows[0].word, allRows);
            }
        } else if (searchId && parseInt(searchId) > 0) {
            const row = allRowsById[parseInt(searchId)];
            if (row) {
                filteredRows = [row];
                createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
                displayPage(1, row.word, searchIn, exactMatch);

                displayRelatedWords(row.word, allRows);
            }
        }
    }

    // Add event listener to the search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            filterAndDisplayWord(searchTerm);
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        filterAndDisplayWord(searchTerm);
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
        filterAndDisplayWord(searchTerm);
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    // Ensure all checkboxes are checked by default
    document.getElementById('search-in-word').checked = true;
    document.getElementById('search-in-definition').checked = true;
    document.getElementById('search-in-etymology').checked = true;
});
