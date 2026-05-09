// editor.js

// Compteur de caractères en temps réel
const textArea = document.getElementById('content');
const charCount = document.getElementById('char-count');

textArea.addEventListener('input', () => {
    const length = textArea.value.length;
    charCount.innerText = `${length} caractères`;
});

/**
 * Enregistrer le texte
 */
async function saveDraft() {
    const title = document.getElementById('title').value;
    const content = textArea.value;

    if (!title || !content) {
        return alert("Le titre et le contenu ne peuvent pas être vides.");
    }

    // On utilise la fonction de app.js (ou on réécrit ici si tu préfères isoler totalement)
    try {
        const response = await fetch(`${API}/api/books.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: USER_ID,
                title: title,
                content: content
            })
        });

        const data = await response.json();
        if (data.success) {
            alert("Brouillon sauvegardé avec succès !");
            window.location.href = "mes-livres.html"; // Redirection automatique
        }
    } catch (error) {
        console.error("Erreur de sauvegarde:", error);
        alert("Erreur lors de la communication avec le serveur.");
    }
}

/**
 * Importation Google Docs
 */
async function importGDoc() {
    const urlInput = document.getElementById('gdoc-url');
    const url = urlInput.value;

    if (!url) return alert("Veuillez entrer une URL.");

    const btn = document.querySelector('.btn-import');
    btn.innerText = "Importation...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/import_gdoc.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await res.json();
        if (data.success) {
            textArea.value = data.content;
            // Déclencher manuellement l'event input pour le compteur
            textArea.dispatchEvent(new Event('input'));
            alert("Contenu importé !");
        } else {
            alert("Erreur: " + data.error);
        }
    } catch (e) {
        alert("Le serveur d'importation ne répond pas.");
    } finally {
        btn.innerText = "Importer";
        btn.disabled = false;
    }
}
