function searchAndScroll() {
    const searchInput = document.getElementById('search-input');
    const content = document.getElementById('content');
    const searchText = searchInput.value.toLowerCase();
    const paragraphs = content.getElementsByTagName('p');
    let firstMatch = null;

    for (let p of paragraphs) {
        const text = p.textContent.toLowerCase();
        if (text.includes(searchText)) {
            p.style.backgroundColor = 'yellow';
            if (!firstMatch) {
                firstMatch = p;
            }
        } else {
            p.style.backgroundColor = '';
        }
    }

    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        alert('No matches found');
    }
}
