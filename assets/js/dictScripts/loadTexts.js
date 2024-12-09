export async function setTexts(language) {
    const texts = await loadTexts(language);
    if (texts) {
        const elements = {
            'search-input': 'placeholder',
            'search-button': 'textContent',
            'clear-search-button': 'textContent',
            'rows-per-page-label': 'textContent',
            'rows-per-page-button': 'textContent',
            'advanced-search-button': 'textContent',
            'apply-search-button': 'textContent',
            'close-popup-button': 'textContent',
            'search-in-word-label': 'innerHTML',
            'search-in-root-label': 'innerHTML',
            'search-in-definition-label': 'innerHTML',
            'search-in-etymology-label': 'innerHTML',
            'exact-match-label': 'innerHTML',
            'view-statistics-button': 'textContent',
            'filter-by-label': 'textContent',
            'apply-filter-button': 'textContent',
            'apply-settings-button': 'textContent',
            'clear-settings-button': 'textContent',
            'order-by-label': 'textContent',
            'id-asc': 'textContent',
            'id-desc': 'textContent',
            'definition-asc': 'textContent',
            'definition-desc': 'textContent',
            'word-asc': 'textContent',
            'word-desc': 'textContent',
            'loading-message-text': 'textContent',
            'error-message': 'textContent'
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            const prop = elements[id];
            if (element && texts[id.split('-').slice(-1)[0]]) {
                if (prop === 'innerHTML') {
                    const htmlContent = id.includes('label') ? `<input type="checkbox" id="${id.split('-')[2]}" checked /> <span class="checkmark"></span> ${texts[id.split('-').slice(-1)[0]]}` : texts[id];
                    element.innerHTML = htmlContent;
                } else {
                    element[prop] = texts[id.split('-').slice(-1)[0]] || element[prop];
                }
            }
        });

        const options = ['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'interjection', 'preposition', 'expression', 'pronoun'];
        options.forEach(option => {
            const element = document.querySelector(`option[value="${option}"]`);
            if (element && texts[option]) {
                element.textContent = texts[option];
            }
        });
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
