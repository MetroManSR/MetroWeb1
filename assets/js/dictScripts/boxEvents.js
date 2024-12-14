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

    document.querySelectorAll('.info-button').forEach(infoButton => {
        infoButton.addEventListener('click', () => {
            const iconContainer = infoButton.nextElementSibling;
            iconContainer.style.display = iconContainer.style.display === 'none' ? 'block' : 'none';
        });
    });
}

/**
 * Creates and attaches info, warning, and suggestion icons to each dictionary box.
 *
 * @param {Element} dictionaryBox - The dictionary box element.
 * @param {Object} row - The dictionary row object.
 */
export function attachIcons(dictionaryBox, row) {
    // Info button
    const infoButton = document.createElement('button');
    infoButton.className = 'info-button';
    infoButton.innerHTML = 'ℹ️';

    // Container for additional icons
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    iconContainer.style.display = 'none';

    // Warning icon
    const warningIcon = document.createElement('button');
    warningIcon.className = 'warning-icon';
    warningIcon.innerHTML = '⚠️';
    warningIcon.title = 'Report error';

    // Suggestion icon
    const suggestionIcon = document.createElement('button');
    suggestionIcon.className = 'suggestion-icon';
    suggestionIcon.innerHTML = '❗';
    suggestionIcon.title = 'Suggestion';

    // Add icons to container
    iconContainer.appendChild(warningIcon);
    iconContainer.appendChild(suggestionIcon);

    // Add buttons to the dictionary box
    dictionaryBox.appendChild(infoButton);
    dictionaryBox.appendChild(iconContainer);

    // Add event listeners to icons
    addIconEventListeners(allRows);
}

/**
 * Copies text to the clipboard.
 *
 * @param {string} text - The text to copy to the clipboard.
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

/**
 * Displays a tooltip with a given message.
 *
 * @param {string} message - The message to display in the tooltip.
 */
function showTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}
