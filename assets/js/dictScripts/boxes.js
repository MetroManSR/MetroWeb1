import { copyToClipboard } from './utils.js'; 

/**
 * Creates a dictionary box element for a row.
 *
 * @param {Object} row - The dictionary row.
 * @param {Array} allRows - The array of all dictionary rows.
 * @param {string} searchTerm - The search term.
 * @param {boolean} exactMatch - Whether to search for exact matches.
 * @param {Object} searchIn - Object specifying fields to search in.
 * @returns {HTMLElement} The dictionary box element.
 */
export function createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn) {
    const box = document.createElement('div');
    box.className = 'dictionary-box';
    box.id = `entry-${row.id}`;

    // Add the title
    const title = document.createElement('h2');
    title.textContent = row.title;
    box.appendChild(title);

    // Add the part of speech
    const partOfSpeech = document.createElement('p');
    partOfSpeech.textContent = row.partofspeech || '';
    box.appendChild(partOfSpeech);

    // Add the meta
    const meta = document.createElement('p');
    meta.textContent = row.meta || '';
    box.appendChild(meta);

    // Add notes
    const notes = document.createElement('p');
    notes.textContent = row.notes || '';
    box.appendChild(notes);

    // Add morphology
    if (Array.isArray(row.morph)) {
        const morph = document.createElement('ul');
        row.morph.forEach(morphItem => {
            const morphElement = document.createElement('li');
            morphElement.innerHTML = morphItem;
            morph.appendChild(morphElement);
        });
        box.appendChild(morph);
    }

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

    return box;
}

/**
 * Displays a floating tooltip message.
 *
 * @param {string} message - The message to display.
 */
function showTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerText = message;
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 3000);
}

/**
 * Renders dictionary boxes.
 *
 * @param {Array} filteredRows - The filtered array of rows.
 * @param {Array} allRows - The array of all dictionary rows.
 * @param {string} searchTerm - The search term.
 * @param {boolean} exactMatch - Whether to search for exact matches.
 * @param {Object} searchIn - Object specifying fields to search in.
 * @param {number} rowsPerPage - The number of rows per page.
 * @param {number} currentPage - The current page number.
 */
export function renderBox(filteredRows, allRows, searchTerm, exactMatch, searchIn, rowsPerPage, currentPage) {
    const dictionaryContainer = document.getElementById('dict-dictionary');
    dictionaryContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredRows.length);
    const rowsToDisplay = filteredRows.slice(startIndex, endIndex);

    rowsToDisplay.forEach(row => {
        const box = createDictionaryBox(row, allRows, searchTerm, exactMatch, searchIn);
        dictionaryContainer.appendChild(box);
    });
}

/**
 * Updates the floating text indicating the current filter/search state.
 *
 * @param {Array} filteredRows - The filtered array of rows.
 * @param {string} searchTerm - The search term.
 * @param {Array} filters - The array of filters.
 * @param {Object} searchIn - Object specifying fields to search in.
 */
export function updateFloatingText(filteredRows, searchTerm, filters, searchIn) {
    const floatingTextContainer = document.getElementById('floating-text');
    floatingTextContainer.innerHTML = '';

    const totalMatches = filteredRows.length;
    let searchInfo = `Showing ${totalMatches} matches`;

    if (searchTerm) {
        searchInfo += ` for "${searchTerm}"`;
    }

    if (filters.length > 0) {
        searchInfo += ` with filters: ${filters.join(', ')}`;
    }

    if (searchIn.word || searchIn.root || searchIn.definition || searchIn.etymology) {
        searchInfo += ` in fields: ${Object.keys(searchIn).filter(key => searchIn[key]).join(', ')}`;
    }

    floatingTextContainer.textContent = searchInfo;
}
