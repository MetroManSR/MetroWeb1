function generateExercise(containerId, sentence, options, correctAnswer, language) {
    const container = document.getElementById(containerId);

    // Ensure options is an array
    if (!Array.isArray(options)) {
        console.error('Options should be an array:', options);
        return;
    }

    // Create and set up the sentence with dropdown
    const sentenceParts = sentence.split('__');
    const sentenceElement = document.createElement('p');
    sentenceElement.innerHTML = `${sentenceParts[0]} <select class="suffixDropdown">
                                    <option value="">Select...</option>
                                  </select> ${sentenceParts[1]}`;

    // Populate dropdown options
    const dropdown = sentenceElement.querySelector('.suffixDropdown');
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdown.appendChild(optionElement);
    });

    // Create and set up the submit button
    const button = document.createElement('button');
    button.textContent = language === 'es' ? 'Enviar respuesta' : 'Submit Answer';
    button.onclick = function() { validateAnswer(dropdown, correctAnswer, feedback, language, exerciseBox); };

    // Create a container for the sentence and the button
    const exerciseBox = document.createElement('div');
    exerciseBox.className = 'exercise-box';
    dropdown.className = 'suffixDropdown';
    button.className = 'button';

    exerciseBox.appendChild(sentenceElement);
    exerciseBox.appendChild(button);
    container.appendChild(exerciseBox);

    // Create feedback paragraph
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    exerciseBox.appendChild(feedback);
}

function validateAnswer(dropdown, correctAnswer, feedback, language, exerciseBox) {
    const selectedValue = dropdown.value;

    if (selectedValue === "") {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.color = 'red';
        exerciseBox.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--exercise-bg-light');
    } else if (selectedValue === correctAnswer) {
        feedback.textContent = language === 'es' ? '¡Correcto!' : 'Correct!';
        feedback.style.color = 'white';
        exerciseBox.style.backgroundColor = 'green';
    } else {
        feedback.textContent = language === 'es' ? 'Incorrecto. Inténtalo de nuevo.' : 'Incorrect. Try again.';
        feedback.style.color = 'white';
        exerciseBox.style.backgroundColor = 'red';
    }
}
