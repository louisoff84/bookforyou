/**
 * APP.JS - Noyau de l'application BooksForYou
 */

// --- 1. CONFIGURATION GLOBALE ---
const API = "https://api.craftpick.fr/booksforyou";
const userRaw = localStorage.getItem('user');
const userData = userRaw ? JSON.parse(userRaw) : null;
const USER_ID = userData ? userData.id : null;
const USERNAME = userData ? userData.username : "Invité";

// --- 2. INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur l'accueil
    if (document.getElementById('feed')) {
        loadFeed();
    }
    
    // Si on est sur le profil
    if (document.getElementById('profile-username')) {
        initProfile();
    }
});

// --- 3. SESSION ---
function logout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

// --- 4. ACCUEIL (FEED) ---
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const res = await fetch(`${API}/api/books.php?status=published`);
        const books = await res.json();
        
        if (books.length === 0) {
            feed.innerHTML = `<div class="text-muted">Aucune histoire publiée pour le moment.</div>`;
            return;
        }

        feed.innerHTML = books.map(b => {
            const safeTitle = b.title.replace(/'/g, "\\'"); // Protège les apostrophes pour le onclick
            return `
            <div class="card book-card" onclick="openReader(${b.id}, '${safeTitle}')">
                <span class="status-badge status-published">Publié</span>
                <h3>${escapeHtml(b.title)}</h3>
                <p>${escapeHtml(b.content || "").substring(0, 120)}...</p>
                <div class="book-meta">
                    <span>✍️ ${escapeHtml(b.username)}</span>
                    <span>📅 ${new Date(b.created_at).toLocaleDateString()}</span>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error("Erreur Feed:", e);
        feed.innerHTML = "<div style='color:red'>Erreur de chargement des livres.</div>";
    }
}

// --- 5. LECTEUR INTELLIGENT (READER) ---
let currentPages = [];

async function openReader(bookId, title) {
    try {
        const res = await fetch(`${API}/api/get_pages.php?book_id=${bookId}`);
        if (!res.ok) throw new Error("Erreur réseau");
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data) || data.length === 0) return alert("Ce livre est vide.");

        currentPages = data;
        
        document.getElementById('reader-title').innerText = title;
        document.getElementById('page-selector').innerHTML = data.map((p, i) => 
            `<option value="${i}">Chapitre ${i + 1}</option>`
        ).join('');

        displayPage(0);
        document.getElementById('reader-overlay').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloque le scroll de la page derrière
    } catch (err) {
        console.error("Erreur Reader:", err);
        alert("Impossible de charger ce livre. " + err.message);
    }
}

function displayPage(index) {
    const content = document.getElementById('reader-content');
    content.innerHTML = `<div class="page-animate">${currentPages[index].content.replace(/\n/g, '<br>')}</div>`;
    content.scrollTop = 0;
}

function closeReader() {
    document.getElementById('reader-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// --- 6. GESTION DU PROFIL ---
function initProfile() {
    if (!USER_ID) return window.location.href = 'login.html';
    
    document.getElementById('profile-username').innerText = USERNAME;
    if (userData.profile_pic) {
        document.getElementById('current-pdp').src = `${API}/${userData.profile_pic}`;
    }
    loadMyBooks();
}

async function loadMyBooks() {
    const list = document.getElementById('my-books-list');
    try {
        const res = await fetch(`${API}/api/books.php?user_id=${USER_ID}&status=all`);
        const books = await res.json();

        if (document.getElementById('book-count')) {
            document.getElementById('book-count').innerText = books.length;
        }

        if (books.length === 0) {
            list.innerHTML = `<p class="text-muted">Vous n'avez pas encore écrit de livre.</p>`;
            return;
        }

        list.innerHTML = books.map(b => `
            <div class="manage-card card">
                <span class="status-badge status-${b.status}">${b.status === 'draft' ? 'Brouillon' : 'Publié'}</span>
                <h3>${escapeHtml(b.title)}</h3>
                <div class="action-btns">
                    <a href="ecrire.html?edit=${b.id}" class="btn btn-primary" style="flex:1; text-align:center;">Modifier</a>
                    <button onclick="deleteBook(${b.id})" class="btn btn-danger">Supprimer</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Erreur Profil:", e);
    }
}

async function deleteBook(id) {
    if (confirm("Supprimer définitivement ce livre ?")) {
        try {
            const res = await fetch(`${API}/api/delete_book.php`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ book_id: id, user_id: USER_ID })
            });
            const data = await res.json();
            if (data.success) loadMyBooks();
        } catch (e) {
            alert("Erreur lors de la suppression.");
        }
    }
}

function previewAndUploadPDP(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            document.getElementById('current-pdp').src = e.target.result;
            try {
                const res = await fetch(`${API}/auth/update_pdp.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: USER_ID, image: e.target.result })
                });
                const data = await res.json();
                if (data.success) {
                    userData.profile_pic = data.new_url;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (err) { alert("Erreur d'envoi de l'image."); }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- 7. UTILITAIRES ---
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
