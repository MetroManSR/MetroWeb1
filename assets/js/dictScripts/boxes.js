import { getRelatedWordsByRoot, highlight } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';

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
    box.id = `entry-${row.id}`;

    if (row.type === 'root') {
        box.classList.add('root-word'); // Apply root word styling
    }

    const language = document.querySelector('meta[name="language"]').content || 'en'; // Default to 'en' if not specified
    const partOfSpeechAbbr = getPartOfSpeechAbbreviation(row.partofspeech || '', language);

    const wordElement = document.createElement('div');
    wordElement.classList.add('dictionary-box-title');
    wordElement.innerHTML = highlight(row.title + (row.type !== 'root' ? ` (${partOfSpeechAbbr})` : ''), searchTerm);

    const contentBox = document.createElement('div');
    contentBox.classList.add('dictionary-box-content');

    const metaElement = document.createElement('div');
    metaElement.classList.add('dictionary-box-meta');
    metaElement.innerHTML = `<strong>${await getTranslatedText('translation', language)}:</strong> ${highlight(row.meta || '', searchTerm)}`;

    const notesElement = document.createElement('div');
    notesElement.classList.add('dictionary-box-notes');
    notesElement.innerHTML = `<strong>${await getTranslatedText('notes', language)}:</strong> ${row.type === 'root' ? highlight(row.morph || '', searchTerm) : highlight(row.notes || '', searchTerm)}`;

    const morphElement = document.createElement('div');
    morphElement.classList.add('dictionary-box-morph');

    // Check if morph exists and is a string
    if (typeof row.morph === 'string' && row.morph.length > 0) {
        const morphList = row.morph.split(',').map(morph => morph.trim());
        morphElement.innerHTML = `<strong>${await getTranslatedText('morphology', language)}:</strong> `;
        morphList.forEach((morph, index) => {
            const matchingRoot = allRows.find(r => r.title.toLowerCase() === morph.toLowerCase() && r.type === 'root');
            morphElement.innerHTML += matchingRoot 
                ? `<a href="?rootid=${matchingRoot.id}" style="color: green;">${highlight(morph, searchTerm)}</a>` 
                : highlight(morph, searchTerm);
            if (index < morphList.length - 1) {
                morphElement.innerHTML += ', ';
            }
        });
    }

    const relatedElement = document.createElement('div');
    relatedElement.classList.add('dictionary-box-related');
    if (row.related.length > 0) {
        relatedElement.innerHTML = `<strong>${await getTranslatedText('relatedWords', language)}:</strong> `;
        row.related.forEach((relatedWord, index) => {
            relatedElement.innerHTML += `<a href="?entry-${relatedWord.id}" style="color: green;">${highlight(relatedWord.title, searchTerm)}</a>`;
            if (index < row.related.length - 1) {
                relatedElement.innerHTML += ', ';
            }
        });
    } else {
        relatedElement.innerHTML = `<strong>${await getTranslatedText('relatedWords', language)}:</strong> ${await getTranslatedText('noneFound', language)}`;
    }

    contentBox.appendChild(metaElement);
    contentBox.appendChild(notesElement);
    contentBox.appendChild(morphElement);
    contentBox.appendChild(relatedElement);

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

    // Add fade-in effect
    setTimeout(() => {
        box.classList.add('fade-in');
    }, 100);

    return box;
}

// Function to create a no match box
export async function createNoMatchBox(language) {
    const noMatchBox = document.createElement('div');
    noMatchBox.className = 'dictionary-box no-match';
    noMatchBox.textContent = await getTranslatedText('noMatch', language); // Adjust to be language-sensitive
    return noMatchBox;
}

// Function to create a loading box
export function createLoadingBox() {
    const loadingBox = document.createElement('div');
    loadingBox.className = 'dictionary-box loading';
    return loadingBox;
}

// Function to update the floating text
export async function updateFloatingText(filteredRows, searchTerm, filters, advancedSearchParams, language) {
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

export async function renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage) {
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.innerHTML = ''; // Clear previous entries

    const language = document.querySelector('meta[name="language"]').content || 'en';

    if (filteredRows.length === 0) {
        dictionaryContainer.appendChild(await createNoMatchBox(language));
        updatePagination(currentPage, filteredRows, rowsPerPage);
        await updateFloatingText(filteredRows, searchTerm, [], {}, language);
        return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rowsToDisplay = filteredRows.slice(start, end);

    for (const row of rowsToDisplay) {
        const box = await createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        if (box) {
            dictionaryContainer.appendChild(box);
        }
    }

    updatePagination(currentPage, filteredRows, rowsPerPage);
    await updateFloatingText(filteredRows, searchTerm, [], {}, language);
}
