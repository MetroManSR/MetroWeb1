import { getRelatedWordsByRoot, highlight } from './utils.js';

let previouslySelectedBox = null;

// Function to create a dictionary box
export function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
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
    wordElement.innerHTML = highlight(row.word || '', searchTerm) + (row.type !== 'root' ? ` (${getPartOfSpeechAbbreviation(row.partOfSpeech, document.querySelector('meta[name="language"]').content || 'en')})` : '');

    const definitionElement = document.createElement('div');
    definitionElement.classList.add('meaning-box');
    definitionElement.innerHTML = `
        <div class="meaning">${highlight(row.definition || '', searchTerm)}</div>
        <div class="explanation">${highlight(row.notes || '', searchTerm)}</div>
        <div class="root">${highlight(row.etymology || '', searchTerm)}</div>
    `;

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

    console.log('Created box:', box);

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

    return abbreviations[language][partOfSpeech.toLowerCase()] || partOfSpeech;
}
