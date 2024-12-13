import { getRelatedWordsByRoot } from './utils.js';

/**
 * Adds event listeners for related words on dictionary boxes.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 */
export function addRelatedWordsEventListeners(allRows) {
    document.querySelectorAll('.dictionary-box-title').forEach(element => {
        element.addEventListener('click', (event) => {
            const boxId = event.target.closest('.dictionary-box').id;
            const row = allRows.find(r => `${r.type}-${r.id}` === boxId);

            if (row) {
                const relatedWords = getRelatedWordsByRoot(allRows, row);
                displayRelatedWords(relatedWords, event.target);
            }
        });
    });
}

/**
 * Displays related words.
 *
 * @param {Array} relatedWords - The array of related words.
 * @param {Element} targetElement - The element to attach the related words display to.
 */
function displayRelatedWords(relatedWords, targetElement) {
    const relatedWordsContainer = document.createElement('div');
    relatedWordsContainer.classList.add('related-words-container');
    
    relatedWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.textContent = word;
        relatedWordsContainer.appendChild(wordElement);
    });

    targetElement.appendChild(relatedWordsContainer);
}

/**
 * Adds event listeners for warning and exclamation icons on dictionary boxes.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 */
export function addIconEventListeners(allRows) {
    document.querySelectorAll('.warning-icon').forEach(element => {
        element.addEventListener('click', (event) => {
            const boxId = event.target.closest('.dictionary-box').id;
            const row = allRows.find(r => `${r.type}-${r.id}` === boxId);
            const message = `Hello, I found a mistake or bug in ${row.title} [${row.id}]: _insert your input_`;
            copyToClipboard(message);
            showTooltip('Copied to clipboard! Paste this in the help channel of the discord server of Balkeon.');
        });
    });

    document.querySelectorAll('.suggestion-icon').forEach(element => {
        element.addEventListener('click', (event) => {
            const boxId = event.target.closest('.dictionary-box').id;
            const row = allRows.find(r => `${r.type}-${r.id}` === boxId);
            const message = `Hello, I think I have an idea to improve word ${row.title} [${row.id}]: _suggestion here_`;
            copyToClipboard(message);
            showTooltip('Copied to clipboard! Paste this in the help channel of the discord server of Balkeon.');
        });
    });
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}
