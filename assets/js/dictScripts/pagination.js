import { displayWarning } from './warnings.js';

export function createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage) {
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
    pageInput.value = currentPage;
    pageInput.addEventListener('change', () => {
        const value = parseInt(pageInput.value, 10);
        if (value >= 1 && value <= Math.ceil(filteredRows.length / rowsPerPage)) {
            currentPage = value;
            displayPage(currentPage);
        } else {
            displayWarning('page-warning', 'Invalid page number');
        }
    });
    pagination.appendChild(pageInput);

    const pageWarning = document.createElement('div');
    pageWarning.id = 'page-warning';
    pageWarning.style.color = 'red';
    pagination.appendChild(pageWarning);

    updatePagination(currentPage, filteredRows, rowsPerPage);
}

export function updatePagination(page, filteredRows, rowsPerPage) {
    const pageInfo = document.getElementById('page-info');
    pageInfo.textContent = `Page ${page} / ${Math.ceil(filteredRows.length / rowsPerPage)}`;

    const pageInput = document.querySelector('#pagination input[type="number"]');
    pageInput.value = page;
}
