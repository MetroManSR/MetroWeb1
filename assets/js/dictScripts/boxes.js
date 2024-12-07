import { sanitizeHTML } from './csvUtils.js';

export function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
    const box = document.createElement('div');
    box.className = 'dictionary-box ' + (row.type === 'root' ? 'root-word' : 'word');
    
    const wordElement = document.createElement('h3');
    wordElement.textContent = sanitizeHTML(row.word);
    box.appendChild(wordElement);

    const definitionElement = document.createElement('p');
    definitionElement.className = 'meaning-box';
    definitionElement.innerHTML = sanitizeHTML(row.definition);
    box.appendChild(definitionElement);

    // Add part of speech if available
    if (row.partOfSpeech) {
        const posElement = document.createElement('div');
        posElement.className = 'part-of-speech';
        posElement.textContent = row.partOfSpeech;
        box.appendChild(posElement);
    }

    // Add ID display in bottom right
    const idElement = document.createElement('div');
    idElement.className = 'id-display';
    idElement.textContent = 'ID: ' + row.id;
    box.appendChild(idElement);

    // Implement the fade-in effect
    setTimeout(() => box.classList.add('fade-in'), 10);

    return box;
}
