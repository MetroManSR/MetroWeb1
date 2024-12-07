export async function setTexts(language) {
    const texts = await loadTexts(language);
    if (texts) {
        document.getElementById('search-input').placeholder = texts.searchPlaceholder || "Search...";
        document.getElementById('search-button').textContent = texts.searchButton || "Search";
        document.getElementById('clear-search-button').textContent = texts.clearSearchButton || "Clear Search";
        document.getElementById('rows-per-page-label').textContent = texts.rowsPerPageLabel || "Rows per page:";
        document.getElementById('rows-per-page-button').textContent = texts.rowsPerPageButton || "Submit";
        document.getElementById('advanced-search-button').textContent = texts.advancedSearchButton || "Advanced Search";
        document.getElementById('apply-search-button').textContent = texts.applySearchButton || "Apply";
        document.getElementById('close-popup-button').textContent = texts.closeSearchButton || "Close";
        document.getElementById('search-in-word-label').innerHTML = `<input type="checkbox" id="search-in-word" checked /> <span class="checkmark"></span> ${texts.searchInWord || "Word"}`;
        document.getElementById('search-in-root-label').innerHTML = `<input type="checkbox" id="search-in-root" checked /> <span class="checkmark"></span> ${texts.searchInRoot || "Root"}`;
        document.getElementById('search-in-definition-label').innerHTML = `<input type="checkbox" id="search-in-definition" checked /> <span class="checkmark"></span> ${texts.searchInDefinition || "Definition"}`;
        document.getElementById('search-in-etymology-label').innerHTML = `<input type="checkbox" id="search-in-etymology" checked /> <span class="checkmark"></span> ${texts.searchInEtymology || "Etymology"}`;
        document.getElementById('exact-match-label').innerHTML = `<input type="checkbox" id="exact-match" /> <span class="checkmark"></span> ${texts.exactMatch || "Exact Match"}`;
        document.getElementById('view-statistics-button').textContent = texts.viewStatisticsButton || "View Statistics";
        document.getElementById('filter-dropdown').innerHTML = `<label for="word-filter">${texts.filterByLabel || "Filter by:"}</label>`;
        document.getElementById('apply-filter-button').textContent = texts.applyFilterButton || "Apply";
        document.querySelector('option[value="noun"]').textContent = texts.noun || "Noun";
        document.querySelector('option[value="verb"]').textContent = texts.verb || "Verb";
        document.querySelector('option[value="adjective"]').textContent = texts.adjective || "Adjective";
        document.querySelector('option[value="adverb"]').textContent = texts.adverb || "Adverb";
        document.querySelector('option[value="conjunction"]').textContent = texts.conjunction || "Conjunction";
        document.querySelector('option[value="interjection"]').textContent = texts.interjection || "Interjection";
        document.querySelector('option[value="preposition"]').textContent = texts.preposition || "Preposition";
        document.querySelector('option[value="expression"]').textContent = texts.expression || "Expression";
        document.querySelector('option[value="pronoun"]').textContent = texts.pronoun || "Pronoun";
        document.getElementById('loading-message').textContent = texts.loadingMessage || "Loading dictionary, please wait...";
        document.getElementById('error-message').textContent = texts.errorLoadingData || "Failed to load dictionary data. Please try again later.";
    }
}

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
