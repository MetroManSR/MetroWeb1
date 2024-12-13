export async function setTexts(language) {
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

        // Apply other labels as required
        document.getElementById('dict-loading-message-text').textContent = currentTexts.loadingMessage;
        document.getElementById('dict-error-message').textContent = currentTexts.errorLoadingData;

        // Pending Changes Section
        document.getElementById('dict-pending-changes').innerHTML = `
            <p>${currentTexts.pendingChanges}</p>
            <p>${currentTexts.noPendingChanges}</p>
            <ul>
                <li><strong>${currentTexts.searchTerm}:</strong> ${currentTexts.searchInWord}</li>
                <li><strong>${currentTexts.exactMatch}:</strong> ${currentTexts.exactMatch}</li>
                <li><strong>${currentTexts.filters}:</strong> ${currentTexts.filters}</li>
                <li><strong>${currentTexts.sortOrder}:</strong> ${currentTexts.sortOrder}</li>
                <li><strong>${currentTexts.rowsPerPage}:</strong> ${currentTexts.rowsPerPage}</li>
            </ul>
        `;
    } catch (error) {
        console.error('Error loading texts:', error);
    }
}

export async function getTranslatedText(key, language) {
    try {
        const response = await fetch('/assets/data/defaultTexts.json');
        const texts = await response.json();
        const defaultTexts = texts[language] || texts['en'];
        return defaultTexts[key];
    } catch (error) {
        console.error('Error fetching translated text:', error);
        return key; // Return the key as fallback
    }
}
