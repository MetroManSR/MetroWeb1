// Function to create a dictionary box
export function createDictionaryBox(row, searchTerm, exactMatch, searchIn) {
    const box = document.createElement('div');
    box.classList.add('dictionary-box');
    box.id = `entry-${row.id}`;

    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    wordElement.textContent = row.word;

    const translationElement = document.createElement('div');
    translationElement.classList.add('translation');
    translationElement.textContent = row.definition;

    const notesElement = document.createElement('div');
    notesElement.classList.add('notes');
    notesElement.textContent = row.notes;

    const originElement = document.createElement('div');
    originElement.classList.add('origin');
    originElement.textContent = row.etymology;

    const typeElement = document.createElement('div');
    typeElement.classList.add('type');
    typeElement.textContent = row.type === 'root' ? 'Root' : 'Word';

    // Add type tag to the top right
    const typeTag = document.createElement('span');
    typeTag.classList.add('type-tag');
    typeTag.textContent = row.type === 'root' ? 'Root' : 'Word';
    typeTag.style.position = 'absolute';
    typeTag.style.top = '5px';
    typeTag.style.right = '5px';
    typeTag.style.backgroundColor = 'lightgrey';
    typeTag.style.padding = '2px 5px';
    typeTag.style.borderRadius = '3px';
    typeTag.style.fontSize = '0.8em';
    
    box.appendChild(typeTag);
    box.appendChild(wordElement);
    box.appendChild(translationElement);
    box.appendChild(notesElement);
    box.appendChild(originElement);
    box.appendChild(typeElement);

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
