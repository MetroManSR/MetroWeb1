export function cleanData(data, type) {
    //console.log('Cleaning data for type:', type);
    return data.map((row, index) => {
        //console.log('Original row:', row);
        
        const cleanedRow = {
            id: row.id || index, // Assign unique ID if missing
            type: type, // Identification of type (root or word)
            title: sanitizeHTML(row.title ? row.title.trim() : ''), // Original root or word
            partofspeech: sanitizeHTML(type === 'root' ? '' : row.partofspeech ? row.partofspeech.trim() : ''), // Empty for roots
            meta: sanitizeHTML(row.meta ? row.meta.trim() : ''), // Translation to Spanish or English
            notes: sanitizeHTML(row.notes ? row.notes.trim() : ''), // Any notes left
            morph: sanitizeHTML(row.morph ? row.morph.trim() : '') // Etymology for roots, part of speech for words
        };

        //console.log('Cleaned row:', cleanedRow);
        return cleanedRow;
    });
}

export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
