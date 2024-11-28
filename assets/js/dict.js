function fetchDefinition(event) {
            event.preventDefault();
            const searchTerm = document.getElementById('word').value.toLowerCase();
            fetch('../dictionary.csv')
                .then(response => response.text())
                .then(data => {
                    Papa.parse(data, {
                        delimiter: '=',
                        complete: function(results) {
                            const dictionary = {};
                            results.data.forEach(row => {
                                const [word, definition] = row;
                                if (word && definition) {
                                    dictionary[word.trim().toLowerCase()] = definition.trim();
                                }
                            });
                            displayMatches(dictionary, searchTerm);
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching definition:', error);
                });
        }

function displayMatches(dictionary, searchTerm) {
            const definitionDiv = document.getElementById('definition');
            definitionDiv.innerHTML = ''; // Clear previous results
            const matches = [];
            for (const [word, definition] of Object.entries(dictionary)) {
                definitionDiv.textContent = `${word}: ${definition}`
                if (word.includes(searchTerm) || definition.includes(searchTerm)) {
                    matches.push(`${word}: ${definition}`);
                }
            }
            if (matches.length > 0) {
                definitionDiv.innerHTML = matches.join('<br>');
            } else {
                definitionDiv.textContent = 'No matches found';
            }
        }
