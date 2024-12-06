import { getRelatedWordsByRoot } from './utils.js';

// Function to create a dictionary box
export function createDictionaryBox(row, searchTerm, exactMatch, searchIn) {
    console.log('Creating box for:', row);

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
    wordElement.textContent = `${row.word}${row.partOfSpeech ? ` (${row.partOfSpeech})` : ''}`;

    const translationElement = document.createElement('div');
    translationElement.classList.add('meaning');
    translationElement.textContent = row.definition;

    const notesElement = document.createElement('div');
    notesElement.classList.add('explanation');
    notesElement.textContent = row.notes;

    const originElement = document.createElement('div');
    originElement.classList.add('root');
    originElement.textContent = `Root: ${row.etymology}`;

    const typeElement = document.createElement('div');
    typeElement.classList.add('part-of-speech');
    typeElement.textContent = row.type === 'root' ? 'Root' : 'Word';

    // Add type tag to the top right
    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? 'Root' : 'Word';

    box.appendChild(typeTag);
    box.appendChild(wordElement);
    if (row.type !== 'root') box.appendChild(translationElement);
    box.appendChild(notesElement);
    if (row.type !== 'root') box.appendChild(originElement);
    box.appendChild(typeElement);

    console.log('Created box:', box);

    box.addEventListener('click', function() {
        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected-word', 'selected-root');
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        // Highlight the clicked box
        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        // Display related words by root
        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em'; // Make the font smaller

        const relatedWords = getRelatedWordsByRoot(row.word, row.etymology, allRows);
        if (relatedWords) {
            relatedWordsElement.innerHTML = `Related Words: ${relatedWords}`;
            box.appendChild(relatedWordsElement);
        }

        previouslySelectedBox = box; // Set the clicked box as the previously selected one
    });

    return box;
}

function displayPage(page, searchTerm = '', searchIn = { word: true, definition: false, etymology: false }, exactMatch = false) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const dictionaryContainer = document.getElementById('dictionary');

    // Check if dictionaryContainer is properly selected
    if (!dictionaryContainer) {
        console.error('Dictionary container not found');
        return;
    }

    console.log('Type of dictionaryContainer:', dictionaryContainer);

    dictionaryContainer.innerHTML = ''; // Clear previous entries

    const rowsToDisplay = filteredRows.slice(start, end);
    console.log('Rows to display:', rowsToDisplay);

    rowsToDisplay.forEach(row => {
        const box = createDictionaryBox(row, searchTerm, exactMatch, searchIn);
        if (box) {
            dictionaryContainer.appendChild(box);
            console.log('Appended box:', box);
        } else {
            console.error('Failed to create a valid object for:', row);
        }
    });

    updatePagination(page, filteredRows, rowsPerPage);
}
