export function getRelatedWordsByRoot(word, morph, allRows) {
    const morphRoots = morph.split(',').map(root => root.trim().toLowerCase());
    const relatedWords = allRows.filter(row => {
        const rowMorphs = row.morph.split(',').map(root => root.trim().toLowerCase());
        return morphRoots.some(root => rowMorphs.includes(root)) && row.title.toLowerCase() !== word.toLowerCase();
    });

    const relatedWordsList = relatedWords.map(row => `<a href="?wordid=${row.id}">${row.title}</a>`).join(', ');
    const relatedWordsCount = relatedWords.length;

    return {
        count: relatedWordsCount,
        list: relatedWordsList
    };
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
