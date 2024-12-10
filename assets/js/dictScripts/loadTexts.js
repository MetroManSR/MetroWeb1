// Fetch the JSON file asynchronously and store it
async function fetchDefaultTexts() {
    try {
        const response = await fetch('../../../data/defaultTexts.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading texts:', error);
        return null;
    }
}

// Store the fetched texts in a variable
let cachedTexts = null;

// Initialize texts based on the selected language
export async function setTexts(language) {
    if (!cachedTexts) {
        cachedTexts = await fetchDefaultTexts();
    }
    
    if (!cachedTexts) return; // Return if texts couldn't be loaded
    
    const currentTexts = cachedTexts[language] || cachedTexts['en'];
    
    document.getElementById('dict-search-input').placeholder = currentTexts.searchPlaceholder;
    document.getElementById('dict-search-button').textContent = currentTexts.searchButton;
    document.getElementById('dict-clear-search-button').textContent = currentTexts.clearSearchButton;
    document.getElementById('dict-rows-per-page-label').textContent = currentTexts.rowsPerPageLabel;
    document.getElementById('dict-toggle-filter-button').textContent = currentTexts.toggleFiltersButton;
    document.getElementById('dict-apply-settings-button').textContent = currentTexts.applySettingsButton;
    document.getElementById('dict-clear-settings-button').textContent = currentTexts.clearSettingsButton;
    document.getElementById('dict-advanced-search-button').textContent = currentTexts.advancedSearchButton;
    document.getElementById('dict-view-statistics-button').textContent = currentTexts.viewStatisticsButton;
    document.getElementById('dict-close-popup-button').textContent = currentTexts.closeSearchButton;
    document.getElementById('dict-filter-by-label').textContent = currentTexts.filterByLabel;
    document.getElementById('dict-apply-filter-button').textContent = currentTexts.applyFilterButton;
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

    // Apply other labels as required
    document.getElementById('dict-loading-message-text').textContent = currentTexts.loadingMessage;
    document.getElementById('dict-error-message').textContent = currentTexts.errorLoadingData;
}

// Function to get translated text for specific keys
export function getTranslatedText(key, language) {
    if (!cachedTexts) return key; // Return the key as fallback
    const texts = cachedTexts;
    return texts[language] && texts[language][key] ? texts[language][key] : texts['en'][key];
}
