export async function fetchData(filePath, type) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.text();
        return parseCSV(data, type);
    } catch (error) {
        console.error('Error loading CSV file:', error);
    }
}

function parseCSV(data, type) {
    const rows = [];
    const lines = data.split('\n').slice(1); // Remove the header row
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const columns = [];
        let col = '', inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                columns.push(col.trim());
                col = '';
            } else {
                col += char;
            }
        }
        columns.push(col.trim()); // Push the last column

        let row;
        if (type === 'root') {
            // Process as root
            const raw = columns[0] || '';
            const [root, rest] = raw.split(' = ');
            const [translation, meta] = rest ? rest.split(' (') : ['', ''];
            const [notes, origin] = meta ? meta.slice(0, -1).split(', ') : ['', ''];

            row = {
                id: i + 1, // Assign a unique ID starting from 1
                word: sanitizeHTML(root ? root.trim() : ''),
                translation: sanitizeHTML(translation ? translation.trim() : ''),
                notes: sanitizeHTML(notes ? notes.trim() : ''),
                etymology: sanitizeHTML(origin ? origin.trim() : ''),
                type: 'root'
            };
        } else {
            // Process as word
            row = {
                id: i + 1, // Assign a unique ID starting from 1
                word: sanitizeHTML(columns[0]),
                partOfSpeech: sanitizeHTML(columns[1]),
                definition: sanitizeHTML(columns[2]),
                explanation: sanitizeHTML(columns[3]),
                etymology: sanitizeHTML(columns[4]),
                type: 'word'
            };
        }

        rows.push(row);
    }
    return rows;
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
