export function initAdvancedSearchPopup() {
    document.getElementById('advanced-search-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.add('active');
        document.getElementById('popup-overlay').classList.add('active');
    });

    document.getElementById('close-popup-button').addEventListener('click', () => {
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    document.getElementById('apply-search-button').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        const searchIn = {
            word: document.getElementById('search-in-word').checked,
            root: document.getElementById('search-in-root').checked,
            definition: document.getElementById('search-in-definition').checked,
            etymology: document.getElementById('search-in-etymology').checked
        };
        const exactMatch = document.getElementById('exact-match').checked;

        filterAndDisplayWord(searchTerm, searchIn, exactMatch);
        document.getElementById('advanced-search-popup').classList.remove('active');
        document.getElementById('popup-overlay').classList.remove('active');
    });

    // Ensure all checkboxes are checked by default
    document.getElementById('search-in-word').checked = true;
    document.getElementById('search-in-root').checked = true;
    document.getElementById('search-in-definition').checked = true;
    document.getElementById('search-in-etymology').checked = true;
}

export function initStatisticsPopup(rows) {
    document.getElementById('view-statistics-button').addEventListener('click', () => {
        const totalWords = rows.filter(row => row.type === 'word').length;
        const totalRoots = rows.filter(row => row.type === 'root').length;

        const partOfSpeechCounts = rows.reduce((counts, row) => {
            if (row.type === 'word' && row.partOfSpeech) {
                counts[row.partOfSpeech] = (counts[row.partOfSpeech] || 0) + 1;
            }
            return counts;
        }, {});

        const statisticsContainer = document.getElementById('statistics');
        statisticsContainer.innerHTML = `
            <h3>Statistics</h3>
            <p>Total Words: ${totalWords}</p>
            <p>Total Roots: ${totalRoots}</p>
            <h4>Total Words per Part of Speech:</h4>
            <ul>
                ${Object.entries(partOfSpeechCounts).map(([pos, count]) => `<li>${pos}: ${count}</li>`).join('')}
            </ul>
            <button id="close-statistics-button" class="btn">Close</button>
        `;

        statisticsContainer.classList.add('active');
        document.getElementById('popup-overlay').classList.add('active');

        document.getElementById('close-statistics-button').addEventListener('click', () => {
            statisticsContainer.classList.remove('active');
            document.getElementById('popup-overlay').classList.remove('active');
        });
    });
}
