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

    // Fake increment
    for (let i = 0; i <= 100; i++) {
        progressBar.style.width = `${i}%`;
        progressText.textContent = `Preparing... ${i}%`;
        await new Promise(resolve => setTimeout(resolve, 10)); // Adjust time for speed
    }

    const cleanedData = [];
    const anomalies = [];
    const increment = Math.ceil(totalRows / 10); // Calculate increment for 10% steps

    for (let index = 0; index < totalRows; index++) {
        const row = data[index];

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
            cleanedRow.title = sanitizeHTML(fixEncoding(row.col1 ? row.col1.trim() : '')); // X title for words
            cleanedRow.partofspeech = sanitizeHTML(fixEncoding(row.col2 ? row.col2.trim() : '')); // Part of Speech for words
            cleanedRow.morph = sanitizeHTML(fixEncoding(row.col3 ? row.col3.trim() : '')); // Morphology for words
            cleanedRow.notes = sanitizeHTML(fixEncoding(row.col4 ? row.col4.trim() : '')); // Notes for words
            cleanedRow.meta = sanitizeHTML(fixEncoding(row.col5 ? row.col5.trim() : '')); // Meta for words
        } else if (type === 'root') {
            const rawTitle = row.col1 ? row.col1.trim() : '';
            const [root, rest] = rawTitle.split(' = ');
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            const [notes, morph] = meta ? meta.slice(0, -1).split(', del ') : ['', ''];

            cleanedRow.title = sanitizeHTML(fixEncoding(root ? root.trim() : '')); // X title for roots
            cleanedRow.meta = sanitizeHTML(fixEncoding(translation ? translation.trim() : '')); // Y meta for roots
            cleanedRow.notes = sanitizeHTML(fixEncoding(notes ? notes.trim() : '')); // A notes for roots
            cleanedRow.morph = sanitizeHTML(fixEncoding(morph ? morph.trim() : '')); // B morph for roots
        }

        // Check for anomalies (missing title or meta)
        if (!cleanedRow.title || !cleanedRow.meta) {
            anomalies.push({ id: cleanedRow.id, title: cleanedRow.title, meta: cleanedRow.meta });
        }

        cleanedData.push(cleanedRow);

        // Update real progress bar in whole percentage increments
        const progress = Math.min(Math.floor(((index + 1) / totalRows) * 100), 100); // Limit progress to 100%
        progressBar.style.width = `${progress}%`;
        progressBar.style.display = 'block'; // Ensure the progress bar is visible
        progressText.textContent = `Parsed ${progress}%`;

        // Force reflow to update the progress bar
        progressBar.offsetWidth; // Trigger a reflow

        // Yield control to render the progress bar
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    // Ensure progress bar completes at 100%
    progressBar.style.width = `100%`;
    progressText.textContent = `Parsing complete!`;

    // After 3 seconds, display anomalies if any
    setTimeout(() => {
        if (anomalies.length > 0) {
            progressText.textContent = `${anomalies.length} anomalies found: ${anomalies.map(anomaly => anomaly.title ? `Title: "${anomaly.title}"` : `Meta: "${anomaly.meta}"`).join(', ')}`;
        } else {
            progressText.textContent = `No anomalies found!`;
        }
    }, 3000);

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
 * Fixes encoding issues for specific cases.
 * @param {string} str - The string to be fixed.
 * @returns {string} - The fixed string.
 */
export function fixEncoding(str) {
    return str.replace(/Ã¡/g, 'á')
              .replace(/Ã©/g, 'é')
              .replace(/Ã­/g, 'í')
              .replace(/Ã³/g, 'ó')
              .replace(/Ãº/g, 'ú')
              .replace(/Ã/g, 'Á')
              .replace(/Ã‰/g, 'É')
              .replace(/Ã/g, 'Í')
              .replace(/Ã“/g, 'Ó')
              .replace(/Ãš/g, 'Ú')
              .replace(/Ã±/g, 'ñ')
              .replace(/Ã‘/g, 'Ñ')
              .replace(/Â¿/g, '¿')
              .replace(/Â¡/g, '¡');
}
