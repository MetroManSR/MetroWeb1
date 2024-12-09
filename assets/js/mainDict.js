import { fetchData } from './dictScripts/fetchData.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';
import { initializeEventListeners } from './dictScripts/init.js';
import { createPaginationControls } from './dictScripts/pagination.js';
import { processRows, advancedSearch, sortRows } from './dictScripts/processRows.js';
import { displayPage, wordSpecific, rootSpecific, displaySpecificEntry } from './dictScripts/dictSearch.js';
import { cleanData } from './dictScripts/csvUtils.js'; // Importing cleanData function

function showLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

function hideLoadingMessage() {
    const loadingMessage = document.getElementById('dict-loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

function toggleFilterOptions() {
    const advancedFilterOptions = document.getElementById('advanced-filter-options');
    if (advancedFilterOptions) {
        advancedFilterOptions.classList.toggle('hidden');
    }
}

showLoadingMessage();

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded event triggered');

    hideLoadingMessage();

    const defaultRowsPerPage = 20;
    let rowsPerPage = defaultRowsPerPage;
    let currentPage = 1;
    let allRows = [];
    let allRowsById = {};
    let currentSortOrder = 'titleup'; // Default sort order

    let pendingChanges = {
        searchTerm: '',
        exactMatch: false,
        searchIn: { word: true, root: true, definition: false, etymology: false },
        filters: [],
        rowsPerPage: 20,
        sortOrder: 'titleup'
    };

    function displayError(message) {
        const errorContainer = document.getElementById('dict-error-message');
        errorContainer.innerHTML = `<p>${message}</p>`;
        errorContainer.style.display = 'block';
    }

    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified
    console.log('Language set to:', language);

    await setTexts(language);

    // Define URLs based on language
    const esDictURL = 'https://docs.google.com/spreadsheets/d/1ZzYEerR-BTsk5QaOefiWhS3mhQe9YQnY/export?format=xlsx';
    const enDictURL = 'https://docs.google.com/spreadsheets/d/1jkaWrRlTx7BPxs6B4qgz7NzUcyQLhZ7Iit0MXYFD9W4/export?format=xlsx';
    const esRootURL = 'https://docs.google.com/spreadsheets/d/1BAaWVCp5QZCxg9Xfm_EvDdlUPeZjE6j005ovmwSEh70/export?format=xlsx';
    const enRootURL = 'https://docs.google.com/spreadsheets/d/1jkaWrRlTx7BPxs6B4qgz7NzUcyQLhZ7Iit0MXYFD9W4/export?format=xlsx';

    const dictionaryFile = language === 'es' ? esDictURL : enDictURL;
    const rootsFile = language === 'es' ? esRootURL : enRootURL;

    async function fetchWithFallback(url, type) {
        try {
            return await fetchData(url, type);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return [];
        }
    }

    try {
        console.log('Fetching data...');
        const [dictionaryData, rootsData] = await Promise.all([
            fetchWithFallback(dictionaryFile, 'word'), 
            fetchWithFallback(rootsFile, 'root')
        ]);

        // Log fetched data for debugging
        console.log('Fetched Dictionary Data:', dictionaryData);
        console.log('Fetched Roots Data:', rootsData);

        // Clean fetched data
        const cleanedDictionaryData = cleanData(dictionaryData, 'word');
        const cleanedRootsData = cleanData(rootsData, 'root');

        // Creating a string list from cleaned data
        const stringList = [
            ...cleanedDictionaryData.map(item => item.title || ''),
            ...cleanedRootsData.map(item => item.title || '')
        ].filter(Boolean); // Filtering out empty strings

        console.log('String List:', stringList);

        const sortedDictionaryData = cleanedDictionaryData.sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
        });

        const sortedRootsData = cleanedRootsData.sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
        });

        sortedDictionaryData.forEach((item, index) => { item.id = index + 1; });
        sortedRootsData.forEach((item, index) => { item.id = index + 1; });

        allRows = [...sortedDictionaryData, ...sortedRootsData];
        let filteredRows = sortRows(allRows, currentSortOrder); // Sorting rows initially

        filteredRows.forEach(row => {
            allRowsById[row.id] = row;
        });

        console.log('Creating pagination controls...');
        createPaginationControls(rowsPerPage, filteredRows, currentPage, displayPage);
        displayPage(currentPage, rowsPerPage, '', { word: true, root: true, definition: false, etymology: false }, false, filteredRows, allRows);

        // Handle URL parameters
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        const wordSpecificTerm = params.get('wordSpecific');
        const rootSpecificTerm = params.get('rootSpecific');

        if (searchTerm && searchTerm.trim()) {
            const criteria = { searchTerm: searchTerm.trim() };
            processRows(allRows, criteria, rowsPerPage, displayPage, currentPage, currentSortOrder);
        } else if (wordID && parseInt(wordID) > 0) {
            const wordEntry = allRows.find(row => row.id === parseInt(wordID) && row.type === 'word');
            displaySpecificEntry(wordEntry, allRows);
        } else if (rootID && parseInt(rootID) > 0) {
            const rootEntry = allRows.find(row => row.id === parseInt(rootID) && row.type === 'root');
            displaySpecificEntry(rootEntry, allRows);
        } else if (wordSpecificTerm && wordSpecificTerm.trim()) {
            wordSpecific(wordSpecificTerm, allRows);
        } else if (rootSpecificTerm && rootSpecificTerm.trim()) {
            rootSpecific(rootSpecificTerm, allRows);
        }

        // Initialize advanced search form
        const advancedSearchForm = document.getElementById('advanced-search-form');
        if (advancedSearchForm) {
            advancedSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(advancedSearchForm);
                const params = {
                    searchTerm: formData.get('search-term'),
                    word: formData.get('search-in-word') === 'on',
                    root: formData.get('search-in-root') === 'on',
                    definition: formData.get('search-in-definition') === 'on',
                    etymology: formData.get('search-in-etymology') === 'on',
                    exactMatch: formData.get('exact-match') === 'on'
                };
                advancedSearch(params, allRows, rowsPerPage, displayPage, pendingChanges.sortOrder);
            });
        }

        // Toggle filter options
        const filterToggleButton = document.getElementById('filter-toggle-button');
        if (filterToggleButton) {
            filterToggleButton.addEventListener('click', toggleFilterOptions);
        }

        // Sorting functionality
        const orderBySelect = document.getElementById('dict-order-by-select');
        if (orderBySelect) {
            orderBySelect.addEventListener('change', () => {
                pendingChanges.sortOrder = orderBySelect.value;
                console.log('Selected order:', pendingChanges.sortOrder);
                updatePendingChangesList();
            });
        }

        // Hide the loading message after JS is ready
        document.getElementById('dict-loading-message').style.display = 'none';
    } catch (error) {
        console.error('Error loading data:', error);
        displayError('Failed to load dictionary data. Please try again later.');
        // Hide the loading message in case of an error
        document.getElementById('dict-loading-message').style.display = 'none';
    }

    // Initialize event listeners with apply settings handling
    initializeEventListeners(allRows, allRowsById, rowsPerPage, currentSortOrder, pendingChanges, processRows, displayPage);

    // Initialize popup systems
    initAdvancedSearchPopup(allRows, rowsPerPage, displayPage);
    initStatisticsPopup(allRows);
    console.log('Initialization complete');
});
