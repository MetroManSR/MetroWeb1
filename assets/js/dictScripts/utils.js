/**
 * Gets related words by root.
 *
 * @param {Array} allRows - The array of all dictionary rows.
 * @returns {Array} - The array of related words.
 */
export async function getRelatedWordsByRoot(allRows) {
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

        clnrow.morph.forEach(mrphIt => {
            if (mrphIt) {
                // Logic for root type
                if (clnrow.type === 'root') {
                    const matchingRoots = allRows.filter(r => {
                        if (Array.isArray(r.morph) && r.type !== 'root') {
                            return r.morph.some(item => item.toLowerCase() === mrphIt.toLowerCase());
                        }
                        return false;
                    });
                    relatedWords.push(...matchingRoots.map(r => `<a href="?wordid=${r.id}" style="color: green;">${r.title}</a>`));
                }
                // Logic for word type
                else if (clnrow.type === 'word') {
                    const matchingWords = allRows.filter(r => {
                        if (Array.isArray(r.morph) && r.type === 'root') {
                            return r.morph.some(item => item.toLowerCase() === mrphIt.toLowerCase());
                        }
                        return false;
                    });
                    relatedWords.push(...matchingWords.map(r => `<a href="?rootid=${r.id}" style="color: green;">${r.title}</a>`));
                }
            }
        });

        clnrow.related = relatedWords.join(', ') || 'No related words found';
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
