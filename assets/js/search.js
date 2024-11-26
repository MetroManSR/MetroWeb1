let currentMatchIndex = -1;
let matches = [];

function searchAndHighlightTable() {
    const searchInput = document.getElementById('search-input');
    const contentTable = document.getElementById('content-table');
    const searchText = searchInput.value.toLowerCase();
    const cells = contentTable.getElementsByTagName('td');
    const nextButton = document.getElementById('next-button');

    // Clear previous highlights and matches
    matches = [];
    currentMatchIndex = -1;
    for (let cell of cells) {
        cell.style.backgroundColor = '';
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
        matches[currentMatchIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        nextButton.style.display = 'inline';  // Show the "Next" button
    } else {
        nextButton.style.display = 'none';  // Hide the "Next" button if no matches found
        alert('No matches found');
    }
}

function nextMatch() {
    if (matches.length === 0) {
        alert('No matches found');
        return;
    }

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    matches[currentMatchIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
}
