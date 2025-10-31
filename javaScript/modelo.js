import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Autenticação
try {
    if (typeof __initial_auth_token !== 'undefined') {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        await signInAnonymously(auth);
    }
} catch (error) {
    console.error("Erro na autenticação:", error);
}

const listaInscricoesEl = document.getElementById('lista-inscricoes');
const loadingMessage = document.getElementById('loading');
const filterContainer = document.getElementById('filter-container');

let allInscriptions = [];
let currentFilter = 'Todos';

const renderInscriptions = () => {
    listaInscricoesEl.innerHTML = '';

    const filteredInscriptions = currentFilter === 'Todos'
        ? allInscriptions
        : allInscriptions.filter(insc => insc.faixa === currentFilter);

    if (filteredInscriptions.length === 0 && allInscriptions.length > 0) {
        listaInscricoesEl.innerHTML = `<p id="loading">Nenhuma inscrição encontrada para a faixa "${currentFilter}".</p>`;
        return;
    }

    if (allInscriptions.length === 0) {
        listaInscricoesEl.innerHTML = `<p id="loading">Nenhuma inscrição recebida ainda.</p>`;
        return;
    }

    filteredInscriptions.forEach(data => {
        const card = document.createElement('div');
        card.className = 'card-inscricao';
        const dataFormatada = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString('pt-BR') : 'Data indisponível';

        card.innerHTML = `
                <img src="${data.fotoBase64}" alt="Foto de ${data.nome}">
                <h3>${data.nome}</h3>
                <p><strong>Faixa/Nível:</strong> ${data.faixa}</p>
                <p><strong>Biografia:</strong> ${data.bio}</p>
                <p><strong>Data de Envio:</strong> ${dataFormatada}</p>
            `;
        listaInscricoesEl.appendChild(card);
    });
};

const renderFilterButtons = () => {
    const faixas = [...new Set(allInscriptions.map(insc => insc.faixa))];
    filterContainer.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.className = 'filter-btn' + (currentFilter === 'Todos' ? ' active' : '');
    allButton.textContent = 'Todos';
    allButton.onclick = () => {
        currentFilter = 'Todos';
        renderUI();
    };
    filterContainer.appendChild(allButton);

    faixas.forEach(faixa => {
        const button = document.createElement('button');
        button.className = 'filter-btn' + (currentFilter === faixa ? ' active' : '');
        button.textContent = faixa;
        button.onclick = () => {
            currentFilter = faixa;
            renderUI();
        };
        filterContainer.appendChild(button);
    });
};

const renderUI = () => {
    renderFilterButtons();
    renderInscriptions();
}

// Ouve por atualizações em tempo real
const q = query(collection(db, `artifacts/${appId}/public/data/iscrição`));
onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
        loadingMessage.textContent = "Nenhuma inscrição recebida ainda.";
        allInscriptions = [];
    } else {
        allInscriptions = querySnapshot.docs.map(doc => doc.data());
    }
    renderUI();
}, (error) => {
    console.error("Erro ao buscar inscrições:", error);
    loadingMessage.textContent = "Erro ao carregar as inscrições. Verifique o console.";
});