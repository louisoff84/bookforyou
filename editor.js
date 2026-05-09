/**
 * EDITOR.JS - Gestionnaire de la page d'écriture
 * BooksForYou - 2026
 */

// On attend que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById('content');
    const charCount = document.getElementById('char-count');

    // 1. Gestion du compteur de caractères
    if (textArea && charCount) {
        textArea.addEventListener('input', () => {
            const length = textArea.value.length;
            charCount.innerText = `${length.toLocaleString()} caractères`;
        });
    }

    // Vérification de la session (sécurité supplémentaire)
    if (typeof USER_ID === 'undefined' || !USER_ID) {
        console.warn("Utilisateur non connecté, redirection...");
        window.location.href = "login.html";
    }
});

/**
 * IMPORTATION GOOGLE DOCS
 * Utilise l'API backend pour récupérer le texte brut
 */
async function importGDoc() {
    const urlInput = document.getElementById('gdoc-url');
    const textArea = document.getElementById('content');
    const btn = document.querySelector('.btn-import');
    const url = urlInput.value.trim();

    if (!url) {
        alert("⚠️ Veuillez coller l'URL de votre Google Doc.");
        return;
    }

    // Animation du bouton
    const originalText = btn.innerText;
    btn.innerText = "⚡ Importation...";
    btn.disabled = true;

    try {
        console.log("Tentative d'importation via :", `${API}/api/import_gdoc.php`);
        
        const response = await fetch(`${API}/api/import_gdoc.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        // Vérification si le fichier PHP existe bien
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            textArea.value = data.content;
            // On force la mise à jour du compteur de caractères
            textArea.dispatchEvent(new Event('input'));
            alert("✅ Importation réussie !");
            urlInput.value = ""; // On vide le champ URL
        } else {
            alert("❌ Erreur serveur : " + (data.error || "Inconnue"));
        }

    } catch (error) {
        console.error("Détail de l'erreur d'importation :", error);
        alert("🚫 Le serveur d'importation ne répond pas.\n\nVérifiez :\n1. Que le fichier api/import_gdoc.php est bien sur le FTP.\n2. Que le document Google est en mode 'Public'.\n3. La console (F12) pour plus de détails.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

/**
 * SAUVEGARDER LE BROUILLON
 * Envoie le titre et le contenu à la base de données
 */
async function saveDraft() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const btn = document.querySelector('.btn-save');

    if (!title) {
        alert("📌 Veuillez donner un titre à votre livre.");
        return;
    }

    if (!content) {
        alert("✍️ Écrivez au moins quelques mots avant de sauvegarder !");
        return;
    }

    btn.innerText = "💾 Enregistrement...";
    btn.disabled = true;

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

        if (!response.ok) throw new Error("Erreur réseau");

        const data = await response.json();

        if (data.success) {
            alert("✨ Brouillon enregistré avec succès !");
            // Optionnel : rediriger vers la gestion des livres
            window.location.href = "mes-livres.html";
        } else {
            alert("❌ Erreur : " + data.error);
        }

    } catch (error) {
        console.error("Erreur sauvegarde :", error);
        alert("🚫 Impossible de sauvegarder. Vérifiez votre connexion à l'API.");
    } finally {
        btn.innerText = "Enregistrer en Brouillon";
        btn.disabled = false;
    }
}

/**
 * PRÉVISUALISATION LOCALE
 * Permet de voir le rendu sans envoyer au serveur
 */
function previewLocal() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    if(!content) return alert("Rien à prévisualiser.");

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <html>
            <head>
                <title>Prévisualisation : ${title}</title>
                <style>
                    body { font-family: 'Georgia', serif; line-height: 1.8; padding: 50px; max-width: 800px; margin: auto; background: #fffcf5; color: #2c3e50; }
                    h1 { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    p { white-space: pre-wrap; font-size: 1.2rem; }
                </style>
            </head>
            <body>
                <h1>${title || "Sans Titre"}</h1>
                <p>${content}</p>
            </body>
        </html>
    `);
}
