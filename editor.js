async function importGDoc() {
    const url = document.getElementById('gdoc-url').value;
    const res = await fetch(`${API}/api/import_gdoc.php`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url })
    });
    const data = await res.json();
    if(data.success) {
        // Affiche tout dans le textarea avec les séparateurs
        document.getElementById('content').value = data.content;
        alert("Importé ! " + data.page_count + " pages détectées.");
    }
}

async function saveBook() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    // On envoie le contenu brut, le PHP s'occupera du découpage
    const res = await fetch(`${API}/api/books.php`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: USER_ID, title, content })
    });
    const data = await res.json();
    if(data.success) {
        alert("Livre et chapitres enregistrés !");
        window.location.href = "index.html";
    }
}
