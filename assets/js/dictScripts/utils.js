export function getRelatedWordsByRoot(word, etymology, allRows) {
    const etymologyRoots = etymology.split(',').map(root => root.trim().toLowerCase());
    const relatedWords = allRows.filter(row => {
        const rowRoots = row.etymology.split(',').map(root => root.trim().toLowerCase());
        return etymologyRoots.every(root => rowRoots.includes(root)) && row.word.toLowerCase() !== word.toLowerCase();
    });

    const relatedWordsList = relatedWords.map(row => `<a href="?wordid=${row.id}">${row.word}</a>`).join(', ');
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
    return data.filter(row => row.word && row.definition).map((row, index) => ({
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
