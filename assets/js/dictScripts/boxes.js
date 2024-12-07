import { getRelatedWordsByRoot, highlight } from './utils.js';
import { sanitizeHTML } from './csvUtils.js';

let previouslySelectedBox = null;

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
            <div class="root">${document.querySelector('meta[name="language"]').content === 'es' ? 'Raíz: ' : 'Root
