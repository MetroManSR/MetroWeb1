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
            const [notes, origin] = meta ? meta.slice(0, -1).split(', et ') : ['', ''];

            row = {
                id: i + 1, // Assign a unique ID starting from 1
                type: 'root',
                title: sanitizeHTML(root ? root.trim() : ''),
                partofspeech: '', // Empty for roots
                meta: sanitizeHTML(translation ? translation.trim() : ''),
                notes: sanitizeHTML(notes ? notes.trim() : ''),
                morph: sanitizeHTML(origin ? origin.trim() : '')
            };
        } else {
            // Process as word
            row = {
                id: i + 1, // Assign a unique ID starting from 1
                type: 'word',
                title: sanitizeHTML(columns[0]),
                partofspeech: sanitizeHTML(columns[1]), // Part of speech
                meta: sanitizeHTML(columns[2]), // Translation or definition
                notes: sanitizeHTML(columns[3]),
                morph: sanitizeHTML(columns[4]), // Other relevant morphological info
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
