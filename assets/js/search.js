let currentMatchIndex = -1;
let matches = [];

function searchAndHighlightTable() {
    const searchInput = document.getElementById('search-input');
    const contentTable = document.getElementById('content-table');
    const searchText = searchInput.value.toLowerCase();
    const cells = contentTable.getElementsByTagName('td');
    const nextButton = document.getElementById('next-button');
    const previousButton = document.getElementById('previous-button');

    // Clear previous highlights and matches
    matches = [];
    currentMatchIndex = -1;
    for (let cell of cells) {
        cell.style.backgroundColor = '';
        cell.style.border = '';
    }

    // Find matches and highlight them
    for (let cell of cells) {
        const text = cell.textContent.toLowerCase();
        if (text.includes(searchText)) {
            cell.style.backgroundColor = 'yellow';
            matches.push(cell);
        }
    }

    // Check for matches and scroll to the first one
    if (matches.length > 0) {
        currentMatchIndex = 0;
        highlightCurrentMatch();
        nextButton.style.display = 'inline';  // Show the "Next" button
        previousButton.style.display = 'inline';  // Show the "Previous" button
    } else {
        nextButton.style.display = 'none';  // Hide the "Next" button if no matches found
        previousButton.style.display = 'none';  // Hide the "Previous" button if no matches found
        alert('No matches found');
    }
}

function nextMatch() {
    if (matches.length === 0) {
        alert('No matches found');
        return;
    }

    // Remove highlight from the current match
    matches[currentMatchIndex].style.backgroundColor = 'yellow';
    matches[currentMatchIndex].style.border = '';

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;

    // Highlight the new current match
    highlightCurrentMatch();
}

function previousMatch() {
    if (matches.length === 0) {
        alert('No matches found');
        return;
    }

    // Remove highlight from the current match
    matches[currentMatchIndex].style.backgroundColor = 'yellow';
    matches[currentMatchIndex].style.border = '';

    currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;

    // Highlight the new current match
    highlightCurrentMatch();
}

function highlightCurrentMatch() {
    const currentMatch = matches[currentMatchIndex];
    currentMatch.style.backgroundColor = 'orange';
    currentMatch.style.border = '2px solid red';
    currentMatch.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let currentMatchIndex1 = -1;
let matches1 = [];

function searchAndHighlightMarkdownTable1() {
    const searchInput1 = document.getElementById('search-input1');
    const contentTable1 = document.getElementById('content-table1');
    const searchText1 = searchInput1.value.toLowerCase();
    const rows1 = contentTable1.getElementsByTagName('tr');
    const nextButton1 = document.getElementById('next-button1');
    const previousButton1 = document.getElementById('previous-button1');

    // Clear previous highlights and matches
    matches1 = [];
    currentMatchIndex1 = -1;
    for (let row1 of rows1) {
        for (let cell1 of row1.cells) {
            cell1.style.backgroundColor = '';
            cell1.style.border = '';
        }
    }

    // Find matches and highlight them
    for (let row1 of rows1) {
        for (let cell1 of row1.cells) {
            const text1 = cell1.textContent.toLowerCase();
            if (text1.includes(searchText1)) {
                cell1.style.backgroundColor = 'yellow';
                matches1.push(cell1);
            }
        }
    }

    // Check for matches and scroll to the first one
    if (matches1.length > 0) {
        currentMatchIndex1 = 0;
        highlightCurrentMatch1();
        nextButton1.style.display = 'inline';  // Show the "Next" button
        previousButton1.style.display = 'inline';  // Show the "Previous" button
    } else {
        nextButton1.style.display = 'none';  // Hide the "Next" button if no matches found
        previousButton1.style.display = 'none';  // Hide the "Previous" button if no matches found
        alert('No matches found');
    }
}

function nextMatch1() {
    if (matches1.length === 0) {
        alert('No matches found');
        return;
    }

    // Remove highlight from the current match
    matches1[currentMatchIndex1].style.backgroundColor = 'yellow';
    matches1[currentMatchIndex1].style.border = '';

    currentMatchIndex1 = (currentMatchIndex1 + 1) % matches1.length;

    // Highlight the new current match
    highlightCurrentMatch1();
}

function previousMatch1() {
    if (matches1.length === 0) {
        alert('No matches found');
        return;
    }

    // Remove highlight from the current match
    matches1[currentMatchIndex1].style.backgroundColor = 'yellow';
    matches1[currentMatchIndex1].style.border = '';

    currentMatchIndex1 = (currentMatchIndex1 - 1 + matches1.length) % matches1.length;

    // Highlight the new current match
    highlightCurrentMatch1();
}

function highlightCurrentMatch1() {
    const currentMatch1 = matches1[currentMatchIndex1];
    currentMatch1.style.backgroundColor = 'orange';
    currentMatch1.style.border = '2px solid red';
    currentMatch1.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
