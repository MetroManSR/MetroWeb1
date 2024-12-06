export function cleanData(data, type) {
    return data.map((row, index) => {
        console.log(`Cleaning row ${index + 1}:`, row);

        if (type === 'root') {
            const r = row.word || '';
            let root = row.word || '';
            let rest = '';
            let translation = row.translation || '';
            let notes = row.notes || '';
            let origin = row.etimology || '';

            const cleanedRow = {
                id: row.id || index, // Assign unique ID if missing
                word: sanitizeHTML(root ? root.trim() : ''),
                definition: sanitizeHTML(translation ? translation.trim() : ''),
                explanation: sanitizeHTML(notes ? notes.trim() : ''),
                etymology: sanitizeHTML(origin ? origin.trim() : ''),
                type: 'root'
            };

            console.log('Cleaned root row:', cleanedRow);
            return cleanedRow;
        } else {
            const cleanedRow = {
                ...row,
                id: row.id || index, // Ensure ID is assigned
                word: sanitizeHTML(row.word ? row.word.trim() : ''),
                partOfSpeech: sanitizeHTML(row.partOfSpeech ? row.partOfSpeech.trim() : ''),
                definition: sanitizeHTML(row.definition ? row.definition.trim() : ''),
                explanation: sanitizeHTML(row.explanation ? row.explanation.trim() : ''),
                etymology: sanitizeHTML(row.etymology ? row.etymology.trim() : ''),
                type: 'word'
            };

            console.log('Cleaned word row:', cleanedRow);
            return cleanedRow;
        }
    });
}

export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
