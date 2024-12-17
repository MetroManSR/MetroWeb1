import { processAllSettings } from './processRows.js';
import { universalPendingChanges, updateUniversalPendingChanges, defaultPendingChanges, updatePendingChangesList } from './initFormEventListeners.js';
import { filteredRows } from '../mainDict.js';
import { getTranslatedText } from './loadTexts.js';

const advancedSearchPopup = document.getElementById('dict-advanced-search-popup');
const advancedSearchOverlay = document.getElementById('popup-overlay');
const closeAdvancedSearch = document.getElementById('dict-close-advanced-search');
const addSearchBtnPopup = document.getElementById('dict-add-search-btn-popup');

export async function initAdvancedSearchPopup(allRows, rowsPerPage, currentLanguage) {
    // Load previous selections if any

    const pendingChanges = universalPendingChanges ? universalPendingChanges : { ...defaultPendingChanges };

    await advancedSearchPopup.classList.remove('hidden');
    await advancedSearchOverlay.classList.add('active');
    await closeAdvancedSearch.classList.remove('hidden');
    await closeAdvancedSearch.classList.add('active');

    const advancedSearchTitle = await getTranslatedText('advancedSearchTitle', currentLanguage);
    const addSearchText = await getTranslatedText('addSearch', currentLanguage);
    const closeText = await getTranslatedText('close', currentLanguage);
    const searchInWordText = await getTranslatedText('searchInWord', currentLanguage);
    const searchInRootText = await getTranslatedText('searchInRoot', currentLanguage);
    const searchInDefinitionText = await getTranslatedText('searchInDefinition', currentLanguage);
    const searchInEtymologyText = await getTranslatedText('searchInEtymology', currentLanguage);
    const exactMatchText = await getTranslatedText('exactMatch', currentLanguage);
    const ignoreDiacriticsText = await getTranslatedText('ignoreDiacritics', currentLanguage);
    const startsWithText = await getTranslatedText('startsWith', currentLanguage);
    const endsWithText = await getTranslatedText('endsWith', currentLanguage);

    document.querySelector('.dict-popup-content h3').textContent = advancedSearchTitle;
    document.querySelector('#dict-add-search-btn-popup').textContent = addSearchText;
    closeAdvancedSearch.textContent = closeText;
    document.querySelector('label[for="dict-search-in-word"]').textContent = searchInWordText;
    document.querySelector('label[for="dict-search-in-root"]').textContent = searchInRootText;
    document.querySelector('label[for="dict-search-in-definition"]').textContent = searchInDefinitionText;
    document.querySelector('label[for="dict-search-in-etymology"]').textContent = searchInEtymologyText;
    document.querySelector('label[for="dict-exact-match"]').textContent = exactMatchText;
    document.querySelector('label[for="dict-ignore-diacritics"]').textContent = ignoreDiacriticsText;
    document.querySelector('label[for="dict-starts-with"]').textContent = startsWithText;
    document.querySelector('label[for="dict-ends-with"]').textContent = endsWithText;

    document.getElementById('dict-search-input').value = pendingChanges.searchTerm || '';
    document.getElementById('dict-search-in-word').checked = pendingChanges.searchIn.word;
    document.getElementById('dict-search-in-root').checked = pendingChanges.searchIn.root;
    document.getElementById('dict-search-in-definition').checked = pendingChanges.searchIn.definition;
    document.getElementById('dict-search-in-etymology').checked = pendingChanges.searchIn.etymology;
    document.getElementById('dict-exact-match').checked = pendingChanges.exactMatch;
    document.getElementById('dict-ignore-diacritics').checked = pendingChanges.ignoreDiacritics;
    document.getElementById('dict-starts-with').checked = pendingChanges.startsWith;
    document.getElementById('dict-ends-with').checked = pendingChanges.endsWith;

    const wordFilterSelect = document.getElementById('dict-word-filter');
    Array.from(wordFilterSelect.options).forEach(option => {
        option.selected = pendingChanges.filters.includes(option.value);
    });

    closeAdvancedSearch.addEventListener('click', async () => {
        await advancedSearchPopup.classList.add('hidden');
        await advancedSearchOverlay.classList.remove('active');
        await closeAdvancedSearch.classList.add('hidden');
        await closeAdvancedSearch.classList.remove('active');
    });

    addSearchBtnPopup.addEventListener('click', async () => {
        const searchTerm = document.getElementById('dict-search-input').value.trim();
        const searchIn = {
            word: document.getElementById('dict-search-in-word')?.checked || false,
            root: document.getElementById('dict-search-in-root')?.checked || false,
            definition: document.getElementById('dict-search-in-definition')?.checked || false,
            etymology: document.getElementById('dict-search-in-etymology')?.checked || false
        };

        const exactMatch = document.getElementById('dict-exact-match')?.checked || false;
        const ignoreDiacritics = document.getElementById('dict-ignore-diacritics')?.checked || false;
        const startsWith = document.getElementById('dict-starts-with')?.checked || false;
        const endsWith = document.getElementById('dict-ends-with')?.checked || false;

        const selectedFilters = Array.from(document.getElementById('dict-word-filter').selectedOptions).map(option => option.value);

        pendingChanges.searchTerm = searchTerm;
        pendingChanges.exactMatch = exactMatch;
        pendingChanges.searchIn = searchIn;
        pendingChanges.filters = selectedFilters;
        pendingChanges.ignoreDiacritics = ignoreDiacritics;
        pendingChanges.startsWith = startsWith;
        pendingChanges.endsWith = endsWith;

        updatePendingChangesList(pendingChanges);
        await updatePendingChangesList(currentLanguage);
    });
}

export async function initStatisticsPopup(allRows) {
    const statisticsPopup = document.getElementById('dict-statistics-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    const infoClose = document.getElementById('dict-close-statistics-button');
    const currentLanguage = document.querySelector('meta[name="language"]').content || 'en';

    if (statisticsPopup.classList.contains('active')) {
        return;
    }

    const totalWords = allRows.filter(row => row.type === 'word').length;
    const totalRoots = allRows.filter(row => row.type === 'root').length;

    const partOfSpeechCounts = allRows.reduce((counts, row) => {
        if (row.type === 'word' && row.partofspeech) {
            counts[row.partofspeech] = (counts[row.partofspeech] || 0) + 1;
        }
        return counts;
    }, {});

    const statisticsTitle = await getTranslatedText('statisticsTitle', currentLanguage);
    const totalWordsText = await getTranslatedText('totalWords', currentLanguage);
    const totalRootsText = await getTranslatedText('totalRoots', currentLanguage);
    const partOfSpeechTitle = await getTranslatedText('partOfSpeechTitle', currentLanguage);
    const closeText = await getTranslatedText('close', currentLanguage);

    statisticsPopup.innerHTML = `
        <h3>${statisticsTitle}</h3>
        <p>${totalWordsText}: ${totalWords}</p>
        <p>${totalRootsText}: ${totalRoots}</p>
        <h4>${partOfSpeechTitle}</h4>
        <ul>
            ${await Promise.all(Object.entries(partOfSpeechCounts).map(async ([pos, count]) => {
                const translatedPos = await getTranslatedText(pos, currentLanguage);
                return `<li>${translatedPos}: ${count}</li>`;
            })).then(items => items.join(''))}
        </ul>
        <button id="dict-close-statistics-button" class="btn">${closeText}</button>
    `;

    await statisticsPopup.classList.add('active');
    await statisticsPopup.classList.remove('hidden');
    await popupOverlay.classList.add('active');
    await popupOverlay.classList.remove('hidden');
    await infoClose.classList.add('active');
    await infoClose.classList.remove('hidden');

    infoClose.addEventListener('click', async () => {
        await statisticsPopup.classList.remove('active');
        await statisticsPopup.classList.add('hidden');
        await popupOverlay.classList.remove('active');
        await popupOverlay.classList.add('hidden');
        await infoClose.classList.remove('active');
        await infoClose.classList.add('hidden');
    });
        }
