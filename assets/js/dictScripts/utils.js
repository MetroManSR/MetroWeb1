export function getRelatedWordsByRoot(word, etymology, allRows) {
    const etymologyRoots = etymology.split(',').map(root => root.trim().toLowerCase());
    const relatedWords = allRows.filter(row => {
        const rowRoots = row.etymology.split(',').map(root => root.trim().toLowerCase());
        return etymologyRoots.some(root => rowRoots.includes(root)) && row.word.toLowerCase() !== word.toLowerCase();
    });

    const relatedWordsList = relatedWords.map(row => `<a href="?search=${row.word}&id=${row.id}">${row.word}</a>`).join(', ');
    const relatedWordsCount = relatedWords.length;

    return {
        count: relatedWordsCount,
        list: relatedWordsList
    };
} 
