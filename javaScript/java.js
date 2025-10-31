// Pega os elementos do HTML
const modal = document.getElementById("registrationModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close-btn");

// Função para abrir a modal
function openModal() {
    modal.style.display = "block";
}

// Função para fechar a modal
function closeModal() {
    modal.style.display = "none";
}

// Eventos de clique
openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

// Fecha a modal se o usuário clicar fora do conteúdo dela
window.addEventListener("click", function(event) {
    if (event.target == modal) {
        closeModal();
    }
});