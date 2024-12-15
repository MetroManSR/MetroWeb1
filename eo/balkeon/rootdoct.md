# Diccionario v1.1.14

<form id="dictionaryForm" onsubmit ="fetchDefinition(event)">
        <label for="word">Enigu vorton:</label>
        <input type="text" id="word" name="word" required />
        <button type="submit">Serĉi</button>
</form>
<div id="definition"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js" > </script>
