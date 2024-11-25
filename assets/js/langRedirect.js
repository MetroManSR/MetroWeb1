function redirect() {
    // Get the current path
    let path = window.location.pathname;

    // Add "en/" at the beginning of the path
    let newPath = 'en/' + path;

    // Construct the new URL
    let newUrl = window.location.origin + newPath;

    // Redirect to the new URL
    window.location.href = newUrl;
}
