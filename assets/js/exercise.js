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
    button.style.backgroundColor = '#FFD700';
    button.style.border = '2px solid #FFD700';
    button.style.borderRadius = '15px';
    button.style.padding = '5px 10px';
    button.style.marginTop = '10px';
    button.style.cursor = 'pointer';
    button.onclick = function() { validateAnswer(dropdown, correctAnswer, feedback, language, exerciseBox); };
    
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
    feedback.style.fontWeight = 'bold';
    feedback.style.fontFamily = 'Arial, sans-serif';
    feedback.style.marginTop = '10px';
    feedback.style.padding = '5px 10px';
    feedback.style.borderRadius = '15px';
    exerciseBox.appendChild(feedback);
}

function validateAnswer(dropdown, correctAnswer, feedback, language, exerciseBox) {
    const selectedValue = dropdown.value;

    if (selectedValue === "") {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.color = 'red';
        exerciseBox.style.backgroundColor = '#f0f0f0';
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

    // Create and set up the question
    const questionElement = document.createElement('p');
    questionElement.textContent = question;
    
    // Create a container for the multiple-choice options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.marginTop = '10px';
    optionsContainer.style.marginBottom = '20px';

    // Populate the multiple-choice options
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
        label.style.marginLeft = '5px';
        label.style.cursor = 'pointer';
        
        optionContainer.appendChild(radio);
        optionContainer.appendChild(label);
        optionsContainer.appendChild(optionContainer);
    });

    // Create and set up the submit button
    const button = document.createElement('button');
    button.textContent = language === 'es' ? 'Enviar respuesta' : 'Submit Answer';
    button.style.backgroundColor = '#FFD700';
    button.style.border = '2px solid #FFD700';
    button.style.borderRadius = '15px';
    button.style.padding = '5px 10px';
    button.style.cursor = 'pointer';
    button.onclick = function() { validateMultipleChoice(correctAnswer, feedback, language, containerId); };

    // Create a container for the question, options, and the button
    const exerciseBox = document.createElement('div');
    exerciseBox.style.backgroundColor = '#f0f0f0';
    exerciseBox.style.border = '2px solid #888888';
    exerciseBox.style.borderRadius = '15px';
    exerciseBox.style.padding = '10px';
    exerciseBox.style.marginBottom = '20px';

    exerciseBox.appendChild(questionElement);
    exerciseBox.appendChild(optionsContainer);
    exerciseBox.appendChild(button);

    // Append the exercise box to the main container
    container.appendChild(exerciseBox);

    // Create feedback paragraph
    const feedback = document.createElement('p');
    feedback.style.fontWeight = 'bold';
    feedback.style.fontFamily = 'Arial, sans-serif';
    feedback.style.marginTop = '10px';
    feedback.style.padding = '5px 10px';
    feedback.style.borderRadius = '15px';
    exerciseBox.appendChild(feedback);
}

function validateMultipleChoice(correctAnswer, feedback, language, containerId) {
    const selectedOption = document.querySelector(`input[name="${containerId}-options"]:checked`);
    const exerciseBox = document.getElementById(containerId).firstElementChild;

    if (!selectedOption) {
        feedback.textContent = language === 'es' ? 'Por favor, seleccione una respuesta.' : 'Please select an answer.';
        feedback.style.color = 'red';
        exerciseBox.style.backgroundColor = '#f0f0f0';
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
