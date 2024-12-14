import { getRelatedWordsByRoot, highlight, createHyperlink } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { copyToClipboard, getSimilarity, levenshteinDistance } from './utils.js';
import { loadInfoBox } from './boxEvents.js';
import { filteredRows } from '../mainDict.js';

let previouslySelectedBox = null;

// Function to get part of speech abbreviation based on language
function getPartOfSpeechAbbreviation(partOfSpeech, language) {
    const posAbbreviations = {
        en: {
            noun: 'n.',
            verb: 'v.',
            adjective: 'adj.',
            adverb: 'adv.',
            pronoun: 'pron.',
            preposition: 'prep.',
            conjunction: 'conj.',
            interjection: 'int.'
        },
        es: {
            noun: 's.',
            verb: 'v.',
            adjective: 'adj.',
            adverb: 'adv.',
            pronoun: 'pron.',
            preposition: 'prep.',
            conjunction: 'conj.',
            interjection: 'int.'
        }
    };

    return posAbbreviations[language][partOfSpeech.toLowerCase()] || partOfSpeech;
}

// Function to create a dictionary box
export async function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
    if (!row || !row.title) {
        console.error('Invalid row data:', row);
        return null;
    }

    const box = document.createElement('div');
    box.classList.add('dictionary-box');
    box.id = `${row.type}-${row.id}`;

    if (row.type === 'root') {
        box.classList.add('root-word'); // Apply root word styling
    }

    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified
    const partOfSpeechAbbr = getPartOfSpeechAbbreviation(row.partofspeech || '', language);

    const wordElement = document.createElement('div');
    wordElement.classList.add('dictionary-box-title');
    wordElement.innerHTML = highlight(row.title + (row.type !== 'root' ? ` (${partOfSpeechAbbr})` : ''), searchTerm, searchIn, row);

    const hrElement = document.createElement('hr');

    const metaElement = document.createElement('div');
    metaElement.classList.add('dictionary-box-meta');
    metaElement.innerHTML = highlight(row.meta, searchTerm, searchIn, row);

    const contentBox = document.createElement('div');
    contentBox.classList.add('dictionary-box-content');

    const notesElement = document.createElement('div');
    notesElement.classList.add('dictionary-box-notes');
    
    const morphElement = document.createElement('div');
    morphElement.classList.add('dictionary-box-morph');
    
    // Display morphology for words and etymology for roots
    if (row.type === 'root') {
        metaElement.innerHTML = `<strong>${await getTranslatedText('translation', language)}:</strong> ${highlight(row.meta, searchTerm, searchIn, row)}`;
        notesElement.innerHTML = `<strong>${await getTranslatedText('notes', language)}:</strong> ${highlight(row.notes || '', searchTerm, searchIn, row)}`;
        morphElement.innerHTML = `<strong>${await getTranslatedText('etymology', language)}:</strong> ${highlight(row.morph.join(', ') || '', searchTerm, searchIn, row)}`;        
        contentBox.appendChild(metaElement);
        contentBox.appendChild(notesElement);
        contentBox.appendChild(morphElement);
 
    } else {
        metaElement.innerHTML = `<strong>${await getTranslatedText('translation', language)}:</strong> ${highlight(row.meta, searchTerm, searchIn, row)}`;
        notesElement.innerHTML = `<strong>${await getTranslatedText('notes', language)}:</strong> ${highlight(row.notes || '', searchTerm, searchIn, row)}`;
        contentBox.appendChild(metaElement);
        contentBox.appendChild(notesElement);

        if (Array.isArray(row.morph) && row.morph.length > 0) {
            morphElement.innerHTML = `<strong>${await getTranslatedText('morphology', language)}:</strong> `;
            row.morph.forEach((morphTitle, index) => {
                const matchingRoot = allRows.find(r => r.meta.toLowerCase() === morphTitle.toLowerCase() && r.type === 'root');
                morphElement.innerHTML += matchingRoot 
                    ? createHyperlink(morphTitle, searchTerm, allRows, searchIn) 
                    : highlight(morphTitle, searchTerm, searchIn, row);
                if (index < row.morph.length - 1) {
                    morphElement.innerHTML += ', ';
                }
            });
            contentBox.appendChild(morphElement);
        }
    }

    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? await getTranslatedText('root', language) : await getTranslatedText('word', language);
    typeTag.style.position = 'absolute';
    typeTag.style.top = '10px';
    typeTag.style.right = '10px';

    box.style.position = 'relative';  // Ensure the box is relatively positioned

    box.appendChild(typeTag);
    box.appendChild(wordElement);
    box.appendChild(contentBox);

    // Add ID display in bottom right
    const idElement = document.createElement('div');
    idElement.className = 'id-display';
    idElement.textContent = `${await getTranslatedText('id', language)}: ${row.id}`;
    idElement.style.position = 'absolute';
    idElement.style.bottom = '10px';
    idElement.style.right = '10px';

    box.appendChild(idElement);

    // Ensure text does not overlap with type tag or ID box
    wordElement.style.paddingRight = '50px'; // Adjust padding to avoid type tag
    morphElement.style.paddingBottom = '30px'; // Adjust padding to avoid ID box

    await loadInfoBox(box, row);
    
    // Add fade-in effect
    setTimeout(() => {
        box.classList.add('fade-in');
    }, 100);

    return box;
}

// Function to create a no match box with suggestions
export async function createNoMatchBox(language, searchTerm, allRows) {
    const noMatchBox = document.createElement('div');
    noMatchBox.className = 'dictionary-box no-match';

    const noMatchText = document.createElement('div');
    noMatchText.textContent = await getTranslatedText('noMatch', language);
    noMatchBox.appendChild(noMatchText);

    // Calculate similarities and get the top 75% matching titles
    const suggestions = allRows
        .map(row => ({
            title: row.title,
            meta: row.meta,
            similarity: getSimilarity(row.title, searchTerm)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, Math.ceil(allRows.length * 0.75))
        .map(row => `${row.title} (${row.meta})`);

    if (suggestions.length > 0) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';

        const suggestionsTitle = document.createElement('div');
        suggestionsTitle.textContent = await getTranslatedText('maybeYouMeant', language);
        suggestionsContainer.appendChild(suggestionsTitle);

        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion';
            suggestionElement.textContent = suggestion;
            suggestionElement.addEventListener('click', () => {
                const searchInput = document.getElementById('dict-search-input');
                if (searchInput) {
                    searchInput.value = suggestion.split(' (')[0]; // Set the title only
                    searchInput.dispatchEvent(new Event('input')); // Trigger the input event to update predictions
                }
            });
            suggestionsContainer.appendChild(suggestionElement);
        });

        noMatchBox.appendChild(suggestionsContainer);
    }

    return noMatchBox;
}

// Function to create a loading box
export function createLoadingBox() {
    const loadingBox = document.createElement('div');
    loadingBox.className = 'dictionary-box loading';
    loadingBox.textContent = "Loading..."; // Add some loading text or a spinner
    return loadingBox;
}

// Function to update the floating text
export async function updateFloatingText(searchTerm, filters, advancedSearchParams, language) {
    let floatingTextContent = `${filteredRows.length} ${await getTranslatedText('wordsFound', language)}`;

    if (searchTerm) {
        floatingTextContent += ` ${await getTranslatedText('whenLookingFor', language)} "${searchTerm}"`;
    }
    if (filters.length > 0) {
        floatingTextContent += ` ${await getTranslatedText('withFilters', language)}: ${filters.join(", ")}`;
    }
    if (advancedSearchParams) {
        floatingTextContent += ` ${await getTranslatedText('withAdvancedSearch', language)}: ${Object.keys(advancedSearchParams).join(", ")}`;
    }

    const floatingText = document.getElementById('floating-text');
    if (floatingText) {
        floatingText.textContent = floatingTextContent;
    } else {
        const newFloatingText = document.createElement('div');
        newFloatingText.id = 'floating-text';
        newFloatingText.className = 'floating-text';
        newFloatingText.textContent = floatingTextContent;
        document.body.appendChild(newFloatingText);
    }
}

export async function renderBox(allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage) {
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.innerHTML = ''; // Clear previous entries

    const language = document.querySelector('meta[name="language"]').content || 'en';

    // Render loading boxes
    for (let i = 0; i < rowsPerPage; i++) {
        dictionaryContainer.appendChild(createLoadingBox());
    }

    if (filteredRows.length === 0) {
        dictionaryContainer.innerHTML = ''; // Clear loading boxes
        dictionaryContainer.appendChild(await createNoMatchBox(language));
        updatePagination(currentPage, filteredRows, rowsPerPage);
        await updateFloatingText(filteredRows, searchTerm, [], {}, language);
        return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rowsToDisplay = filteredRows.slice(start, end);

    // Replace loading boxes with actual content
    dictionaryContainer.innerHTML = ''; // Clear loading boxes
    for (const row of rowsToDisplay) {
        const box = await createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        if (box) {
            dictionaryContainer.appendChild(box);
        }
    }

    updatePagination(currentPage, rowsPerPage);
    await updateFloatingText(searchTerm, [], {}, language);
}
