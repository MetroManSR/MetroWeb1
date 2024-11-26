function searchAndScrollTable() {
    const searchInput = document.getElementById('search-input');
    const contentTable = document.getElementById('content-table');
    const searchText = searchInput.value.toLowerCase();
    const cells = contentTable.getElementsByTagName('td');
    let firstMatch = null;

    for (let cell of cells) {
        const text = cell.textContent.toLowerCase();
        if (text.includes(searchText)) {
            cell.style.backgroundColor = 'yellow';
            if (!firstMatch) {
                firstMatch = cell;
            }
        } else {
            cell.style.backgroundColor = '';
        }
    }

    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        alert('No matches found');
    }
}
