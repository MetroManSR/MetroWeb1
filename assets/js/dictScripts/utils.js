/**
 * Gets related words by root.
 *
 * @param {string} morph - The morph string of the current word.
 * @param {Array} allRows - The array of all dictionary rows.
 * @returns {Array} - The array of related words.
 */
export function getRelatedWordsByRoot(morph, allRows) {
    if (typeof morph !== 'string') {
        return []; // Return an empty array if morph is not a string
    }

    const morphologies = morph.split(',').map(m => m.trim().toLowerCase());

    return allRows.filter(row => {
        if (row.type !== 'root' && row.morph) {
            const rowMorphs = row.morph.split(',').map(m => m.trim().toLowerCase());
            return morphologies.some(morph => rowMorphs.includes(morph));
        }
        return false;
    });
}

export function highlight(text, term) {
    if (!text || !term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

export function highlight(text, term) {
    if (!text || !term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Other utility functions
export function fetchData(file, type) {
    return new Promise((resolve, reject) => {
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                const parsedData = parseCSV(data);
                resolve(parsedData.map(row => ({
                    ...row,
                    type
                })));
            })
            .catch(error => {
                reject(error);
            });
    });
}

function parseCSV(data) {
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    return rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim();
            return obj;
        }, {});
    });
}

export function cleanData(data, type) {
    return data.filter(row => row.title && row.meta).map((row, index) => ({
        ...row,
        id: index + 1,
        type
    }));
}

export function sanitizeHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
}
