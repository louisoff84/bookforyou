const API = "https://api.craftpick.fr/booksforyou";
const userRaw = localStorage.getItem('user');
const userData = userRaw ? JSON.parse(userRaw) : null;
const USER_ID = userData ? userData.id : null;

// Variables pour le lecteur
let currentPages = [];

document.addEventListener('DOMContentLoaded', () => {
    // Charger le flux si on est sur l'accueil
    if (document.getElementById('feed')) loadFeed();
    
    // Afficher le nom de l'utilisateur si présent
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && userData) nameDisplay.innerText = userData.username;
});

// Déconnexion Globale
function logout() {
    if (confirm("Se déconnecter ?")) {
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

// Charger les livres
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const res = await fetch(`${API}/api/books.php`);
        const books = await res.json();
        
        feed.innerHTML = books.map(b => {
            const safeTitle = b.title.replace(/'/g, "\\'");
            return `
            <div class="card book-card" onclick="openReader(${b.id}, '${safeTitle}')">
                <h3>${escapeHtml(b.title)}</h3>
                <p>${escapeHtml(b.content || "").substring(0, 100)}...</p>
                <div class="book-meta">
                    <span>👤 ${escapeHtml(b.username)}</span>
                    <span>📄 Page 1</span>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        feed.innerHTML = "Erreur de chargement.";
    }
}

// Ouvrir le lecteur
async function openReader(bookId, title) {
    try {
        const res = await fetch(`${API}/api/get_pages.php?book_id=${bookId}`);
        currentPages = await res.json();

        if (currentPages.length === 0) return alert("Livre vide.");

        document.getElementById('reader-title').innerText = title;
        const selector = document.getElementById('page-selector');
        
        selector.innerHTML = currentPages.map((p, i) => 
            `<option value="${i}">Chapitre ${i + 1}</option>`
        ).join('');

        displayPage(0);
        document.getElementById('reader-overlay').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloque le scroll derrière
    } catch (e) {
        alert("Erreur de lecture.");
    }
}

function displayPage(index) {
    const contentArea = document.getElementById('reader-content');
    contentArea.innerHTML = currentPages[index].content.replace(/\n/g, '<br>');
    contentArea.scrollTop = 0;
}

function closeReader() {
    document.getElementById('reader-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
