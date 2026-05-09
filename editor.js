/**
 * EDITOR.JS - Logique de l'éditeur intelligent
 */

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content');
    const charDisplay = document.getElementById('char-count');
    const pageDisplay = document.getElementById('page-count');

    // Mise à jour des stats en temps réel
    contentArea.addEventListener('input', () => {
        const text = contentArea.value;
        const chars = text.length;
        const pages = text.split(/\n---\n|\n---|^---/).filter(p => p.trim() !== "").length;

        charDisplay.innerText = chars.toLocaleString();
        pageDisplay.innerText = pages || 1;
    });
});

/**
 * Importation depuis Google Docs
 */
async function importGDoc() {
    const url = document.getElementById('gdoc-url').value;
    if (!url) return alert("Veuillez entrer une URL.");

    const btn = document.querySelector('.editor-sidebar .btn-primary');
    btn.innerText = "⚡ Importation...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/import_gdoc.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('content').value = data.content;
            // Déclencher l'évènement input pour mettre à jour les compteurs
            document.getElementById('content').dispatchEvent(new Event('input'));
            alert("Importation réussie !");
        } else {
            alert("Erreur : " + data.error);
        }
    } catch (e) {
        alert("Impossible de joindre le serveur.");
    } finally {
        btn.innerText = "Importer";
        btn.disabled = false;
    }
}

/**
 * Sauvegarde et Publication
 */
async function saveBook() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!title || !content) {
        return alert("Le titre et le contenu ne peuvent pas être vides.");
    }

    try {
        const res = await fetch(`${API}/api/books.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: USER_ID,
                title: title,
                content: content, // Le PHP s'occupera d'éclater le texte via '---'
                status: 'published'
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("✨ Votre œuvre a été publiée avec succès !");
            window.location.href = "profil.html";
        } else {
            alert("Erreur : " + data.error);
        }
    } catch (e) {
        alert("Erreur lors de la sauvegarde.");
    }
}
