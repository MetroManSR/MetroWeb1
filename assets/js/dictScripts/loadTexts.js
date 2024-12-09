export async function setTexts(language) {
    const texts = await loadTexts(language);
    if (texts) {
        const elements = {
            'dict-search-input': 'placeholder',
            'dict-search-button': 'textContent',
            'dict-clear-search-button': 'textContent',
            'dict-rows-per-page-label': 'textContent',
            'dict-rows-per-page-button': 'textContent',
            'dict-advanced-search-button': 'textContent',
            'dict-apply-search-button': 'textContent',
            'dict-close-popup-button': 'textContent',
            'dict-search-in-word-label': 'innerHTML',
            'dict-search-in-root-label': 'innerHTML',
            'dict-search-in-definition-label': 'innerHTML',
            'dict-search-in-etymology-label': 'innerHTML',
            'dict-exact-match-label': 'innerHTML',
            'dict-view-statistics-button': 'textContent',
            'dict-filter-by-label': 'textContent',
            'dict-apply-filter-button': 'textContent',
            'dict-apply-settings-button': 'textContent',
            'dict-clear-settings-button': 'textContent',
            'dict-order-by-label': 'textContent',
            'id-asc': 'textContent',
            'id-desc': 'textContent',
            'definition-asc': 'textContent',
            'definition-desc': 'textContent',
            'word-asc': 'textContent',
            'word-desc': 'textContent',
            'dict-loading-message-text': 'textContent',
            'dict-error-message': 'textContent'
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
