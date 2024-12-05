export function calculateSimilarity(a, b) {
    const lengthA = a.length;
    const lengthB = b.length;
    const d = [];

    for (let i = 0; i <= lengthA; i++) {
        d[i] = [i];
    }

    for (let j = 0; i <= lengthB; j++) {
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


export function getRelatedWords(word, allRows) {
    const relatedWords = allRows
        .filter(row => calculateSimilarity(word, row.word) >= 90 && row.word.toLowerCase() !== word.toLowerCase())
        .slice(0, 10)
        .map(row => `<a href="?search=${row.word}&id=${row.id}">${row.word}</a>`)
        .join(', ');

    return relatedWords ? relatedWords : null;
}
