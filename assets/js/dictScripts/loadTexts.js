import defaultTexts from '../../data/defaultTexts.json';

export function setTexts(language) {
    const texts = defaultTexts[language] || defaultTexts['en'];
    
    // Apply texts to various parts of the interface
    document.getElementById('dict-search-input').placeholder = texts.searchPlaceholder;
    document.getElementById('dict-search-button').textContent = texts.searchButton;
    document.getElementById('dict-clear-search-button').textContent = texts.clearSearchButton;
    document.getElementById('dict-rows-per-page-label').textContent = texts.rowsPerPageLabel;
    document.getElementById('dict-toggle-filter-button').textContent = texts.toggleFiltersButton;
    document.getElementById('dict-apply-settings-button').textContent = texts.applySettingsButton;
    document.getElementById('dict-clear-settings-button').textContent = texts.clearSettingsButton;
    document.getElementById('dict-advanced-search-button').textContent = texts.advancedSearchButton;
    document.getElementById('dict-view-statistics-button').textContent = texts.viewStatisticsButton;
    document.getElementById('dict-close-popup-button').textContent = texts.closeSearchButton;
    document.getElementById('dict-filter-by-label').textContent = texts.filterByLabel;
    document.getElementById('dict-apply-filter-button').textContent = texts.applyFilterButton;
    document.getElementById('dict-order-by-label').textContent = texts.orderByLabel;
    
    // Update the order by options text
    const orderBySelect = document.getElementById('dict-order-by-select');
    if (orderBySelect) {
        orderBySelect.options[0].textContent = texts.titleAsc;
        orderBySelect.options[1].textContent = texts.titleDesc;
        orderBySelect.options[2].textContent = texts.metaAsc;
        orderBySelect.options[3].textContent = texts.metaDesc;
        orderBySelect.options[4].textContent = texts.morphAsc;
        orderBySelect.options[5].textContent = texts.morphDesc;
    }

    // Apply other labels as required
    document.getElementById('dict-loading-message-text').textContent = texts.loadingMessage;
    document.getElementById('dict-error-message').textContent = texts.errorLoadingData;
}
