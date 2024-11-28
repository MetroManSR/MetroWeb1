<form id="dictionaryForm" onsubmit="fetchDefinition(event)">
        <label for="word">Enter a word:</label>
        <input type="text" id="word" name="word" required>
        <button type="submit">Search</button>
    </form>
    <div id="definition"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
<script src="dict.js"></script>
