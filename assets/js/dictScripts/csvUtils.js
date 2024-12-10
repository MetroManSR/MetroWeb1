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
            id: index, // Assign unique ID
            type: type, // Identification of type (root or word)
            title: '', // Initialize title
            partofspeech: '',
            meta: '', // Initialize meta
            notes: '', // Initialize notes
            morph: '' // Initialize morph
        };

        if (type === 'word') {
            cleanedRow.title = sanitizeHTML(row[0] ? row[0].trim() : ''); // X title for words
            cleanedRow.partofspeech = sanitizeHTML(row[1] ? row[1].trim() : ''); // Part of Speech for words
            cleanedRow.morph = sanitizeHTML(row[2] ? row[2].trim() : ''); // Definition for words
            cleanedRow.meta = sanitizeHTML(row[4] ? row[4].trim() : ''); // Y meta for words
            cleanedRow.notes = sanitizeHTML(row[3] ? row[3].trim() : ''); // A notes for words
        } else if (type === 'root') {
            const rawTitle = row[0] ? row[0].trim() : '';
            const [root, rest] = rawTitle.split(' = ');
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            const [notes, morph] = meta ? meta.slice(0, -1).split(', del ') : ['', ''];

            cleanedRow.title = sanitizeHTML(root ? root.trim() : ''); // X title for roots
            cleanedRow.meta = sanitizeHTML(translation ? translation.trim() : ''); // Y meta for roots
            cleanedRow.notes = sanitizeHTML(notes ? notes.trim() : ''); // A notes for roots
            cleanedRow.morph = sanitizeHTML(morph ? morph.trim() : ''); // B morph for roots
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
