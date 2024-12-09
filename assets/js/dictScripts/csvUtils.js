/**
 * Cleans and formats the data for the dictionary.
 * @param {Array} data - The raw data to be cleaned.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Array} - The cleaned and formatted data.
 */
export function cleanData(data, type) {
    return data.map((row, index) => {
        const cleanedRow = {
            id: row.id || index, // Assign unique ID if missing
            type: type, // Identification of type (root or word)
            title: sanitizeHTML(row.title ? row.title.trim() : ''), // Original root or word
            partofspeech: sanitizeHTML(type === 'root' ? '' : row.partofspeech ? row.partofspeech.trim() : ''), // Empty for roots
            meta: sanitizeHTML(row.meta ? row.meta.trim() : ''), // Translation to Spanish or English
            notes: sanitizeHTML(row.notes ? row.notes.trim() : ''), // Any notes left
            morph: sanitizeHTML(row.morph ? row.morph.trim() : '') // Etymology for roots, part of speech for words
        };

        return cleanedRow;
    });
}

/**
 * Sanitizes a string to remove any potentially harmful HTML content.
 * @param {string} str - The string to be sanitized.
 * @returns {string} - The sanitized string.
 */
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
