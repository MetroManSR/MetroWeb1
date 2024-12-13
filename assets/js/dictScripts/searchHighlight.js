export function highlight(text, term) {
    if (!text || !term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark style="background-color: yellow;">$1</mark>');
}
