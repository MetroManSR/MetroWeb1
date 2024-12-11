/**
 * Gets related words by root.
 *
 * @param {string} morph - The morph string of the current word.
 * @param {Array} allRows - The array of all dictionary rows.
 * @returns {Array} - The array of related words.
 */

export async function getRelatedWordsByRoot(allRows) {
        // Calculate related words and derivative roots
    
        
    allRows.forEach(clnrow => {
        let relatedWords = [];
        console.log(typeof clnrow.morph);
        console.log(clnrow)

        if (clnrow.morph) {
            clnrow.morph = clnrow.morph.split(clnrow.morph, ", ").map(i => i.trim());
        } 
        if (clnrow.morph) {
            clnrow.morph.forEach(mrphIt => {
                console.log(mrphIt)
                if (mrphIt) {
                    // Logic for root type
                    if (clnrow.type === 'root') {
                        const matchingRoots = allRows.filter(r => {
                            if (r.morph && r.type !== 'root') {
                                return r.morph.some(item => item.title.toLowerCase() === mrphIt.title.toLowerCase());
                            }
                            return false;
                        });
                        console.log(`Matching Roots for: ${clnrow.title} - ${matchingRoots}`)
                        relatedWords.push(...matchingRoots.map(r => `<a href="?wordid=${r.id}" style="color: green;">${r.title}</a>`));
                    }
                    // Logic for word type
                    else if (clnrow.type === 'word') {
                        const matchingWords = allRows.filter(r => {
                            if (r.morph && r.type === 'root') {
                                return r.morph.some(item => item.title.toLowerCase() === mrphIt.title.toLowerCase());
                            }
                            return false;
                        });

                        console.log(`Matching Words for: ${clnrow.title} - ${matchingWords}`)
                        relatedWords.push(...matchingWords.map(r => `<a href="?rootid=${r.id}" style="color: green;">${r.title}</a>`));
                    }
                }
            });
        }

        allRows.related = relatedWords.join(', ');
        
    });

    return allRows;

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
