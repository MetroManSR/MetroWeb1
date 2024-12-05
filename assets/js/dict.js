document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 100; // Number of rows per page
    let currentPage = 1;
    const dictionaryFile = location.pathname.includes('/en/') ? '/_docs/english-dictionary.csv' : '/_docs/spanish-dictionary.csv';

    fetch(dictionaryFile)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').slice(1); // Remove the header row
            const totalPages = Math.ceil(rows.length / rowsPerPage);

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

            // Function to display rows of the current page
            function displayPage(page) {
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                const tableBody = document.querySelector('tbody') || document.createElement('tbody');
                tableBody.innerHTML = ''; // Clear previous rows

                rows.slice(start, end).forEach(row => {
                    const cols = row.split(',');
                    const tr = document.createElement('tr');
                    cols.forEach(col => {
                        const td = document.createElement('td');
                        td.textContent = col;
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

                for (let i = 1; i <= totalPages; i++) {
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

            document.getElementById('dictionary').appendChild(table);
            createPaginationControls();
            displayPage(currentPage);
        })
        .catch(error => console.error('Error loading CSV file:', error));
});
