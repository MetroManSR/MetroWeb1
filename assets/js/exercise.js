function generateExercise(containerId, sentences, correctAnswers, options, language) {
    const container = document.getElementById(containerId);

    // If sentences and correctAnswers are arrays, pick one randomly
    let sentence, correctAnswer;
    if (Array.isArray(sentences) && Array.isArray(correctAnswers)) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        sentence = sentences[randomIndex];
        correctAnswer = correctAnswers[randomIndex];
    } else {
        sentence = sentences;
        correctAnswer = correctAnswers;
    }

    // Ensure options is an array
    if (!Array.isArray(options)) {
        console.error('Options should be an array.');
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

function generateMultipleChoice(containerId, question, options, correctAnswer, language) {
    const container = document.getElementById(containerId);

    // Ensure options is an array
    if (!Array.isArray(options)) {
        console.error('Options should be an array.');
        return;
    }

    const questionElement = document.createElement('p');
    questionElement.textContent = question;

    const optionsContainer = document.createElement('div');
    optionsContainer.style.marginTop = '10px';
    optionsContainer.style.marginBottom = '20px';

    options.forEach((option, index) => {
        const optionContainer = document.createElement('div');
        optionContainer.style.marginBottom = '5px';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `${containerId}-option-${index}`;
        radio.name = `${containerId}-options`;
        radio.value = option;

        const label = document.createElement('label');
        label.textContent = option;
        label.htmlFor = radio.id;
        label.className = 'radio-label';

        optionContainer.appendChild(radio);
        optionContainer.appendChild(label);
        optionsContainer.appendChild(optionContainer);
    });

    const button = document.createElement('button');
    button.textContent = language === 'es' ? 'Enviar respuesta' : 'Submit Answer';
    button.onclick = function() { validateMultipleChoice(correctAnswer, feedback, language, containerId); };

    const exerciseBox = document.createElement('div');
    exerciseBox.className = 'exercise-box';
    button.className = 'button';

    exerciseBox.appendChild(questionElement);
    exerciseBox.appendChild(optionsContainer);
    exerciseBox.appendChild(button);

    container.appendChild(exerciseBox);

    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    exerciseBox.appendChild(feedback);
}

function validateMultipleChoice(correctAnswer, feedback, language, containerId) {
    const selectedOption = document.querySelector(`input[name="${containerId}-options"]:checked`);
    const exerciseBox = document.getElementById(containerId).firstElementChild;

    if (!selectedOption) {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.color = 'red';
        exerciseBox.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--exercise-bg-light');
    } else if (selectedOption.value === correctAnswer) {
        feedback.textContent = language === 'es' ? '¡Correcto!' : 'Correct!';
        feedback.style.color = 'white';
        exerciseBox.style.backgroundColor = 'green';
    } else {
        feedback.textContent = language === 'es' ? 'Incorrecto. Inténtalo de nuevo.' : 'Incorrect. Try again.';
        feedback.style.color = 'white';
        exerciseBox.style.backgroundColor = 'red';
    }
}
