document.addEventListener('DOMContentLoaded', () => {
    const defaultRowsPerPage = 100;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    let allRows = [];
    let filteredRows = [];
    let allRowsById = {};

    fetch(dictionaryFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            allRows = parseCSV(data);
            filteredRows = allRows;
            createPaginationControls();
            displayPage(currentPage);

            const params = new URLSearchParams(window.location.search);
            const searchTerm = params.get('search');
            if (searchTerm) {
                filterAndDisplayWord(searchTerm);
            }
        })
        .catch(error => console.error('Error loading CSV file:', error));

    // Function to parse CSV data
    function parseCSV(data) {
        const rows = [];
        const lines = data.split('\n').slice(1); // Remove the header row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const columns = [];
            let col = '', inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                let char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    columns.push(col.trim());
                    col = '';
                } else {
                    col += char;
                }
            }
            columns.push(col.trim()); // Push the last column

            const row = {
                id: i + 1, // Assign a unique ID starting from 1
                word: sanitizeHTML(columns[0]),
                partOfSpeech: sanitizeHTML(columns[1]),
                definition: sanitizeHTML(columns[2]),
                explanation: sanitizeHTML(columns[3]),
                etymology: sanitizeHTML(columns[4])
            };
            rows.push(row);
            allRowsById[row.id] = row; // Store by ID
        }
        return rows;
    }

    // Function to sanitize data
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Function to highlight matched text
    function highlight(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

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
        rootElement.innerHTML = searchTerm ? highlight(`Etymology: ${etymology}`, searchTerm) : `Etymology: ${etymology}`;

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

        updatePagination(page);
    }

    // Function to display a word by its ID
    function displayWordById(id) {
        const dictionaryContainer = document.getElementById('dictionary');
        dictionaryContainer.innerHTML = ''; // Clear previous entries
        const box = createDictionaryBox(allRowsById[id]);
        dictionaryContainer.appendChild(box);
    }

    // Function to filter rows based on search term
    function filterAndDisplayWord(searchTerm) {
        filteredRows = allRows.filter(row => row.word.toLowerCase().includes(searchTerm.toLowerCase()));
        createPaginationControls();
        displayPage(1, searchTerm);
    }

    // Function to create pagination controls
    function createPaginationControls() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ''; // Clear previous controls

        const firstPageButton = document.createElement('button');
        firstPageButton.innerHTML = '⏪';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            displayPage(currentPage);
        });
        pagination.appendChild(firstPageButton);

        const prevPageButton = document.createElement('button');
        prevPageButton.innerHTML = '⬅️';
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });
        pagination.appendChild(prevPageButton);

        const pageInfo = document.createElement('span');
        pageInfo.id = 'page-info';
        pagination.appendChild(pageInfo);

        const nextPageButton = document.createElement('button');
        nextPageButton.innerHTML = '➡️';
        nextPageButton.addEventListener('click', () => {
            if (currentPage < Math.ceil(filteredRows.length / rowsPerPage)) {
                currentPage++;
                displayPage(currentPage);
            }
        });
        pagination.appendChild(nextPageButton);

        const lastPageButton = document.createElement('button');
        lastPageButton.innerHTML = '⏩';
        lastPageButton.addEventListener('click', () => {
            currentPage = Math.ceil(filteredRows.length / rowsPerPage);
            displayPage(currentPage);
        });
        pagination.appendChild(lastPageButton);

        const pageInput = document.createElement('input');
        pageInput.type = 'number';
        pageInput.min = 1;
        pageInput.max = Math.ceil(filteredRows.length / rowsPerPage);
        pageInput.addEventListener('change', () => {
            const value = parseInt(pageInput.value, 10);
            if (value >= 1 && value <= Math.ceil(filteredRows.length / rowsPerPage)) {
                currentPage = value;
                displayPage(currentPage);
            }
        });
        pagination.appendChild(pageInput);

        updatePagination(currentPage);
    }

    // Function to update pagination info
    function updatePagination(page) {
        const pageInfo = document.getElementById('page-info');
        pageInfo.textContent = `Page ${page} / ${Math.ceil(filteredRows.length / rowsPerPage)}`;
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
        rowsPerPage = Math.min(Math.max(value, 5), 500);
        createPaginationControls();
        displayPage(1);
    });
});
