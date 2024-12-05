export async function fetchData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.text();
        return parseCSV(data);
    } catch (error) {
        console.error('Error loading CSV file:', error);
    }
}

function parseCSV(data) {
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

        const row = {
            id: i + 1, // Assign a unique ID starting from 1
            word: sanitizeHTML(columns[0]),
            partOfSpeech: sanitizeHTML(columns[1]),
            definition: sanitizeHTML(columns[2]),
            explanation: sanitizeHTML(columns[3]),
            etymology: sanitizeHTML(columns[4])
        };
        rows.push(row);
    }
    return rows;
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
