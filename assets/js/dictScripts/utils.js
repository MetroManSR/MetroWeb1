/**
 * Gets related words by root.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 * @returns {Array} - The array of related words.
 */
export function getRelatedWordsByRoot(allRows) {
    // Calculate related words and derivative roots
    allRows.forEach(clnrow => {
        let relatedWords = [];

        // Ensure morph is an array
        if (typeof clnrow.morph === 'string') {
            clnrow.morph = clnrow.morph.split(',').map(i => i.trim());
        }

        // Initialize morph as an empty array if undefined or null
        if (!Array.isArray(clnrow.morph)) {
            clnrow.morph = [];
        }

        // Logic for root type
        if (clnrow.type === 'root') {
            const matchingWords = allRows.filter(r => {
                if (Array.isArray(r.morph) && r.type === 'word') {
                    return r.morph.some(item => item.toLowerCase() === clnrow.title.toLowerCase());
                }
                return false;
            });
            relatedWords.push(...matchingWords.map(r => r.title));
        }
        // Logic for word type
        else if (clnrow.type === 'word') {
            clnrow.morph.forEach(mrphIt => {
                if (mrphIt) {
                    const matchingWords = allRows.filter(r => {
                        if (Array.isArray(r.morph) && r.type === 'word') {
                            return r.morph.some(item => item.toLowerCase() === mrphIt.toLowerCase());
                        }
                        return false;
                    });
                    relatedWords.push(...matchingWords.map(r => r.title));
                }
            });
        }

        clnrow.related = relatedWords.length > 0 ? relatedWords : ['No related words found'];
    });

    return allRows;
}

/**
 * Highlights the search term in the text.
 *
 * @param {string} text - The text to search within.
 * @param {string} term - The term to highlight.
 * @returns {string} - The text with highlighted terms.
 */
export function highlight(text, term) {
    if (!text || !term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Utility function to sanitize HTML
export function sanitizeHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
}

/**
/**
 * Creates a hyperlink for dictionary entries if they exist.
 *
 * @param {string} searchTerm - The search term to highlight in the title.
 * @param {string} title - The title of the related word.
 * @param {Array} allRows - The array of all dictionary rows.
 * @returns {string} - The HTML string of the hyperlink if found, otherwise the original string.
 */
export function createHyperlink(title, searchTerm = '', allRows = []) {
    const relatedRow = allRows.find(r => r.title.trim().toLowerCase() === title.trim().toLowerCase());
    console.log('Title:', title);
    console.log('Related Row:', relatedRow);

    if (relatedRow) {
        const idParam = relatedRow.type === 'root' ? 'rootid' : 'wordid';
        const highlightedTitle = highlight(title, searchTerm);
        const hyperlink = `<a href="?${idParam}=${relatedRow.id}" style="color: green;">${highlightedTitle}</a>`;
        console.log('Hyperlink:', hyperlink);
        return hyperlink;
    } else {
        console.log('Title not found, returning original title:', title);
        return title;
    }
}

/**
 * Copies text to the clipboard.
 *
 * @param {string} text - The text to copy to the clipboard.
 */
export function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
