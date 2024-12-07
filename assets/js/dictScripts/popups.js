export function openPopup(popupId, overlayId) {
    document.getElementById(popupId).classList.add('active');
    document.getElementById(overlayId).classList.add('active');
}

export function closePopup(popupId, overlayId) {
    document.getElementById(popupId).classList.remove('active');
    document.getElementById(overlayId).classList.remove('active');
}

export function displayStatistics(rows) {
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

    openPopup('statistics', 'statistics-popup-overlay');

    document.getElementById('close-statistics-button').addEventListener('click', () => {
        closePopup('statistics', 'statistics-popup-overlay');
    });
}
