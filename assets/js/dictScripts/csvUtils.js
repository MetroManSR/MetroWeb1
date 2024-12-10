export function cleanData(data, type) {
    return data.map((row, index) => {
        const cleanedRow = {
            id: row.id || index, // Assign unique ID if missing
            type: type, // Identification of type (root or word)
            title: sanitizeHTML(row.word ? row.word.trim() : ''), // Original root or word
            meta: sanitizeHTML(row.translation ? row.translation.trim() : ''), // Translation to Spanish or English
            notes: sanitizeHTML(row.notes ? row.notes.trim() : ''), // Any notes left
            morph: sanitizeHTML(type === 'root' ? (row.etymology ? row.etymology.trim() : '') : (row.partOfSpeech ? row.partOfSpeech.trim() : '')) // Etymology for roots, part of speech for words
        };

        return cleanedRow;
    });
}

export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
