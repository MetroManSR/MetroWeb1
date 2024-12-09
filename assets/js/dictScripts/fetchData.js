/**
 * Fetches data from a given URL (supports .xlsx files).
 * @param {string} url - The URL of the file.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Promise<Array>} - A promise that resolves to the fetched data.
 */
export async function fetchData(url, type) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converting the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        return jsonData;
    } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        throw error;
    }
}
