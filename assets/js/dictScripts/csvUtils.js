/**
 * Cleans and formats the data for the dictionary.
 * @param {Array} data - The raw data to be cleaned.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Array} - The cleaned and formatted data.
 */
export function cleanData(data, type) {
    return data.map((row, index) => {
        console.log('Original row:', row);

        let cleanedRow = {
            id: row.id || index, // Assign unique ID if missing
            type: type, // Identification of type (root or word)
            title: sanitizeHTML(row[0] ? row[0].trim() : ''), // Original word or root
            meta: sanitizeHTML(row[4] ? row[4].trim() : ''), // Translation (common for both)
            notes: sanitizeHTML(row[3] ? row[3].trim() : '') // Notes (common for both)
        };

        if (type === 'word') {
            cleanedRow.partofspeech = sanitizeHTML(row[1] ? row[1].trim() : ''); // Part of Speech for words
            cleanedRow.morph = sanitizeHTML(row[2] ? row[2].trim() : ''); // Definition for words
        } else if (type === 'root') {
            cleanedRow.partofspeech = ''; // Empty for roots
            cleanedRow.morph = sanitizeHTML(row[2] ? row[2].trim() : ''); // Etymology for roots
        }

        console.log('Cleaned row:', cleanedRow);
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
