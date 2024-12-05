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

            const table = document.createElement('table');
            const headerRow = document.createElement('tr');

            // Define table headers
            const headers = ['Word', 'Meaning', 'Pronunciation', 'Part of Speech', 'Root', 'Explanation'];

            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Function to sanitize data
            function sanitizeHTML(str) {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            }

            // Function to display rows of the current page
            function displayPage(page) {
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                const tableBody = document.querySelector('tbody') || document.createElement('tbody');
                tableBody.innerHTML = ''; // Clear previous rows

                filteredRows.slice(start, end).forEach(row => {
                    const cols = row.split(',');
                    const tr = document.createElement('tr');
                    cols.forEach(col => {
                        const td = document.createElement('td');
                        td.innerHTML = sanitizeHTML(col);
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });

                if (!table.querySelector('tbody')) table.appendChild(tableBody);
            }

            // Function to create pagination controls
            function createPaginationControls() {
                const pagination = document.createElement('div');
                pagination.id = 'pagination';
                pagination.innerHTML = '';

                for (let i = 1; i <= Math.ceil(filteredRows.length / rowsPerPage); i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.addEventListener('click', () => {
                        currentPage = i;
                        displayPage(currentPage);
                    });
                    pagination.appendChild(button);
                }

                document.getElementById('dictionary').appendChild(pagination);
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
                    document.querySelector('table').style.display = searchTerm ? 'none' : '';
                    filterRows(searchTerm);
                }
            });

            document.getElementById('dictionary').appendChild(table);
            createPaginationControls();
            displayPage(currentPage);
        })
        .catch(error => console.error('Error loading CSV file:', error));
});
