function generateExercise(sentence, options, correctAnswer) {
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
    button.textContent = 'Submit Answer';
    button.onclick = function() { validateAnswer(correctAnswer); };
    container.appendChild(button);

    // Create feedback paragraph
    const feedback = document.createElement('p');
    feedback.id = 'feedback';
    container.appendChild(feedback);
}

function validateAnswer(correctAnswer) {
    const dropdown = document.getElementById('suffixDropdown');
    const selectedValue = dropdown.value;
    const feedback = document.getElementById('feedback');

    if (selectedValue === correctAnswer) {
        feedback.textContent = 'Correct!';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = 'Incorrect. Try again.';
        feedback.style.color = 'red';
    }
}
