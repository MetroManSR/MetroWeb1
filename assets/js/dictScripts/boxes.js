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

    // Log and handle morph correctly
    console.log('Type of morph:', typeof row.morph);
    console.log('Morph value:', row.morph);

    // Display morphology for words and etymology for roots
    if (row.type === 'root') {
        const notesElement = document.createElement('div');
        notesElement.classList.add('dictionary-box-notes');
        notesElement.innerHTML = `<strong>${await getTranslatedText('etymology', language)}:</strong> ${highlight(row.notes || '', searchTerm)}`;
        contentBox.appendChild(notesElement);
    } else {
        const notesElement = document.createElement('div');
        notesElement.classList.add('dictionary-box-notes');
        notesElement.innerHTML = `<strong>${await getTranslatedText('notes', language)}:</strong> ${highlight(row.notes || '', searchTerm)}`;
        contentBox.appendChild(metaElement);
        contentBox.appendChild(notesElement);

        if (row.morph && typeof row.morph === 'object' && row.morph.title) {
            const morphArray = row.morph.title;
            if (Array.isArray(morphArray) && morphArray.length > 0) {
                const morphElement = document.createElement('div');
                morphElement.classList.add('dictionary-box-morph');
                morphElement.innerHTML = `<strong>${await getTranslatedText('morphology', language)}:</strong> `;
                morphArray.forEach((morphItem, index) => {
                    const matchingRoot = allRows.find(r => r.title.toLowerCase() === morphItem.toLowerCase() && r.type === 'root');
                    morphElement.innerHTML += matchingRoot 
                        ? `<a href="?rootid=${matchingRoot.id}" style="color: green;">${highlight(morphItem, searchTerm)}</a>` 
                        : highlight(morphItem, searchTerm);
                    if (index < morphArray.length - 1) {
                        morphElement.innerHTML += ', ';
                    }
                });
                contentBox.appendChild(morphElement);
            }
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
    loadingBox.textContent = "Loading..."; // Add some loading text or a spinner
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

    updatePagination(currentPage, filteredRows, rowsPerPage);
    await updateFloatingText(filteredRows, searchTerm, [], {}, language);
}
