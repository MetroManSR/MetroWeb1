document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 100; // Number of rows per page
    let currentPage = 1;
    const dictionaryFile = location.pathname.includes('/en/') ? '../../assets/data/english-dictionary.csv' : '../../assets/data/spanish-dictionary.csv';
    let allRows = [];
    let filteredRows = [];

    fetch(dictionaryFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            allRows = data.split('\n').slice(1); // Remove the header row
            filteredRows = allRows;
            const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

            // Function to sanitize data
            function sanitizeHTML(str) {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            }

            // Function to create a dictionary box
            function createDictionaryBox(word, meaning, pronunciation, partOfSpeech, root, explanation) {
                const box = document.createElement('div');
                box.className = 'dictionary-box';

                const title = document.createElement('div');
                title.className = 'title';
                title.textContent = word;

                const partOfSpeechElement = document.createElement('span');
                partOfSpeechElement.className = 'part-of-speech';
                partOfSpeechElement.textContent = `(${partOfSpeech})`;
                title.appendChild(partOfSpeechElement);

                const meaningElement = document.createElement('div');
                meaningElement.className = 'meaning';
                meaningElement.textContent = `Meaning: ${meaning}`;

                const pronunciationElement = document.createElement('div');
                pronunciationElement.className = 'pronunciation';
                pronunciationElement.textContent = `Pronunciation: ${pronunciation}`;

                const explanationElement = document.createElement('div');
                explanationElement.className = 'explanation';
                explanationElement.textContent = explanation ? `Explanation: ${explanation}` : '';

                const rootElement = document.createElement('div');
                rootElement.className = 'root';
                rootElement.textContent = `Root: ${root}`;

                box.appendChild(title);
                box.appendChild(meaningElement);
                box.appendChild(pronunciationElement);
                if (explanation) box.appendChild(explanationElement);
                box.appendChild(rootElement);

                return box;
            }

            // Function to display rows of the current page
            function displayPage(page) {
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                const dictionaryContainer = document.getElementById('dictionary');
                dictionaryContainer.innerHTML = ''; // Clear previous entries

                filteredRows.slice(start, end).forEach(row => {
                    const cols = row.split(',');
                    const box = createDictionaryBox(
                        sanitizeHTML(cols[0]),
                        sanitizeHTML(cols[1]),
                        sanitizeHTML(cols[2]),
                        sanitizeHTML(cols[3]),
                        sanitizeHTML(cols[4]),
                        sanitizeHTML(cols[5])
                    );
                    dictionaryContainer.appendChild(box);
                });
            }

            // Function to create pagination controls
            function createPaginationControls() {
                const pagination = document.getElementById('pagination');
                pagination.innerHTML = ''; // Clear previous controls

                for (let i = 1; i <= Math.ceil(filteredRows.length / rowsPerPage); i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.addEventListener('click', () => {
                        currentPage = i;
                        displayPage(currentPage);
                    });
                    pagination.appendChild(button);
                }
            }

            // Function to filter rows based on search term
            function filterRows(searchTerm) {
                if (searchTerm) {
                    filteredRows = allRows.filter(row => row.toLowerCase().includes(searchTerm.toLowerCase()));
                } else {
                    filteredRows = allRows;
                }
                createPaginationControls();
                displayPage(1);
            }

            // Add event listener to the search input
            document.getElementById('search-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const searchTerm = e.target.value;
                    filterRows(searchTerm);
                }
            });

            createPaginationControls();
            displayPage(currentPage);
        })
        .catch(error => console.error('Error loading CSV file:', error));
});
