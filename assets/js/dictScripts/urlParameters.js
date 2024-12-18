import { processAllSettings, displaySpecificEntry, rootSpecific, wordSpecific } from './processRows.js';
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
            await processAllSettings(criteria, allRows, rowsPerPage, displayPage, currentPage, currentSortOrder);
            return true; // Signal that URL parameter processing occurred
        } else if (wordID && parseInt(wordID) > 0) {
            const wordEntry = allRows.find(row => row.id === parseInt(wordID) && row.type === 'word');
            if (wordEntry) {
                console.log('Displaying word entry:', wordEntry);
                await renderBox([wordEntry], '', false, {}, rowsPerPage, 1); // Render single box
                return true; // Signal that URL parameter processing occurred
            } else {
                console.warn(`Word entry not found for ID: ${wordID}`);
                return false;
            }
        } else if (rootID && parseInt(rootID) > 0) {
            const rootEntry = allRows.find(row => row.id === parseInt(rootID) && row.type === 'root');
            if (rootEntry) {
                console.log('Displaying root entry:', rootEntry);
                await renderBox([rootEntry], '', false, {}, rowsPerPage, 1); // Render single box
                return true; // Signal that URL parameter processing occurred
            } else {
                console.warn(`Root entry not found for ID: ${rootID}`);
                return false;
            }
        } else if (wordSpecificTerm && wordSpecificTerm.trim()) {
            console.log(`Processing word specific term: ${wordSpecificTerm}`);
            await wordSpecific(wordSpecificTerm, allRows);
            return true; // Signal that URL parameter processing occurred
        } else if (rootSpecificTerm && rootSpecificTerm.trim()) {
            console.log(`Processing root specific term: ${rootSpecificTerm}`);
            await rootSpecific(rootSpecificTerm, allRows);
            return true; // Signal that URL parameter processing occurred
        } else {
            console.warn('No valid URL parameters found.');
            return false; // Signal that no URL parameter processing occurred
        }
    } catch (error) {
        console.error('Error processing URL parameters:', error);
        return false; // Signal that an error occurred
    }
}
