/**
 * Creates pagination controls and updates the display of dictionary entries.
 *
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {Array} filteredRows - The filtered array of dictionary entries.
 * @param {number} currentPage - The current page number.
 * @param {Function} displayPage - Function to display the given page.
 */
export function createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage) {
    console.log(`Rows per page: ${rowsPerPage}`);
    console.log(`Filtered Rows: ${filteredRows.length}`);
    console.log(`Current Page: ${currentPage}`);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination controls

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const createPageButton = (label, onClick) => {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.classList.add('pagination-button');
        button.addEventListener('click', onClick);
        return button;
    };

    // Add go to beginning button
    const beginButton = createPageButton('⏮️', () => {
        if (currentPage > 1) {
            displayPage(1, rowsPerPage, '', {}, false, filteredRows, []);
        }
    });
    paginationContainer.appendChild(beginButton);

    // Add previous button
    const prevButton = createPageButton('⬅️', () => {
        if (currentPage > 1) {
            displayPage(currentPage - 1, rowsPerPage, '', {}, false, filteredRows, []);
        }
    });
    paginationContainer.appendChild(prevButton);

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
            displayPage(pageNumber, rowsPerPage, '', {}, false, filteredRows, []);
        } else {
            currentPageInput.value = currentPage;
        }
    });

    paginationContainer.appendChild(currentPageInput);

    // Add total pages display
    const totalPagesDisplay = document.createElement('span');
    totalPagesDisplay.textContent = ` / ${totalPages}`;
    totalPagesDisplay.classList.add('pagination-display');
    paginationContainer.appendChild(totalPagesDisplay);

    // Add next button
    const nextButton = createPageButton('➡️', () => {
        if (currentPage < totalPages) {
            displayPage(currentPage + 1, rowsPerPage, '', {}, false, filteredRows, []);
        }
    });
    paginationContainer.appendChild(nextButton);

    // Add go to last button
    const endButton = createPageButton('⏭️', () => {
        if (currentPage < totalPages) {
            displayPage(totalPages, rowsPerPage, '', {}, false, filteredRows, []);
        }
    });
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
    console.log(`Rows per page: ${rowsPerPage}`);
    console.log(`Filtered Rows: ${filteredRows.length}`);
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const paginationContainer = document.getElementById('pagination');
    const buttons = paginationContainer.querySelectorAll('.pagination-button');
    const currentPageInput = paginationContainer.querySelector('.pagination-input');
    const totalPagesDisplay = paginationContainer.querySelector('.pagination-display');

    buttons.forEach((button) => {
        button.classList.remove('active');
    });

    if (currentPageInput) {
        currentPageInput.value = currentPage;
        console.log('CurrentPageInput Check');
    } else {
        console.error('currentPageInput is undefined');
    }

    if (totalPagesDisplay) {
        totalPagesDisplay.textContent = ` / ${totalPages}`;
        console.log('TotalPagesDisplay Check');
    } else {
        console.error('totalPagesDisplay is undefined');
    }

    buttons.forEach((button) => {
        if (parseInt(button.innerHTML) === currentPage) {
            button.classList.add('active');
        }
    });
}
