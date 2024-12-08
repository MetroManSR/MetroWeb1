/**
 * Creates pagination controls and updates the display of dictionary entries.
 *
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {Array} filteredRows - The filtered array of dictionary entries.
 * @param {number} currentPage - The current page number.
 * @param {Function} displayPage - Function to display the given page.
 */
export function createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage) {
    console.log(`Rows per page: ${rowsPerPage} `);
    console.log(`Filtered Rows: ${filteredRows} `);
    console.log(`Current Page: ${currentPage} `);
    console.log(`Display page: ${displayPage} `);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination controls

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const createPageButton = (pageNumber, label) => {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.classList.add('pagination-button');
        if (pageNumber === currentPage) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            displayPage(pageNumber, rowsPerPage);
        });

        return button;
    };

    // Add go to beginning button
    const beginButton = createPageButton(1, '&laquo;');
    paginationContainer.appendChild(beginButton);

    // Add previous button
    if (currentPage > 1) {
        const prevButton = createPageButton(currentPage - 1, '&lsaquo;');
        paginationContainer.appendChild(prevButton);
    }

    // Add current page input
    const currentPageInput = document.createElement('input');
    currentPageInput.type = 'number';
    currentPageInput.value = currentPage;
    currentPageInput.min = 1;
    currentPageInput.max = totalPages;
    currentPageInput.classList.add('pagination-input');

    currentPageInput.addEventListener('change', () => {
        let pageNumber = parseInt(currentPageInput.value, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            displayPage(pageNumber, rowsPerPage);
        } else {
            currentPageInput.value = currentPage;
        }
    });

    const currentPageDisplay = document.createElement('span');
    currentPageDisplay.textContent = ` / ${totalPages}`;
    currentPageDisplay.classList.add('pagination-display');

    paginationContainer.appendChild(currentPageInput);
    paginationContainer.appendChild(currentPageDisplay);

    // Add next button
    if (currentPage < totalPages) {
        const nextButton = createPageButton(currentPage + 1, '&rsaquo;');
        paginationContainer.appendChild(nextButton);
    }

    // Add go to last button
    const endButton = createPageButton(totalPages, '&raquo;');
    paginationContainer.appendChild(endButton);
}

/**
 * Updates the pagination display based on the current page and total rows.
 *
 * @param {number} currentPage - The current page number.
 * @param {Array} filteredRows - The filtered array of dictionary entries.
 * @param {number} rowsPerPage - The number of rows to display per page.
 */
export function updatePagination(currentPage, filteredRows, rowsPerPage) {
    console.log(`Rows per page: ${rowsPerPage} `);
    console.log(`Filtered Rows: ${filteredRows} `);
    console.log(`Rows per Page: ${rowsPerPage} `);
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const paginationContainer = document.getElementById('pagination');
    const buttons = paginationContainer.querySelectorAll('.pagination-button');
    const currentPageInput = paginationContainer.querySelector('.pagination-input');
    const currentPageDisplay = paginationContainer.querySelector('.pagination-display');

    buttons.forEach((button) => {
        button.classList.remove('active');
    });

    if (currentPageInput) {
        currentPageInput.value = currentPage;
        console.log('CurrentPageInput Check')
    } else {
        console.error('currentPageInput is undefined');
    }

    if (currentPageDisplay) {
        currentPageDisplay.textContent = ` / ${totalPages}`;
        console.log('CurrentPageDisplay Check')
    } else {
        console.error('currentPageDisplay is undefined');
    }

    buttons.forEach((button, index) => {
        if (index + 1 === currentPage) {
            button.classList.add('active');
        }
    });
}
