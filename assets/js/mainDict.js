import { fetchData } from './dictScripts/fetchData.js';
import { highlight } from './dictScripts/searchHighlight.js';
import { createPaginationControls, updatePagination } from './dictScripts/pagination.js';
import { displayWarning } from './dictScripts/warnings.js';

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
        if (searchTerm) {
            filterAndDisplayWord(searchTerm);
        }
    });

    // Function to create a dictionary box
    function createDictionaryBox({ word, partOfSpeech, definition, explanation, etymology }, searchTerm) {
        const box = document.createElement('div');
        box.className = 'dictionary-box';

        const title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = searchTerm ? highlight(word, searchTerm) : word;

        const partOfSpeechElement = document.createElement('span');
        partOfSpeechElement.className = 'part-of-speech';
        partOfSpeechElement.textContent = `(${partOfSpeech})`;

        const meaningElement = document.createElement('div');
        meaningElement.className = 'meaning';
        meaningElement.innerHTML = searchTerm ? highlight(`Definition: ${definition}`, searchTerm) : `Definition: ${definition}`;

        const explanationElement = document.createElement('div');
        explanationElement.className = 'explanation';
        explanationElement.innerHTML = explanation ? (searchTerm ? highlight(`Explanation: ${explanation}`, searchTerm) : `Explanation: ${explanation}`) : '';

        const rootElement = document.createElement('div');
        rootElement.className = 'root';
        rootElement.innerHTML = etymology && allRowsById[etymology.toLowerCase()] ? `<a href="?search=${etymology}">Etymology: ${etymology}</a>` : `Etymology: ${etymology}`;

        box.appendChild(title);
        box.appendChild(partOfSpeechElement);
        box.appendChild(meaningElement);
        if (explanation) box.appendChild(explanationElement);
        box.appendChild(rootElement);

        return box;
    }

    // Function to display rows of the current page
    function displayPage(page, searchTerm = '') {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dictionaryContainer = document.getElementById('dictionary');
        dictionaryContainer.innerHTML = ''; // Clear previous entries

        filteredRows.slice(start, end).forEach(row => {
            const box = createDictionaryBox(row, searchTerm);
            dictionaryContainer.appendChild(box);
        });

        updatePagination(page, filteredRows, rowsPerPage);
    }

    // Function to filter rows based on search term
    function filterAndDisplayWord(searchTerm) {
        filteredRows = allRows.filter(row => row.word.toLowerCase().includes(searchTerm.toLowerCase()));
        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(1, searchTerm);
    }

    // Add event listener to the search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value;
            filterAndDisplayWord(searchTerm);
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value;
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
});
