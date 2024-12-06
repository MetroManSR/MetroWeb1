import { getRelatedWordsByRoot } from './utils.js';

// Function to create a dictionary box
export function createDictionaryBox(row, searchTerm, exactMatch, searchIn) {
    console.log('Creating box for:', row);

    if (!row || !row.word) {
        console.error('Invalid row data:', row);
        return null;
    }

    const box = document.createElement('div');
    box.classList.add('dictionary-box'); // Ensures it uses the .dictionary-box class
    box.id = `entry-${row.id}`;

    const wordElement = document.createElement('div');
    wordElement.classList.add('title'); // Use .title class
    wordElement.textContent = row.word;

    const translationElement = document.createElement('div');
    translationElement.classList.add('meaning'); // Use .meaning class
    translationElement.textContent = row.definition;

    const notesElement = document.createElement('div');
    notesElement.classList.add('explanation'); // Use .explanation class
    notesElement.textContent = row.notes;

    const originElement = document.createElement('div');
    originElement.classList.add('root'); // Use .root class
    originElement.textContent = row.etymology;

    const typeElement = document.createElement('div');
    typeElement.classList.add('part-of-speech'); // Use .part-of-speech class
    typeElement.textContent = row.type === 'root' ? 'Root' : 'Word';

    // Add type tag to the top right
    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? 'Root' : 'Word';

    box.appendChild(typeTag);
    box.appendChild(wordElement);
    box.appendChild(translationElement);
    box.appendChild(notesElement);
    box.appendChild(originElement);
    box.appendChild(typeElement);

    console.log('Created box:', box);

    box.addEventListener('click', function() {
        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected');
            previouslySelectedBox.style.backgroundColor = ''; // Reset background color
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        // Highlight the clicked box
        box.classList.add('selected');
        box.style.backgroundColor = 'darkorange';

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
