// Récupérer l'utilisateur stocké dans le navigateur
const userData = JSON.parse(localStorage.getItem('user'));

// Si pas d'utilisateur et qu'on n'est pas sur la page de login, on redirige
if (!userData && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
    window.location.href = "login.html";
}

// Utiliser l'ID réel de l'utilisateur connecté
const USER_ID = userData ? userData.id : null;
const USERNAME = userData ? userData.username : "Invité";

// Fonction pour se déconnecter
function logout() {
    localStorage.removeItem('user');
    window.location.href = "login.html";
}
