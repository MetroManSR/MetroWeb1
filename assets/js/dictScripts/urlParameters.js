import { processAllSettings, displaySpecificEntry, rootSpecific, wordSpecific } from './processRows';

// Handle URL parameters
export function initUrl() {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('hypersearchterm');
        const wordID = params.get('wordid');
        const rootID = params.get('rootid');
        const wordSpecificTerm = params.get('wordSpecific');
        const rootSpecificTerm = params.get('rootSpecific');

        if (searchTerm && searchTerm.trim()) {
            const criteria = { searchTerm: searchTerm.trim(), searchIn: { word: true, root: true, definition: true, etymology: false } };
            processAllSettings(criteria, allRows, rowsPerPage, displayPage, currentPage, currentSortOrder);
        } else if (wordID && parseInt(wordID) > 0) {
            const wordEntry = allRows.find(row => row.id === parseInt(wordID) && row.type === 'word');
            console.log('Word Entry:', wordEntry);
            displaySpecificEntry(wordEntry, allRows);
        } else if (rootID && parseInt(rootID) > 0) {
            const rootEntry = allRows.find(row => row.id === parseInt(rootID) && row.type === 'root');
            console.log('Root Entry:', rootEntry);
            displaySpecificEntry(rootEntry, allRows);
        } else if (wordSpecificTerm && wordSpecificTerm.trim()) {
            wordSpecific(wordSpecificTerm, allRows);
        } else if (rootSpecificTerm && rootSpecificTerm.trim()) {
            rootSpecific(rootSpecificTerm, allRows);
        }
 } 
