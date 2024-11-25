function langRedirect(sourceLang) {
    // Get the current path
    let path = window.location.pathname;

    let newPath = "" 
    
    // Add "en/" at the beginning of the path
    if (sourceLang == "es") {
    
    newPath = '/en' + path;
   
    } else {

    newPath = path.replace("en/", "") 
     
    } 
    
    // Construct the new URL
    let newUrl = window.location.origin + newPath;

    // Redirect to the new URL
    window.location.href = newUrl;
}
