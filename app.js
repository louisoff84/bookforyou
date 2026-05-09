const API = "https://api.craftpick.fr/booksforyou";
const userData = JSON.parse(localStorage.getItem('user'));
const USER_ID = userData ? userData.id : null;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed')) loadFeed();
});

// Charge les livres sur l'accueil
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const res = await fetch(`${API}/api/books.php`);
        const books = await res.json();
        feed.innerHTML = books.map(b => `
            <div class="card book-card" onclick="openReader(${b.id}, '${b.title.replace(/'/g, "\\")}')">
                <h3>${b.title}</h3>
                <p>${b.content ? b.content.substring(0, 100) : 'Cliquez pour lire...'}...</p>
                <div class="book-meta">Par <b>${b.username}</b></div>
            </div>
        `).join('');
    } catch (e) { feed.innerHTML = "Erreur de chargement."; }
}

// Système de lecture de pages
let bookPages = [];
async function openReader(bookId, title) {
    const res = await fetch(`${API}/api/get_pages.php?book_id=${bookId}`);
    bookPages = await res.json();
    
    document.getElementById('reader-title').innerText = title;
    const selector = document.getElementById('page-selector');
    selector.innerHTML = bookPages.map((p, i) => `<option value="${i}">Chapitre ${i+1}</option>`).join('');
    
    showPage(0);
    document.getElementById('reader-overlay').style.display = 'flex';
}

function showPage(index) {
    document.getElementById('reader-content').innerHTML = bookPages[index].content.replace(/\n/g, '<br>');
}

function closeReader() { document.getElementById('reader-overlay').style.display = 'none'; }
