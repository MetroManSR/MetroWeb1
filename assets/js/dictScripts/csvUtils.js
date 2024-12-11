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

    // Initial fake increment
    for (let i = 0; i <= 10; i++) {
        progressBar.style.width = `${i}%`;
        progressText.textContent = `Preparing... ${i}%`;
        await new Promise(resolve => setTimeout(resolve, 5)); // Fast initial fake progress
    }

    // List of IDs needing character fixing
    const idsNeedingFixing = data
        .map((row, index) => ({
            id: index,
            needsFixing: /Ã|Â/.test(row.col1 || '') || /Ã|Â/.test(row.col2 || '') || /Ã|Â/.test(row.col3 || '') || /Ã|Â/.test(row.col4 || '') || /Ã|Â/.test(row.col5 || '')
        }))
        .filter(row => row.needsFixing)
        .map(row => row.id);

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
            morph: '', // Initialize morph
            related: ''
        };

        if (type === 'word') {
            cleanedRow.title = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(row.col1 ? row.col1.trim() : '') : row.col1 ? row.col1.trim() : ''); // X title for words
            cleanedRow.partofspeech = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(row.col2 ? row.col2.trim() : '') : row.col2 ? row.col2.trim() : ''); // Part of Speech for words
            cleanedRow.meta = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(row.col3 ? row.col3.trim() : '') : row.col3 ? row.col3.trim() : ''); // Meta for words
            cleanedRow.notes = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(row.col4 ? row.col4.trim() : '') : row.col4 ? row.col4.trim() : ''); // Notes for words
            cleanedRow.morph = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(row.col5 ? row.col5.trim() : '') : row.col5 ? row.col5.trim() : ''); // Morph for words
        } else if (type === 'root') {
            const rawTitle = row.col1 ? row.col1.trim() : '';
            const [root, rest] = rawTitle.split(' = ');
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            const [notes, morph] = meta ? meta.slice(0, -1).split(', del ') : ['', ''];

            cleanedRow.title = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(root ? root.trim() : '') : root ? root.trim() : ''); // X title for roots
            cleanedRow.meta = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(translation ? translation.trim() : '') : translation ? translation.trim() : ''); // Y meta for roots
            cleanedRow.notes = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(notes ? notes.trim() : '') : notes ? notes.trim() : ''); // A notes for roots
            cleanedRow.morph = sanitizeHTML(idsNeedingFixing.includes(index) ? fixEncoding(morph ? morph.trim() : '') : morph ? morph.trim() : ''); // B morph for roots
        }

        // Check for anomalies (missing title or meta)
        if (!cleanedRow.title || !cleanedRow.meta) {
            anomalies.push({ id: cleanedRow.id, title: cleanedRow.title, meta: cleanedRow.meta });
        }

        cleanedData.push(cleanedRow);

        // Update real progress bar in whole percentage increments
        if ((index + 1) % increment === 0 || index === totalRows - 1) { // Update at each 10% step and at the end
            const progress = Math.min(Math.floor(((index + 1) / totalRows) * 100), 100); // Limit progress to 100%
            progressBar.style.width = `${progress}%`;
            progressBar.style.display = 'block'; // Ensure the progress bar is visible
            progressText.textContent = `Parsed ${progress}%`;

            // Force reflow to update the progress bar
            progressBar.offsetWidth; // Trigger a reflow

            // Yield control to render the progress bar
            await new Promise(resolve => setTimeout(resolve, 1)); // Add a delay to ensure progress bar update
        }
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
    console.log(cleanedData)
   
    // Calculate related words and derivative roots
    cleanedData.forEach(clnrow => {
        let relatedWords = [];
        console.log(typeof clnrow.morph);
        console.log(clnrow)
        
        if (cleanedRow.morph && typeof clnrow.morph !== 'string') {
            cleanedRow.morph.forEach(morphItem => {
                console.log(morphItem.morph)
                if (morphItem && morphItem.title) {
                    // Logic for root type
                    if (cleanedRow.type === 'root') {
                        const matchingRoots = cleanedData.filter(r => {
                            if (r.morph && r.type !== 'root') {
                                return r.morph.some(item => item.title.toLowerCase() === morphItem.title.toLowerCase());
                            }
                            return false;
                        });
                        relatedWords.push(...matchingRoots.map(r => `<a href="?wordid=${r.id}" style="color: green;">${r.title}</a>`));
                    }
                    // Logic for word type
                    else if (clnrow.type === 'word') {
                        const matchingWords = cleanedData.filter(r => {
                            if (r.morph && r.type === 'root') {
                                return r.morph.some(item => item.title.toLowerCase() === morphItem.title.toLowerCase());
                            }
                            return false;
                        });
                        relatedWords.push(...matchingWords.map(r => `<a href="?rootid=${r.id}" style="color: green;">${r.title}</a>`));
                    }
                }
            });
        }

        cleanedRow.related = relatedWords.join(', ');
        console.log(relatedWords)
    });

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
