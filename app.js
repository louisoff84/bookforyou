/** * CONFIGURATION GLOBALE 
 */
const API = "https://api.craftpick.fr/booksforyou";
const userData = JSON.parse(localStorage.getItem('user'));

// Variables globales accessibles par tous les scripts
const USER_ID = userData ? userData.id : null;
const USERNAME = userData ? userData.username : "Invité";

/**
 * INITIALISATION AU CHARGEMENT
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("BooksForYou prêt by louisoff84. Utilisateur :", USERNAME);
    
    // Si on est sur l'index, charger les livres
    if (document.getElementById('feed')) {
        loadFeed();
    }
});

/**
 * FONCTION DE DÉCONNEXION (Placée ici pour être globale)
 */
function logout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

/**
 * CHARGER LE FLUX D'ACCUEIL
 */
async function loadFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;

    try {
        const res = await fetch(`${API}/api/books.php?status=published`);
        const books = await res.json();
        
        if (books.length === 0) {
            feed.innerHTML = "<p class='text-muted'>Aucune histoire pour le moment.</p>";
            return;
        }

        feed.innerHTML = books.map(b => `
            <div class="card book-card" onclick="openReader(${b.id}, '${b.title.replace(/'/g, "\\'")}')">
                <div class="status-badge status-published">Publié</div>
                <h3>${escapeHtml(b.title)}</h3>
                <p>${escapeHtml(b.content || "").substring(0, 120)}...</p>
                <div class="book-meta">
                    <span>✍️ ${escapeHtml(b.username)}</span>
                    <span>📅 ${new Date(b.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        feed.innerHTML = "<p style='color:red'>Erreur de connexion au serveur.</p>";
    }
}

/**
 * SYSTÈME DE LECTURE (READER)
 */
let bookPages = [];
async function openReader(bookId, title) {
    try {
        const res = await fetch(`https://api.craftpick.fr/booksforyou/api/get_pages.php?book_id=${bookId}`);
        bookPages = await res.json();
        
        if (bookPages.length === 0) {
            alert("Ce livre ne contient pas encore de pages.");
            return;
        }

        document.getElementById('reader-title').innerText = title;
        const selector = document.getElementById('page-selector');
        selector.innerHTML = bookPages.map((p, i) => `<option value="${i}">Chapitre ${i+1}</option>`).join('');
        
        showPage(0);
        document.getElementById('reader-overlay').style.display = 'flex';
    } catch (e) {
        alert("Erreur lors de l'ouverture du livre.");
    }
}

function showPage(index) {
    const content = document.getElementById('reader-content');
    content.innerHTML = `<div class="page-animate">${bookPages[index].content.replace(/\n/g, '<br>')}</div>`;
    document.getElementById('reader-content').scrollTop = 0;
}

function closeReader() {
    document.getElementById('reader-overlay').style.display = 'none';
}

/**
 * UTILITAIRES
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
