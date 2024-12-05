export function calculateSimilarity(a, b) {
    const lengthA = a.length;
    const lengthB = b.length;
    const d = [];

    for (let i = 0; i <= lengthA; i++) {
        d[i] = [i];
    }

    for (let j = 0; j <= lengthB; j++) {
        d[0][j] = j;
    }

    for (let i = 1; i <= lengthA; i++) {
        for (let j = 1; j <= lengthB; j++) {
            if (a[i - 1] === b[j - 1]) {
                d[i][j] = d[i - 1][j - 1];
            } else {
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
            }
        }
    }

    return (1 - (d[lengthA][lengthB] / Math.max(lengthA, lengthB))) * 100;
}

export function displayRelatedWords(word, allRows) {
    const relatedWordsContainer = document.createElement('div');
    relatedWordsContainer.className = 'related-words';
    const relatedWordsTitle = document.createElement('h3');
    relatedWordsTitle.textContent = 'Related Words:';
    relatedWordsContainer.appendChild(relatedWordsTitle);

    const relatedWordsList = document.createElement('ul');
    let count = 0;

    allRows.forEach(row => {
        const similarity = calculateSimilarity(word, row.word);
        if (similarity >= 90 && row.word.toLowerCase() !== word.toLowerCase() && count < 10) {
            const relatedWordItem = document.createElement('li');
            relatedWordItem.innerHTML = `<a href="?search=${row.word}&id=${row.id}">${row.word}</a>`;
            relatedWordsList.appendChild(relatedWordItem);
            count++;
        }
    });

    relatedWordsContainer.appendChild(relatedWordsList);
    const dictionaryContainer = document.getElementById('dictionary');
    dictionaryContainer.appendChild(relatedWordsContainer);
}
