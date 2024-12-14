import { copyToClipboard, createHyperlink } from './utils.js';
import { getTranslatedText } from './loadTexts.js';
import { universalPendingChanges} from './initFormEventListeners.js';


let previouslySelectedBox = null;
let lastClickTime = 0;

export async function loadInfoBox(box, row) {
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

    // Exclamation icon
    const suggestionIcon = document.createElement('button');
    suggestionIcon.className = 'suggestion-icon';
    suggestionIcon.innerHTML = '❗';
    suggestionIcon.title = 'Suggestion';

    // Add event listeners
    warningIcon.addEventListener('click', () => {
        const message = `Hello I found a mistake or bug in ${row.title} [${row.id}]: _insert your input_`;
        copyToClipboard(message);
        showTooltip('Copied to clipboard! Paste this in the help channel of the discord server of Balkeon.');
    });

    suggestionIcon.addEventListener('click', () => {
        const message = `Hello I think I have an idea to improve word ${row.title} [${row.id}]: _suggestion here_`;
        copyToClipboard(message);
        showTooltip('Copied to clipboard! Paste this in the help channel of the discord server of Balkeon.');
    });

    // Append icons to container
    iconContainer.appendChild(warningIcon);
    iconContainer.appendChild(suggestionIcon);

    // Toggle icon visibility on info button click
    infoButton.addEventListener('click', () => {
        iconContainer.style.display = iconContainer.style.display === 'none' ? 'flex' : 'none';
    });

    // Append the info button and icon container to the box
    box.appendChild(infoButton);
    box.appendChild(iconContainer);
}

export function boxClickListener(allRows, language, pendingChanges) {
    // Ensure pendingChanges is initialized
    if (!pendingChanges || pendingChanges.length === 0) {
        pendingChanges = universalPendingChanges ?? defaultPendingChanges;
    }

    // Set searchTerm if not present
    pendingChanges.searchTerm = pendingChanges.searchTerm || '';

    console.log('Initializing Box Click Event Listener');

    async function handleClickEvent(e) {
        const now = Date.now();
        if (now - lastClickTime < 250) return; // 0.25 second cooldown
        lastClickTime = now;

        const target = e.target;
        if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.icon-container')) {
            return; // Ignore clicks on links, buttons, and the icon container
        }

        e.stopPropagation(); // Stop event propagation to avoid duplicate events
        e.preventDefault();  // Prevent default action to ensure correct handling

        // Find the closest .dictionary-box element
        const box = target.closest('.dictionary-box');
        if (!box) return;

        // Extract the type and row ID from the box's ID attribute
        const [type, id] = box.id.split('-');
        const rowId = parseInt(id, 10);
        const row = allRows.find(r => r.id === rowId && r.type === type);

        if (!row) {
            console.error(`Row with id ${rowId} and type ${type} not found.`);
            return;
        }

        if (previouslySelectedBox) {
            previouslySelectedBox.classList.remove('selected-word', 'selected-root');
            const previousRelatedWords = previouslySelectedBox.querySelector('.related-words');
            if (previousRelatedWords) {
                previouslySelectedBox.removeChild(previousRelatedWords);
            }
        }

        if (box === previouslySelectedBox) {
            previouslySelectedBox = null;
            return;
        }

        box.classList.add(row.type === 'root' ? 'selected-root' : 'selected-word');

        const relatedWordsElement = document.createElement('div');
        relatedWordsElement.className = 'related-words';
        relatedWordsElement.style.fontSize = '0.85em';

        let derivativeWordsLabel = '';
        let relatedWordsLabel = '';

        if (row.type === 'root') {
            derivativeWordsLabel = await getTranslatedText('derivativeWords', language);
            if (row.related && row.related.length > 0) {
                console.log('Derivatives:', row.related); // Debugging

                // Ensure the displayed word is not shown as a related word
                const relatedWordsHtml = row.related
                    .filter(dw => dw.toLowerCase() !== row.title.toLowerCase())
                    .map(dw => {
                        // Find the related word in the allRows array
                        const relatedWord = typeof dw === 'string' ? allRows.find(r => r.title.trim().toLowerCase() === dw.trim().toLowerCase()) : dw;

                        // Log for debugging
                        console.log('Derivative word:', dw, 'Related word:', relatedWord);

                        // Return a string with the title and ID, formatted with a hyperlink
                        return relatedWord ? `${relatedWord.title} [${relatedWord.id}]: ${createHyperlink(relatedWord.title, pendingChanges.searchTerm, allRows)}` : dw;
                    }).join(', ');

                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${relatedWordsHtml}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${derivativeWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }

            if (row.morph && row.morph.length > 1) {
                console.log('Morph length is greater than 1:', row.morph); // Debugging
                const rootButtonsElement = document.createElement('div');
                rootButtonsElement.className = 'root-buttons';
                for (const root of row.morph) {
                    console.log('Creating button for root:', root); // Debugging
                    const rootButton = document.createElement('button');
                    rootButton.innerText = root;
                    rootButton.addEventListener('click', async () => {
                        console.log('Clicked root button:', root); // Debugging
                        const rootRelatedWords = allRows.filter(r => r.root === root && r.title.toLowerCase() !== row.title.toLowerCase())
                            .map(r => `${r.title} [${r.id}]: ${createHyperlink(r.title, pendingChanges.searchTerm, allRows)}`)
                            .join(', ');

                        relatedWordsLabel = await getTranslatedText('relatedWords', language);
                        relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${rootRelatedWords}`;
                    });
                    rootButtonsElement.appendChild(rootButton);
                }
                relatedWordsElement.appendChild(rootButtonsElement);
            }
        } else {
            relatedWordsLabel = await getTranslatedText('relatedWords', language);
            const relatedWords = row.related || [];

            if (relatedWords.length > 0) {
                console.log('Related Words:', relatedWords); // Debugging
                const relatedWordsHtml = relatedWords
                    .filter(rw => rw.toLowerCase() !== row.title.toLowerCase())
                    .map(rw => {
                        const relatedWord = typeof rw === 'string' ? allRows.find(r => r.title.trim().toLowerCase() === rw.trim().toLowerCase()) : rw;
                        console.log('Related word:', rw, 'Related word:', relatedWord);
                        return relatedWord ? `${relatedWord.title} [${relatedWord.id}]: ${createHyperlink(relatedWord.title, pendingChanges.searchTerm, allRows)}` : rw;
                    }).join(', ');

                relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${relatedWordsHtml}`;
            } else {
                relatedWordsElement.innerHTML = `<strong>${relatedWordsLabel}:</strong> ${await getTranslatedText('noneFound', language)}`;
            }
        }

        if (relatedWordsElement.scrollHeight > 3 * parseFloat(getComputedStyle(relatedWordsElement).lineHeight)) {
            relatedWordsElement.style.maxHeight = '3em';
            relatedWordsElement.style.overflowY = 'auto';
        }

        box.appendChild(relatedWordsElement);

        previouslySelectedBox = box;
    }

    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.addEventListener('click', handleClickEvent, true); // Use capturing phase

    console.log('Initialized Box Click Event Listener');
}
