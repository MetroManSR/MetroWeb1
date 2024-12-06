// csvUtils.js

export function cleanData(data, type) {
    return data.map((row, index) => {
        console.log(`Cleaning row ${index + 1}:`, row);

        if (type === 'root') {
            const raw = row.word || '';
            let root = '';
            let rest = '';
            let translation = '';
            let notes = '';
            let origin = '';

            if (raw.includes(' = ')) {
                [root, rest] = raw.split(' = ');
            } else {
                root = raw;
                rest = '';
            }

            if (rest.includes(' (')) {
                [translation, rest] = rest.split(' (');
            } else {
                translation = rest;
            }

            if (rest.includes(', ')) {
                [notes, origin] = rest.slice(0, -1).split(', ');
            } else {
                notes = rest.slice(0, -1);
            }

            const cleanedRow = {
                id: row.id || index, // Assign unique ID if missing
                word: sanitizeHTML(root ? root.trim() : ''),
                definition: sanitizeHTML(translation ? translation.trim() : ''),
                notes: sanitizeHTML(notes ? notes.trim() : ''),
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
