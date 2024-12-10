
/**
 * Cleans and formats the data for the dictionary.
 * @param {Array} data - The raw data to be cleaned.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Array} - The cleaned and formatted data.
 */
export function cleanData(data, type) {
    const totalRows = data.length;
    const progressBar = document.getElementById('dict-progress-bar');
    const progressText = document.getElementById('dict-progress-text');

    if (!progressBar || !progressText) {
        console.error("Progress bar or text element not found!");
        return [];
    }

    console.log(`Total rows to process: ${totalRows}`);

    return data.map((row, index) => {
        console.log(`Original row ${index}:`, row);

        let cleanedRow = {
            id: index, // Assign unique ID
            type: type, // Identification of type (root or word)
            title: '', // Initialize title
            meta: '', // Initialize meta
            notes: '', // Initialize notes
            morph: '' // Initialize morph
        };

        if (type === 'word') {
            console.log(`Processing word row ${index}: col1=${row.col1}, col2=${row.col2}, col3=${row.col3}, col4=${row.col4}, col5=${row.col5}`);
            cleanedRow.title = sanitizeHTML(ensureProperEncoding(row.col1 ? row.col1.trim() : '')); // X title for words
            cleanedRow.partofspeech = sanitizeHTML(ensureProperEncoding(row.col2 ? row.col2.trim() : '')); // Part of Speech for words
            cleanedRow.morph = sanitizeHTML(ensureProperEncoding(row.col3 ? row.col3.trim() : '')); // Definition for words
            cleanedRow.meta = sanitizeHTML(ensureProperEncoding(row.col5 ? row.col5.trim() : '')); // Y meta for words
            cleanedRow.notes = sanitizeHTML(ensureProperEncoding(row.col4 ? row.col4.trim() : '')); // A notes for words
        } else if (type === 'root') {
            const rawTitle = row.col1 ? row.col1.trim() : '';
            console.log(`Processing root row ${index}: rawTitle=${rawTitle}`);
            const [root, rest] = rawTitle.split(' = ');
            console.log(`Split root row ${index}: root=${root}, rest=${rest}`);
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            console.log(`Processed translation and meta for row ${index}: translation=${translation}, meta=${meta}`);
            const [notes, morph] = meta ? meta.slice(0, -1).split(', del ') : ['', ''];
            console.log(`Processed notes and morph for row ${index}: notes=${notes}, morph=${morph}`);

            cleanedRow.title = sanitizeHTML(ensureProperEncoding(root ? root.trim() : '')); // X title for roots
            cleanedRow.meta = sanitizeHTML(ensureProperEncoding(translation ? translation.trim() : '')); // Y meta for roots
            cleanedRow.notes = sanitizeHTML(ensureProperEncoding(notes ? notes.trim() : '')); // A notes for roots
            cleanedRow.morph = sanitizeHTML(ensureProperEncoding(morph ? morph.trim() : '')); // B morph for roots
        }

        console.log(`Cleaned row ${index}:`, cleanedRow);

        // Update progress bar
        const progress = ((index + 1) / totalRows) * 100;
        console.log(`Updating progress bar: ${progress}%`);
        progressBar.style.width = `${progress}%`;
        progressBar.style.display = 'block'; // Ensure the progress bar is visible
        progressText.textContent = `Parsed ${index + 1} out of ${totalRows}`;
        
        // Force reflow to update the progress bar
        progressBar.offsetWidth; // Trigger a reflow

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

/**
 * Ensures proper encoding to preserve special characters.
 * @param {string} str - The string to be encoded.
 * @returns {string} - The encoded string.
 */
export function ensureProperEncoding(str) {
    const encodedStr = decodeURIComponent(escape(str)); // Ensure proper encoding
    return encodedStr;
}
