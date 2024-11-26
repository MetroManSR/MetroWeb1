let currentMatchIndex = -1;
let matches = [];

function searchAndHighlightTable() {
    const searchInput = document.getElementById('search-input');
    const contentTable = document.getElementById('content-table');
    const searchText = searchInput.value.toLowerCase();
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
