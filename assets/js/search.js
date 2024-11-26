document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const content = document.getElementById('content');

    searchButton.addEventListener('click', () => {
        const searchText = searchInput.value.toLowerCase();
        const paragraphs = content.getElementsByTagName('p');

        for (let p of paragraphs) {
            const text = p.textContent.toLowerCase();
            if (text.includes(searchText)) {
                p.style.backgroundColor = 'yellow';
            } else {
                p.style.backgroundColor = '';
            }
        }
    });
});
