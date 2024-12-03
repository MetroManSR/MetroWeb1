function generateExercise(sentence, options, correctAnswer, language) {
    const container = document.getElementById('exerciseContainer');

    // Create and set up the sentence with dropdown
    const sentenceParts = sentence.split('__');
    const sentenceElement = document.createElement('p');
    sentenceElement.innerHTML = `${sentenceParts[0]} <select id="suffixDropdown">
                                    <option value="">Select...</option>
                                  </select> ${sentenceParts[1]}`;
    
    // Populate dropdown options
    const dropdown = sentenceElement.querySelector('#suffixDropdown');
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdown.appendChild(optionElement);
    });

    // Create and set up the submit button
    const button = document.createElement('button');
    button.textContent = language === 'es' ? 'Enviar respuesta' : 'Submit Answer';
    button.style.backgroundColor = '#FFD700';
    button.style.border = '2px solid #FFD700';
    button.style.borderRadius = '15px';
    button.style.padding = '5px 10px';
    button.style.marginTop = '10px';
    button.style.cursor = 'pointer';
    button.onclick = function() { validateAnswer(correctAnswer, language); };
    
    // Create a container for the sentence and the button
    const exerciseBox = document.createElement('div');
    exerciseBox.style.backgroundColor = '#f0f0f0';
    exerciseBox.style.border = '2px solid #888888';
    exerciseBox.style.borderRadius = '15px';
    exerciseBox.style.padding = '10px';
    exerciseBox.style.marginBottom = '20px';
    
    // Style the dropdown
    dropdown.style.backgroundColor = '#d1ffd1';
    dropdown.style.border = '1px solid #008000';
    dropdown.style.borderRadius = '15px';

    exerciseBox.appendChild(sentenceElement);
    exerciseBox.appendChild(button);
    
    // Append the exercise box to the main container
    container.appendChild(exerciseBox);

    // Create feedback paragraph
    const feedback = document.createElement('p');
    feedback.id = 'feedback';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontFamily = 'Arial, sans-serif';
    feedback.style.marginTop = '10px';
    feedback.style.padding = '5px 10px';
    feedback.style.borderRadius = '15px';
    exerciseBox.appendChild(feedback);
}

function validateAnswer(correctAnswer, language) {
    const dropdown = document.getElementById('suffixDropdown');
    const selectedValue = dropdown.value;
    const feedback = document.getElementById('feedback');

    if (selectedValue === "") {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.backgroundColor = '#f0f0f0';
        feedback.style.color = 'red';
    } else if (selectedValue === correctAnswer) {
        feedback.textContent = language === 'es' ? '¡Correcto!' : 'Correct!';
        feedback.style.backgroundColor = 'green';
        feedback.style.color = 'white';
    } else {
        feedback.textContent = language === 'es' ? 'Incorrecto. Inténtalo de nuevo.' : 'Incorrect. Try again.';
        feedback.style.backgroundColor = 'red';
        feedback.style.color = 'white';
    }
}
