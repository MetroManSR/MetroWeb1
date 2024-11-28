function fetchDefinition(event) {
    event.preventDefault();
    const word = document.getElementById('word').value.toLowerCase();
    fetch('../dictionary.csv')
        .then(response => response.text())
        .then(data => {
            Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    const dictionary = {};
                    results.data.forEach(row => {
                        const [word, definition] = Object.values(row);
                        dictionary[word.trim().toLowerCase()] = definition.trim();
                    });
                    displayDefinition(dictionary, word);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching definition:', error);
        });
}

function displayDefinition(dictionary, word) {
    const definitionDiv = document.getElementById('definition');
    const definition = dictionary[word];
    if (definition) {
        definitionDiv.textContent = `${word}: ${definition}`;
    } else {
        definitionDiv.textContent = 'Word not found';
    }
}
