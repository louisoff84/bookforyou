// URL de ton API PHP de production
const API_BASE_URL = 'https://api.craftpick.fr/booksforyou'; 

// Détection automatique du dossier racine (indispensable pour GitHub Pages)
const isGitHubPages = window.location.hostname.includes('github.io');
const APP_BASE = isGitHubPages ? '/bookforyou/' : '/';

const Auth = {
    getUser() {
        const user = localStorage.getItem('bfy_user');
        return user ? JSON.parse(user) : null;
    },
    setUser(user) {
        localStorage.setItem('bfy_user', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('bfy_user');
        window.location.href = APP_BASE + 'index.html';
    },
    checkAuth() {
        if (!this.getUser()) {
            alert("Vous devez être connecté pour accéder à cette page.");
            window.location.href = APP_BASE + 'auth/login.html';
        }
    }
};

// Gère la barre de navigation avec les bons liens dynamiques
function updateNavbar() {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;
    
    const user = Auth.getUser();
    if (user) {
        navRight.innerHTML = `
            <a href="${APP_BASE}books/editor.html" class="nav-link">📝 Écrire</a>
            <span class="user-badge">👋 ${user.username}</span>
            <button onclick="Auth.logout()" class="btn-secondary">Déconnexion</button>
        `;
    } else {
        navRight.innerHTML = `
            <a href="${APP_BASE}auth/login.html" class="nav-link">Connexion</a>
            <a href="${APP_BASE}auth/register.html" class="btn">S'inscrire</a>
        `;
    }
}
