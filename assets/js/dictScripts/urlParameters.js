import { renderBox } from './boxes.js';

// Handle URL parameters
export async function initUrl(allRows, rowsPerPage, displayPage, currentPage, currentSortOrder) {
    try {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        const wordSpecificTerm = params.get('wordSpecific');
        const rootSpecificTerm = params.get('rootSpecific');

        if (searchTerm && searchTerm.trim()) {
            const criteria = { searchTerm: searchTerm.trim(), searchIn: { word: true, root: true, definition: true, etymology: false } };
            console.log(`Processing search term: ${criteria.searchTerm}`);
            const filteredRows = allRows.filter(row => {
                const normalizedTitle = row.title.toLowerCase();
                const normalizedMeta = row.meta.toLowerCase();
                const normalizedMorph = row.morph.map(morphItem => morphItem.toLowerCase()).join(' ');

                return (criteria.searchIn.word && normalizedTitle.includes(criteria.searchTerm.toLowerCase())) ||
                       (criteria.searchIn.root && row.type === 'root' && normalizedTitle.includes(criteria.searchTerm.toLowerCase())) ||
                       (criteria.searchIn.definition && normalizedMeta.includes(criteria.searchTerm.toLowerCase())) ||
                       (criteria.searchIn.etymology && normalizedMorph.includes(criteria.searchTerm.toLowerCase()));
            });
            return filteredRows; // Return filtered rows based on search term
        } else if (wordID && parseInt(wordID) > 0) {
            const wordEntry = allRows.find(row => row.id === parseInt(wordID) && row.type === 'word');
            if (wordEntry) {
                console.log('Displaying word entry:', wordEntry);
                await renderBox([wordEntry], '', false, {}, rowsPerPage, 1); // Render single box
                return [wordEntry]; // Return the word entry as an array
            } else {
                console.warn(`Word entry not found for ID: ${wordID}`);
                return false;
            }
        } else if (rootID && parseInt(rootID) > 0) {
            const rootEntry = allRows.find(row => row.id === parseInt(rootID) && row.type === 'root');
            if (rootEntry) {
                console.log('Displaying root entry:', rootEntry);
                await renderBox([rootEntry], '', false, {}, rowsPerPage, 1); // Render single box
                return [rootEntry]; // Return the root entry as an array
            } else {
                console.warn(`Root entry not found for ID: ${rootID}`);
                return false;
            }
        } else if (wordSpecificTerm && wordSpecificTerm.trim()) {
            console.log(`Processing word specific term: ${wordSpecificTerm}`);
            const filteredRows = allRows.filter(row => row.title.toLowerCase().includes(wordSpecificTerm.toLowerCase()));
            return filteredRows; // Return filtered rows based on word specific term
        } else if (rootSpecificTerm && rootSpecificTerm.trim()) {
            console.log(`Processing root specific term: ${rootSpecificTerm}`);
            const filteredRows = allRows.filter(row => row.type === 'root' && row.title.toLowerCase().includes(rootSpecificTerm.toLowerCase()));
            return filteredRows; // Return filtered rows based on root specific term
        } else {
            console.warn('No valid URL parameters found.');
            return false;
        }
    } catch (error) {
        console.error('Error processing URL parameters:', error);
        return false; // Signal that an error occurred
    }
}
