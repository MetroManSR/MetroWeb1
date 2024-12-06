export function getRelatedWordsByRoot(word, etymology, allRows) {
    const etymologyRoots = etymology.split(',').map(root => root.trim().toLowerCase());
    const relatedWords = allRows.filter(row => {
        const rowRoots = row.etymology.split(',').map(root => root.trim().toLowerCase());
        return etymologyRoots.every(root => rowRoots.includes(root)) && row.word.toLowerCase() !== word.toLowerCase();
    });

    const relatedWordsList = relatedWords.map(row => `<a href="?dictionaryid=${row.id}">${row.word}</a>`).join(', ');
    const relatedWordsCount = relatedWords.length;

    return {
        count: relatedWordsCount,
        list: relatedWordsList
    };
}

export function highlight(text, term) {
    if (!text) return '';
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}
