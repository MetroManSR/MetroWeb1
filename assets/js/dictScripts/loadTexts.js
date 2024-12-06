async function loadTexts(language) {
    try {
        const response = await fetch('../../assets/data/defaultTexts.json');
        const data = await response.json();
        return data[language];
    } catch (error) {
        console.error('Error loading texts:', error);
        return null;
    }
}

export async function setTexts(language) {
    const texts = await loadTexts(language);
    if (texts) {
        document.getElementById('search-input').placeholder = texts.searchPlaceholder;
        document.getElementById('search-button').textContent = texts.searchButton;
        document.getElementById('clear-search-button').textContent = texts.clearSearchButton;
        document.getElementById('rows-per-page-label').textContent = texts.rowsPerPageLabel;
        document.getElementById('rows-per-page-button').textContent = texts.rowsPerPageButton;
        document.getElementById('advanced-search-button').textContent = texts.advancedSearchButton;
        document.getElementById('apply-search-button').textContent = texts.applySearchButton;
        document.getElementById('close-popup-button').textContent = texts.closeSearchButton;
        document.getElementById('search-in-word-label').textContent = texts.searchInWord;
        document.getElementById('search-in-root-label').textContent = texts.searchInRoot;
        document.getElementById('search-in-definition-label').textContent = texts.searchInDefinition;
        document.getElementById('search-in-etymology-label').textContent = texts.searchInEtymology;
        document.getElementById('exact-match-label').textContent = texts.exactMatch;
    }
}
