import { universalPendingChanges} from "./initFormEventListeners.js";

export async function fetchJson(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    return response.json();
}

export async function setTexts(language) {
    const pendingChanges = universalPendingChanges;

    try {
        const response = await fetch('/assets/data/defaultTexts.json');
        const texts = await response.json();

        const currentTexts = texts[language] || texts['en'];

        document.getElementById('dict-search-input').placeholder = currentTexts.searchPlaceholder;
        document.getElementById('dict-clear-search-button').textContent = currentTexts.clearSearchButton;
        document.getElementById('dict-rows-per-page-label').textContent = currentTexts.rowsPerPageLabel;
        document.getElementById('dict-toggle-filter-button').textContent = currentTexts.toggleFiltersButton;
        document.getElementById('dict-apply-settings-button').textContent = currentTexts.applySettingsButton;
        document.getElementById('dict-clear-settings-button').textContent = currentTexts.clearSettingsButton;
        document.getElementById('dict-advanced-search-button').textContent = currentTexts.advancedSearchButton;
        document.getElementById('dict-view-statistics-button').textContent = currentTexts.viewStatisticsButton;
        document.getElementById('dict-close-popup-button').textContent = currentTexts.closeSearchButton;
        document.getElementById('dict-filter-by-label').textContent = currentTexts.filterByLabel;
        document.getElementById('dict-order-by-label').textContent = currentTexts.orderByLabel;

        // Update the order by options text
        const orderBySelect = document.getElementById('dict-order-by-select');
        if (orderBySelect) {
            orderBySelect.options[0].textContent = currentTexts.titleAsc;
            orderBySelect.options[1].textContent = currentTexts.titleDesc;
            orderBySelect.options[2].textContent = currentTexts.metaAsc;
            orderBySelect.options[3].textContent = currentTexts.metaDesc;
            orderBySelect.options[4].textContent = currentTexts.morphAsc;
            orderBySelect.options[5].textContent = currentTexts.morphDesc;
        }

        // Update the filter dropdown options text
        const filterSelect = document.getElementById('dict-word-filter');
        if (filterSelect) {
            filterSelect.options[0].textContent = currentTexts.searchInWord;
            filterSelect.options[1].textContent = currentTexts.searchInRoot;
            filterSelect.options[2].textContent = currentTexts.noun;
            filterSelect.options[3].textContent = currentTexts.verb;
            filterSelect.options[4].textContent = currentTexts.adjective;
            filterSelect.options[5].textContent = currentTexts.adverb;
            filterSelect.options[6].textContent = currentTexts.conjunction;
            filterSelect.options[7].textContent = currentTexts.interjection;
            filterSelect.options[8].textContent = currentTexts.preposition;
            filterSelect.options[9].textContent = currentTexts.expression;
            filterSelect.options[10].textContent = currentTexts.pronoun;
        }

        // Update texts for new filters
        document.getElementById('dict-ignore-diacritics-label').textContent = currentTexts.ignoreDiacritics;
        document.getElementById('dict-starts-with-label').textContent = currentTexts.startsWith;
        document.getElementById('dict-ends-with-label').textContent = currentTexts.endsWith;

        // Apply other labels as required
        document.getElementById('dict-loading-message-text').textContent = currentTexts.loadingMessage;
        document.getElementById('dict-error-message').textContent = currentTexts.errorLoadingData;

        // Pending Changes Section
        document.getElementById('dict-pending-changes').innerHTML = `
            <p>${currentTexts.pendingChanges}</p>
            <p>${currentTexts.noPendingChanges}</p>
            <ul>
                <li><strong>${currentTexts.searchTerm}:</strong> ${pendingChanges.searchTerm}</li>
                <li><strong>${currentTexts.exactMatch}:</strong> ${pendingChanges.exactMatch}</li>
                <li><strong>${currentTexts.filters}:</strong> ${pendingChanges.filters.join(', ')}</li>
                <li><strong>${currentTexts.ignoreDiacritics}:</strong> ${pendingChanges.ignoreDiacritics}</li>
                <li><strong>${currentTexts.startsWith}:</strong> ${pendingChanges.startsWith}</li>
                <li><strong>${currentTexts.endsWith}:</strong> ${pendingChanges.endsWith}</li>
                <li><strong>${currentTexts.sortOrder}:</strong> ${pendingChanges.sortOrder}</li>
                <li><strong>${currentTexts.rowsPerPage}:</strong> ${pendingChanges.rowsPerPage}</li>
            </ul>
        `;
    } catch (error) {
        console.error('Error loading texts:', error);
    }
}

export async function getTranslatedText(key, language, filePath = '/main/assets/data/defaultTexts.json') {
    try {
        const response = await fetch(filePath);
        const texts = await response.json();
        const defaultTexts = texts[language] || texts['en'];
        return defaultTexts[key];
    } catch (error) {
        console.error('Error fetching translated text:', error);
        return key; // Return the key as fallback
    }
}
