/**
 * Cleans and formats the data for the dictionary.
 * @param {Array} data - The raw data to be cleaned.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Promise<Array>} - A promise that resolves to the cleaned and formatted data.
 */
export async function cleanData(data, type) {
    const totalRows = data.length;
    const progressBar = document.getElementById('dict-progress-bar');
    const progressText = document.getElementById('dict-progress-text');

    if (!progressBar || !progressText) {
        console.error("Progress bar or text element not found!");
        return [];
    }

    console.log(`Total rows to process: ${totalRows}`);

    // Fake increment
    for (let i = 0; i <= 100; i++) {
        progressBar.style.width = `${i}%`;
        progressText.textContent = `Preparing... ${i}%`;
        await new Promise(resolve => setTimeout(resolve, 10)); // Adjust time for speed
    }

    const cleanedData = [];
    const increment = Math.ceil(totalRows / 10); // Calculate increment for 10% steps

    for (let index = 0; index < totalRows; index++) {
        const row = data[index];
        console.log(`Original row ${index}:`, row);

        let cleanedRow = {
            id: index, // Assign unique ID
            type: type, // Identification of type (root or word)
            title: '', // Initialize title
            partofspeech: '', // Initialize part of speech
            meta: '', // Initialize meta
            notes: '', // Initialize notes
            morph: '' // Initialize morph
        };

        if (type === 'word') {
            console.log(`Processing word row ${index}: col1=${row.col1}, col2=${row.col2}, col3=${row.col3}, col4=${row.col4}, col5=${row.col5}`);
            cleanedRow.title = sanitizeHTML(tryMultipleEncodings(row.col1 ? row.col1.trim() : '')); // X title for words
            cleanedRow.partofspeech = sanitizeHTML(tryMultipleEncodings(row.col2 ? row.col2.trim() : '')); // Part of Speech for words
            cleanedRow.morph = sanitizeHTML(tryMultipleEncodings(row.col3 ? row.col3.trim() : '')); // Morphology for words
            cleanedRow.notes = sanitizeHTML(tryMultipleEncodings(row.col4 ? row.col4.trim() : '')); // Notes for words
            cleanedRow.meta = sanitizeHTML(tryMultipleEncodings(row.col5 ? row.col5.trim() : '')); // Meta for words
        } else if (type === 'root') {
            const rawTitle = row.col1 ? row.col1.trim() : '';
            console.log(`Processing root row ${index}: rawTitle=${rawTitle}`);
            const [root, rest] = rawTitle.split(' = ');
            console.log(`Split root row ${index}: root=${root}, rest=${rest}`);
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            console.log(`Processed translation and meta for row ${index}: translation=${translation}, meta=${meta}`);
            const [notes, morph] = meta ? meta.slice(0, -1).split(', del ') : ['', ''];
            console.log(`Processed notes and morph for row ${index}: notes=${notes}, morph=${morph}`);

            cleanedRow.title = sanitizeHTML(tryMultipleEncodings(root ? root.trim() : '')); // X title for roots
            cleanedRow.meta = sanitizeHTML(tryMultipleEncodings(translation ? translation.trim() : '')); // Y meta for roots
            cleanedRow.notes = sanitizeHTML(tryMultipleEncodings(notes ? notes.trim() : '')); // A notes for roots
            cleanedRow.morph = sanitizeHTML(tryMultipleEncodings(morph ? morph.trim() : '')); // B morph for roots
        }

        console.log(`Cleaned row ${index}:`, cleanedRow);
        cleanedData.push(cleanedRow);

        // Update real progress bar in whole percentage increments
        if ((index + 1) % increment === 0 || index === totalRows - 1) { // Update at each 10% step and at the end
            const progress = Math.min(Math.floor(((index + 1) / totalRows) * 100), 100); // Limit progress to 100%
            console.log(`Updating progress bar: ${progress}%`);
            progressBar.style.width = `${progress}%`;
            progressBar.style.display = 'block'; // Ensure the progress bar is visible
            progressText.textContent = `Parsed ${progress}%`;
            
            // Force reflow to update the progress bar
            progressBar.offsetWidth; // Trigger a reflow

            // Yield control to render the progress bar
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
    }

    // Ensure progress bar completes at 100%
    progressBar.style.width = `100%`;
    progressText.textContent = `Parsing complete!`;

    return cleanedData;
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
 * Tries multiple encoding methods to preserve special characters.
 * @param {string} str - The string to be encoded.
 * @returns {string} - The encoded string.
 */
export function tryMultipleEncodings(str) {
    let encodedStr = str;

    try {
        encodedStr = decodeURIComponent(escape(str)); // Attempt 1
    } catch (e) {
        console.error('Encoding attempt 1 failed:', e);
    }

    if (encodedStr === str) {
        try {
            encodedStr = new TextDecoder('utf-8').decode(new TextEncoder().encode(str)); // Attempt 2
        } catch (e) {
            console.error('Encoding attempt 2 failed:', e);
        }
    }

    if (encodedStr === str) {
        console.warn('All encoding attempts failed, returning original string.');
    }

    return encodedStr;
}
