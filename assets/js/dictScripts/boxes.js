import { getRelatedWordsByRoot, highlight } from './utils.js';
import { sanitizeHTML } from './csvUtils.js';
import { updatePagination } from './pagination.js';

let previouslySelectedBox = null;

function getPartOfSpeechAbbreviation(partOfSpeech, language) {
    if (!partOfSpeech) return ''; // Return an empty string if partOfSpeech is undefined

    const abbreviations = {
        en: {
            noun: 'n.',
            verb: 'v.',
            adjective: 'adj.',
            adverb: 'adv.',
            conjunction: 'conj.',
            interjection: 'int.',
            preposition: 'prep.',
            expression: 'expr.',
            pronoun: 'pron.'
        },
        es: {
            noun: 's.',
            verb: 'v.',
            adjective: 'adj.',
            adverb: 'adv.',
            conjunction: 'conj.',
            interjection: 'interj.',
            preposition: 'prep.',
            expression: 'expr.',
            pronoun: 'pron.'
        }
    };

    return abbreviations[language] && abbreviations[language][partOfSpeech.toLowerCase()] || partOfSpeech;
}

// Function to create a dictionary box
export function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
    if (!row || !row.word) {
        console.error('Invalid row data:', row);
        return null;
    }

    const box = document.createElement('div');
    box.classList.add('dictionary-box');
    box.id = `entry-${row.id}`;

    if (row.type === 'root') {
        box.classList.add('root-word'); // Apply root word styling
    }

    const wordElement = document.createElement('div');
    wordElement.classList.add('title');
    wordElement.innerHTML = highlight(row.word || '', searchTerm) + (row.type !== 'root' ? ` (${getPartOfSpeechAbbreviation(row.partOfSpeech, document.querySelector('meta[name="language"]').content || 'en')})` : '');

    const definitionElement = document.createElement('div');
    definitionElement.classList.add('meaning-box');
    if (row.type === 'root') {
        definitionElement.innerHTML = `
            <div class="meaning">${highlight(row.definition || '', searchTerm)}</div>
            <div class="explanation">${highlight(row.notes || '', searchTerm)}</div>
            <div class="etymology">${document.querySelector('meta[name="language"]').content === 'es' ? 'Etimología: ' : 'Etymology: '}${highlight(row.etymology || '', searchTerm)}</div>
        `;
    } else {
        definitionElement.innerHTML = `
            <div class="meaning">${highlight(row.definition || '', searchTerm)}</div>
            <div class="explanation">${highlight(row.notes || '', searchTerm)}</div>
            <div class="root">${document.querySelector('meta[name="language"]').content === 'es' ? 'Raíz: ' : 'Root: '}${highlight(row.etymology || '', searchTerm)}</div>
        `;
    }

    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? 'Root' : 'Word';
    typeTag.style.position = 'absolute';
    typeTag.style.top = '10px';
    typeTag.style.right = '10px';

    box.style.position = 'relative';  // Ensure the box is relatively positioned

    box.appendChild(typeTag);
    box.appendChild(wordElement);
    box.appendChild(definitionElement);

    // Add ID display in bottom right
    const idElement = document.createElement('div');
    idElement.className = 'id-display';
    idElement.textContent = 'ID: ' + row.id;
    box.appendChild(idElement);

    box.addEventListener('click', function() {
        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected-word', 'selected-root');
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        if (box === previouslySelectedBox) {
            previouslySelectedBox = null;
            return; // Deselect the current box
        }

        // Highlight the clicked box
        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        // Display related words by root
        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em'; // Make the font smaller

        const { count, list } = getRelatedWordsByRoot(row.word, row.etymology, allRows);
        if (list) {
            relatedWordsElement.innerHTML = `${count} words related: ${list}`;
            box.appendChild(relatedWordsElement);

            // Check if the related words exceed 30 and make it scrollable
            if (count > 30) {
                relatedWordsElement.classList.add('scrollable-box');
            }
        }

        previouslySelectedBox = box; // Set the clicked box as the previously selected one
    });

    // Add fade-in effect
    setTimeout(() => {
        box.classList.add('fade-in');
    }, 100);

    return box;
}

// Function to create a no match box
export function createNoMatchBox() {
    const noMatchBox = document.createElement('div');
    noMatchBox.className = 'dictionary-box no-match';
    noMatchBox.textContent = 'No match for your search';
    return noMatchBox;
}

// Function to create a loading box
export function createLoadingBox() {
    const loadingBox = document.createElement('div');
    loadingBox.className = 'dictionary-box loading';
    return loadingBox;
}

// Function to update the floating text
export function updateFloatingText(filteredRows, searchTerm, filters, advancedSearchParams) {
    let floatingTextContent = `${filteredRows.length} words found`;

    if (searchTerm) {
        floatingTextContent += ` when looking for "${searchTerm}"`;
    }
    if (filters.length > 0) {
        floatingTextContent += ` with filters: ${filters.join(", ")}`;
    }
    if (advancedSearchParams) {
        floatingTextContent += ` with advanced search applied: ${Object.keys(advancedSearchParams).join(", ")}`;
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

export function renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage) {
    const dictionaryContainer = document.getElementById('dictionary');
    dictionaryContainer.innerHTML = ''; // Clear previous entries

    if (filteredRows.length === 0) {
        dictionaryContainer.appendChild(createNoMatchBox());
        updatePagination(currentPage, filteredRows, rowsPerPage);
        updateFloatingText(filteredRows, searchTerm, [], {});
        return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rowsToDisplay = filteredRows.slice(start, end);

    rowsToDisplay.forEach((row) => {
        const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        if (box) {
            dictionaryContainer.appendChild(box);
        }
    });

    updatePagination(currentPage, filteredRows, rowsPerPage);
    updateFloatingText(filteredRows, searchTerm, [], {});
}
