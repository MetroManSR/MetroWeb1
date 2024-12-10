import { getRelatedWordsByRoot, highlight } from './utils.js';
import { updatePagination } from './pagination.js';

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
export function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
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
    metaElement.innerHTML = `<strong>Translation:</strong> ${highlight(row.meta || '', searchTerm)}`;

    const notesElement = document.createElement('div');
    notesElement.classList.add('dictionary-box-notes');
    notesElement.innerHTML = `<strong>Notes:</strong> ${row.type === 'root' ? highlight(row.morph || '', searchTerm) : highlight(row.notes || '', searchTerm)}`;

    const morphElement = document.createElement('div');
    morphElement.classList.add('dictionary-box-morph');
    
    if (row.type === 'root') {
        morphElement.innerHTML = `<strong>Etymology:</strong> ${highlight(row.notes || '', searchTerm)}`;
    } else {
        // Check if the morphology exists and create hyperlinks
        const morphologies = row.morph.split(',');
        morphElement.innerHTML = '<strong>Morphology:</strong> ';
        morphologies.forEach((morph, index) => {
            const matchingRoot = allRows.find(r => r.title.toLowerCase() === morph.trim().toLowerCase() && r.type === 'root');
            if (matchingRoot) {
                morphElement.innerHTML += `<a href="?rootid=${matchingRoot.id}">${highlight(morph.trim(), searchTerm)}</a>`;
                if (index < morphologies.length - 1) {
                    morphElement.innerHTML += ', ';
                }
            } else {
                morphElement.innerHTML += highlight(morph.trim(), searchTerm);
                if (index < morphologies.length - 1) {
                    morphElement.innerHTML += ', ';
                }
            }
        });
    }

    contentBox.appendChild(metaElement);
    contentBox.appendChild(notesElement);
    contentBox.appendChild(morphElement);

    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? 'Root' : 'Word';
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
    idElement.textContent = 'ID: ' + row.id;
    idElement.style.position = 'absolute';
    idElement.style.bottom = '10px';
    idElement.style.right = '10px';

    box.appendChild(idElement);

    // Ensure text does not overlap with type tag or ID box
    wordElement.style.paddingRight = '50px'; // Adjust padding to avoid type tag
    morphElement.style.paddingBottom = '30px'; // Adjust padding to avoid ID box

    // Click event for highlighting and showing related words (or derivative words for roots)
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

        // Display related words or derivative words
        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em'; // Make the font smaller

        if (row.type === 'root') {
            // Display derivative words for roots
            const derivativeWords = allRows.filter(r => r.type !== 'root' && r.morph && r.morph.includes(row.title) && r.id !== row.id);
            if (derivativeWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>Derivative Words:</strong> ${derivativeWords.map(dw => highlight(dw.title, searchTerm)).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>Derivative Words:</strong> None found`;
            }
        } else {
            // Display related words for words
            const relatedWords = getRelatedWordsByRoot(row.morph, allRows).filter(rw => rw.id !== row.id);
            if (relatedWords.length > 0) {
                relatedWordsElement.innerHTML = `<strong>Related Words:</strong> ${relatedWords.map(rw => highlight(rw.title, searchTerm)).join(', ')}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>Related Words:</strong> None found`;
            }
        }

        box.appendChild(relatedWordsElement);

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
    const dictionaryContainer = document.getElementById('dict-dictionary');
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
