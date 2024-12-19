import { filteredRows } from '../mainDict.js';
import { renderBox } from "./boxes.js";
import { universalPendingChanges } from "./initFormEventListeners.js";

let totalPages = 0;

/**
 * Creates pagination controls and updates the display of dictionary entries.
 *
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @param {number} currentPage - The current page number.
 */
export function createPaginationControls(rowsPerPage, currentPage) {

    if (universalPendingChanges) {
        rowsPerPage = universalPendingChanges.rowsPerPage;
    }

    const paginationContainer = document.getElementById('dict-pagination');
    if (!paginationContainer) {
        console.error('Pagination container not found');
        return;
    }
    paginationContainer.innerHTML = ''; // Clear existing pagination controls

    totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const createPageButton = (label, onClick, disabled) => {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.classList.add('pagination-button');
        button.disabled = disabled;
        button.addEventListener('click', () => onClick());
        return button;
    };

    // Add go to beginning button
    const beginButton = createPageButton('⏮️', () => {
        if (currentPage > 1) {
            currentPage = 1;
            renderBox(filteredRows, '', false, {}, rowsPerPage, currentPage);
        }
    }, currentPage === 1);
    paginationContainer.appendChild(beginButton);

    // Add previous button
    const prevButton = createPageButton('⬅️', () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderBox(filteredRows, '', false, {}, rowsPerPage, currentPage);
        }
    }, currentPage === 1);
    paginationContainer.appendChild(prevButton);

    // Add current page input and total pages display
    const currentPageInput = document.createElement('input');
    currentPageInput.type = 'number';
    currentPageInput.value = currentPage;
    currentPageInput.min = 1;
    currentPageInput.max = totalPages;
    currentPageInput.classList.add('pagination-input');
    currentPageInput.disabled = totalPages <= 1; // Disable input if only one page

    currentPageInput.addEventListener('change', () => {
        let pageNumber = parseInt(currentPageInput.value, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            renderBox(filteredRows, '', false, {}, rowsPerPage, currentPage);
        } else {
            currentPageInput.value = currentPage;
        }
    });

    const totalPagesDisplay = document.createElement('span');
    totalPagesDisplay.textContent = ` / ${totalPages}`;
    totalPagesDisplay.classList.add('pagination-display');

    const pageContainer = document.createElement('div');
    pageContainer.classList.add('pagination-page-display');
    pageContainer.appendChild(currentPageInput);
    pageContainer.appendChild(totalPagesDisplay);

    paginationContainer.appendChild(pageContainer);

    // Add next button
    const nextButton = createPageButton('➡️', () => {
        if (currentPage < totalPages) {
            currentPage += 1;
            renderBox(filteredRows, '', false, {}, rowsPerPage, currentPage);
        }
    }, currentPage === totalPages);
    paginationContainer.appendChild(nextButton);

    // Add go to last button
    const endButton = createPageButton('⏭️', () => {
        if (currentPage < totalPages) {
            currentPage = totalPages;
            renderBox(filteredRows, '', false, {}, rowsPerPage, currentPage);
        }
    }, currentPage === totalPages);
    paginationContainer.appendChild(endButton);

    // Disable all buttons if there is only one page
    if (totalPages <= 1) {
        const allButtons = paginationContainer.querySelectorAll('button');
        allButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }
}

/**
 * Updates the pagination display based on the current page and total rows.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} rowsPerPage - The number of rows to display per page.
 */
export function updatePagination(currentPage, rowsPerPage) {

    if (universalPendingChanges) {
        rowsPerPage = universalPendingChanges.rowsPerPage;
    }

    totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const paginationContainer = document.getElementById('dict-pagination'); // Correct reference
    const buttons = paginationContainer.querySelectorAll('.pagination-button');
    const currentPageInput = paginationContainer.querySelector('.pagination-input');
    const totalPagesDisplay = paginationContainer.querySelector('.pagination-display');

    buttons.forEach((button) => {
        button.classList.remove('active');
        button.disabled = false; // Enable all buttons first
    });

    if (currentPageInput) {
        currentPageInput.value = currentPage;
        currentPageInput.disabled = totalPages <= 1; // Disable input if only one page
    } else {
        console.error('currentPageInput is undefined');
    }

    if (totalPagesDisplay) {
        totalPagesDisplay.textContent = ` / ${totalPages}`;
    } else {
        console.error('totalPagesDisplay is undefined');
    }

    buttons.forEach((button) => {
        if (parseInt(button.innerHTML) === currentPage) {
            button.classList.add('active');
        }
    });

    // Deactivate navigation buttons based on the current page
    if (currentPage === 1) {
        paginationContainer.querySelector('.pagination-button:nth-child(1)').disabled = true; // Go to beginning
        paginationContainer.querySelector('.pagination-button:nth-child(2)').disabled = true; // Go back
    }
    if (currentPage === totalPages) {
        paginationContainer.querySelector('.pagination-button:nth-child(4)').disabled = true; // Go forward
        paginationContainer.querySelector('.pagination-button:nth-child(5)').disabled = true; // Go to last
    }

    // Disable all buttons if there is only one page
    if (totalPages <= 1) {
        const allButtons = paginationContainer.querySelectorAll('button');
        allButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }
}
