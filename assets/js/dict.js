function fetchDefinition(event) {
    const definitionDiv = document.getElementById('definition')
    definitionDiv.textContent = "Cargando..."
    event.preventDefault();
    const word = document.getElementById('word').value.toLowerCase();
    definitionDiv.textContent = "Cargando Diccionario..."
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
            definitionDiv.textContent = `Error... ${error}`
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
