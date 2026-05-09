// Remplace par l'URL de ton serveur de production quand tu déploieras ton API PHP
const API_BASE_URL = 'http://localhost:8000'; 

// Fonctions utilitaires globales
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
        window.location.href = '/';
    },
    checkAuth() {
        if (!this.getUser()) {
            alert("Vous devez être connecté pour accéder à cette page.");
            window.location.href = '../auth/login.html';
        }
    }
};

// Gère l'affichage dynamique de la barre de navigation
function updateNavbar() {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;
    
    const user = Auth.getUser();
    if (user) {
        navRight.innerHTML = `
            <a href="/books/editor.html" class="nav-link">📝 Écrire</a>
            <span class="user-badge">👋 ${user.username}</span>
            <button onclick="Auth.logout()" class="btn-secondary">Déconnexion</button>
        `;
    } else {
        navRight.innerHTML = `
            <a href="/auth/login.html" class="nav-link">Connexion</a>
            <a href="/auth/register.html" class="btn">S'inscrire</a>
        `;
    }
}
