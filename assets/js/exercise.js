function generateExercise(sentence, options, correctAnswer, language) {
    console.log('Generating exercise...');
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

    // Append sentence to the container
    container.appendChild(sentenceElement);

    // Create and set up the submit button
    const button = document.createElement('button');
    button.textContent = language === 'es' ? 'Enviar respuesta' : 'Submit Answer';
    button.onclick = function() { validateAnswer(correctAnswer, language); };
    container.appendChild(button);

    // Create feedback paragraph
    const feedback = document.createElement('p');
    feedback.id = 'feedback';
    container.appendChild(feedback);

    console.log('Exercise generated successfully');
}

function validateAnswer(correctAnswer, language) {
    const dropdown = document.getElementById('suffixDropdown');
    const selectedValue = dropdown.value;
    const feedback = document.getElementById('feedback');

    if (selectedValue === "") {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.color = 'red';
    } else if (selectedValue === correctAnswer) {
        feedback.textContent = language === 'es' ? '¡Correcto!' : 'Correct!';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = language === 'es' ? 'Incorrecto. Inténtalo de nuevo.' : 'Incorrect. Try again.';
        feedback.style.color = 'red';
    }
}
