import { fetchData } from './dictScripts/fetchData.js';
import { setTexts } from './dictScripts/loadTexts.js';
import { initAdvancedSearchPopup, initStatisticsPopup } from './dictScripts/popups.js';
import { initializeEventListeners, updatePendingChangesList } from './dictScripts/init.js';
import { createPaginationControls } from './dictScripts/pagination.js';
import { processAllSettings, sortRows, displayPage, wordSpecific, rootSpecific, displaySpecificEntry } from './dictScripts/processRows.js';
import { cleanData } from './dictScripts/csvUtils.js';
import { getRelatedWordsByRoot } from './dictScripts/utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    const language = document.querySelector('meta[name="language"]').content || 'en';
    await setTexts(language);

    const filterSortingContainer = document.getElementById('dict-filter-sorting-container');
    let pendingChanges = document.getElementById('dict-pending-changes');

    // Initially hide elements
    if (filterSortingContainer) {
        filterSortingContainer.classList.add('dict-filter-cont-hidden');
    }

    if (pendingChanges) {
        pendingChanges.style.display = 'none';
    }

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

    showLoadingMessage();

    let allRows = []; // Ensure allRows is defined outside the try-catch block
    let rowsPerPage = 20; // Default rows per page
    let currentPage = 1;
    let currentSortOrder = 'titleup'; // Default sort order
    pendingChanges = {
        searchTerm: '',
        exactMatch: false,
        searchIn: { word: true, root: true, definition: false, etymology: false },
        filters: [],
        rowsPerPage: 20,
        sortOrder: 'titleup'
    };

    try {
        console.log('DOMContentLoaded event triggered');

        hideLoadingMessage();

        function displayError(message) {
            const errorContainer = document.getElementById('dict-error-message');
            errorContainer.innerHTML = `<p>${message}</p>`;
            errorContainer.style.display = 'block';
        }

        // Define URLs based on language
        const esDictURL = 'https://docs.google.com/spreadsheets/d/1ZzYEerR-BTsk5QaOefiWhS3mhQe9YQnY/export?format=xlsx';
        const enDictURL = 'https://docs.google.com/spreadsheets/d/1jkaWrRlTx7BPxs6B4qgz7NzUcyQLhZ7Iit0MXYFD9W4/export?format=xlsx';
        const esRootURL = 'https://docs.google.com/spreadsheets/d/13LHqyyBGxXGEd5XCi0HxwpdkWToXi_H0/export?format=xlsx';
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

        console.log('Fetching data...');
        const [dictionaryData, rootsData] = await Promise.all([
            fetchWithFallback(dictionaryFile, 'word'), 
            fetchWithFallback(rootsFile, 'root')
        ]);

        console.log('Dictionary Data:', dictionaryData);
        console.log('Roots Data:', rootsData);

        // Clean data and wait for completion before proceeding
        const cleanedDictionaryData = (await cleanData(dictionaryData, 'word')).sort((a, b) => a.title.localeCompare(b.title));
        const cleanedRootsData = (await cleanData(rootsData, 'root')).sort((a, b) => a.title.localeCompare(b.title));

        cleanedDictionaryData.forEach((item, index) => { item.id = index + 1; });
        cleanedRootsData.forEach((item, index) => { item.id = index + 1; });

        console.log('Cleaned Dictionary Data:', cleanedDictionaryData);
        console.log('Cleaned Roots Data:', cleanedRootsData);

        allRows = [...cleanedDictionaryData, ...cleanedRootsData];
        let filteredRows = getRelatedWordsByRoot(sortRows(allRows, currentSortOrder)); // Sorting rows initially

        console.log('All Rows:', allRows);
        console.log('Filtered Rows:', filteredRows);

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
            const criteria = { searchTerm: searchTerm.trim(), searchIn: { word: true, root: true, definition: false, etymology: false } };
            processAllSettings(criteria, allRows, rowsPerPage, displayPage, currentPage, currentSortOrder);
        } else if (wordID && parseInt(wordID) > 0) {
            const wordEntry = allRows.find(row => row.id === parseInt(wordID) && row.type === 'word');
            console.log('Word Entry:', wordEntry);
            displaySpecificEntry(wordEntry, allRows);
        } else if (rootID && parseInt(rootID) > 0) {
            const rootEntry = allRows.find(row => row.id === parseInt(rootID) && row.type === 'root');
            console.log('Root Entry:', rootEntry);
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
                    etymology: formData.get('search-in-etymology') === 'off',
                    exactMatch: formData.get('exact-match') === 'off'
                };
                processAllSettings(params, allRows, rowsPerPage, displayPage, currentPage, pendingChanges.sortOrder);
            });
        }

        // Sorting functionality
        const orderBySelect = document.getElementById('dict-order-by-select');
        if (orderBySelect) {
            orderBySelect.addEventListener('change', () => {
                pendingChanges.sortOrder = orderBySelect.value;
                console.log('Selected order:', pendingChanges.sortOrder);
                updatePendingChangesList(pendingChanges, language);
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
    initializeEventListeners(allRows, rowsPerPage, currentSortOrder, pendingChanges, displayPage);
});
