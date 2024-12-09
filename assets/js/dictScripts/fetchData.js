/**
 * Fetches data from a given URL (supports .xlsx files).
 * @param {string} url - The URL of the file.
 * @param {string} type - The type of data (e.g., 'word', 'root').
 * @returns {Promise<Array>} - A promise that resolves to the fetched data.
 */
export async function fetchData(url, type) {
    try {
        console.log(`Fetching ${type} data from URL: ${url}`);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Fetched ${type} data from URL: ${url}`);

        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        console.log(`${type} workbook:`, workbook);

        // Assuming the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        console.log(`${type} worksheet:`, worksheet);

        // Converting the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`${type} JSON data:`, jsonData);

        return jsonData;
    } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        throw error;
    }
}
