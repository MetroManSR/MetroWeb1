export function displayWarning(elementId, message) {
    const warningElement = document.getElementById(elementId);
    warningElement.textContent = message;
    setTimeout(() => {
        warningElement.textContent = '';
    }, 3000);
}
