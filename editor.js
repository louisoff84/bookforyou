// editor.js

document.addEventListener('DOMContentLoaded', () => {
    const textZone = document.getElementById('content');
    const display = document.getElementById('char-count');

    if (textZone) {
        textZone.addEventListener('input', () => {
            const count = textZone.value.length;
            display.innerText = `${count.toLocaleString()} caractères`;
        });
    }
});

async function saveDraft() {
    // Sécurité critique
    if (typeof API === 'undefined') {
        alert("Erreur interne : La variable API n'est pas chargée. Vérifiez app.js.");
        return;
    }

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!title) return alert("Donnez un titre !");

    try {
        const res = await fetch(`${API}/api/books.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: USER_ID,
                title: title,
                content: content
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Brouillon sauvegardé !");
            window.location.href = "mes-livres.html";
        } else {
            alert("Erreur : " + data.error);
        }
    } catch (e) {
        alert("Erreur de connexion au serveur.");
    }
}

async function importGDoc() {
    const url = document.getElementById('gdoc-url').value;
    if (!url) return alert("Lien manquant.");

    try {
        const res = await fetch(`${API}/api/import_gdoc.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await res.json();
        if (data.success) {
            document.getElementById('content').value = data.content;
            document.getElementById('content').dispatchEvent(new Event('input'));
        } else {
            alert(data.error);
        }
    } catch (e) {
        alert("Impossible de joindre le serveur d'importation.");
    }
}
