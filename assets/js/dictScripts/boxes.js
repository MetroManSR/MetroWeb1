import { getRelatedWordsByRoot, highlight, createHyperlink } from './utils.js';
import { updatePagination } from './pagination.js';
import { getTranslatedText } from './loadTexts.js';
import { attachIcons } from './boxEvents.js';

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
        notesElement.innerHTML = `<strong>${await getTranslatedText('etymology', language)}:</strong> ${highlight(row.notes || '', searchTerm, searchIn, row)}`;
        contentBox.appendChild(metaElement);
        contentBox.appendChild(notesElement);
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

    // Attach icons to the dictionary box
    attachIcons(box, row);

    // Implement selection logic
    box.addEventListener('click', (event) => {
        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected');
        }
        box.classList.add('selected');
        previouslySelectedBox = box;
    });

    return box;
        }

// Function to create and update pagination controls
export function updateDictionaryPagination(dictionaryBoxes, itemsPerPage) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear previous pagination controls

    const totalItems = dictionaryBoxes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-button');
        pageButton.textContent = i;

        pageButton.addEventListener('click', () => {
            updatePagination(i, itemsPerPage, dictionaryBoxes);
        });

        paginationControls.appendChild(pageButton);
    }

    // Initialize the first page
    updatePagination(1, itemsPerPage, dictionaryBoxes);
}

// Function to update the dictionary display based on the provided rows
export async function updateDictionaryDisplay(rows, searchTerm, exactMatch, searchIn, itemsPerPage) {
    const dictionaryContainer = document.getElementById('dictionary-container');
    dictionaryContainer.innerHTML = ''; // Clear previous content

    const allRows = await getAllDictionaryRows(); // Function to retrieve all dictionary rows

    const dictionaryBoxes = await Promise.all(
        rows.map(row => createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn))
    );

    dictionaryBoxes.forEach(box => {
        if (box) {
            dictionaryContainer.appendChild(box);
        }
    });

    updateDictionaryPagination(dictionaryBoxes, itemsPerPage);
}
