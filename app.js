/**
 * APP.JS - Configuration Globale et Gestion de Session
 * Ce fichier doit être chargé AVANT tous les autres scripts (editor.js, etc.)
 */

// 1. CONFIGURATION API
// Remplace bien par l'URL exacte de ton dossier sur Craftpick
const API = "https://api.craftpick.fr/booksforyou";

// 2. GESTION DE LA SESSION
// On récupère les données de l'utilisateur stockées lors du login
const userData = JSON.parse(localStorage.getItem('user'));

// Variables globales accessibles partout
const USER_ID = userData ? userData.id : null;
const USERNAME = userData ? userData.username : "Invité";

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App initialisée pour :", USERNAME);
    
    // Mise à jour de l'interface selon la connexion
    updateUI();

    // Si on est sur l'index, on charge le flux
    if (document.getElementById('feed')) {
        loadFeed();
    }
});

/**
 * Met à jour les éléments visuels selon si l'utilisateur est connecté ou non
 */
function updateUI() {
    const navUsername = document.getElementById('nav-username');
    if (navUsername) {
        navUsername.innerText = USER_ID ? `Profil (${USERNAME})` : "Connexion";
    }

    // Protection des pages privées (ex: l'éditeur)
    const isEditorPage = window.location.pathname.includes('ecrire.html') || 
                         window.location.pathname.includes('mes-livres.html');
    
    if (isEditorPage && !USER_ID) {
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = "login.html";
    }
}

/**
 * CHARGER LE FLUX PUBLIC (Accueil)
 */
async function loadFeed() {
    const feedContainer = document.getElementById('feed');
    if (!feedContainer) return;

    try {
        const res = await fetch(`${API}/api/books.php?status=published`);
        
        if (!res.ok) throw new Error("Erreur de réponse serveur");
        
        const books = await res.json();
        
        if (books.length === 0) {
            feedContainer.innerHTML = '<div class="loading">Aucune histoire publiée pour le moment.</div>';
            return;
        }

        let html = '';
        books.forEach(b => {
            html += `
                <div class="card book-card">
                    <h3>${escapeHtml(b.title)}</h3>
                    <p>${escapeHtml(b.content).substring(0, 150)}...</p>
                    <div class="book-meta">
                        <span>Par <strong class="author-name">${escapeHtml(b.username)}</strong></span>
                        <span>📅 ${new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                </div>`;
        });
        
        feedContainer.innerHTML = html;

    } catch (err) {
        console.error("Erreur Feed:", err);
        feedContainer.innerHTML = `<div class="card" style="color:red">Impossible de charger les livres. Vérifiez la connexion BDD.</div>`;
    }
}

/**
 * DÉCONNEXION
 */
function logout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

/**
 * UTILITAIRE : Sécuriser l'affichage du texte (Anti-XSS)
 */
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
