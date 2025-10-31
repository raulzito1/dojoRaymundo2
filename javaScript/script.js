document.getElementById('year').textContent = new Date().getFullYear();
const form=document.getElementById('contactForm'); if(form){form.addEventListener('submit',e=>{e.preventDefault();document.getElementById('formMsg').textContent='Mensagem enviada com sucesso!';form.reset();});}


const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('show');
});
