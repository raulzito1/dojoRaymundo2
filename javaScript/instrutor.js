// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Inicializa o Firebase
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

const form = document.getElementById('form-instrutor');
const statusMessage = document.getElementById('status-message');

// Função para redimensionar a imagem e converter para Base64
const resizeAndConvertToBase64 = (file, maxWidth, maxHeight) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Exporta como JPEG com 80% de qualidade para reduzir o tamanho
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = form.nome.value;
    const faixa = form.faixa.value;
    const bio = form.bio.value;
    const fotoFile = form.foto.files[0];

    const submitButton = form.querySelector('.btn-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    statusMessage.style.display = 'none';

    if (!fotoFile) {
        // Esta verificação é mais cosmética, pois o 'required' já trata disto.
        statusMessage.textContent = 'Por favor, selecione uma foto.';
        statusMessage.className = 'error';
        statusMessage.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar Inscrição';
        return;
    }

    try {
        // Redimensiona a imagem antes de a converter
        const fotoBase64 = await resizeAndConvertToBase64(fotoFile, 300, 300);

        // Adiciona o documento na coleção 'inscricoes'
        const docRef = await addDoc(collection(db, `artifacts/${appId}/public/data/inscricoes`), {
            nome: nome,
            faixa: faixa,
            bio: bio,
            fotoBase64: fotoBase64,
            timestamp: serverTimestamp()
        });

        statusMessage.textContent = 'Inscrição enviada com sucesso!';
        statusMessage.className = 'success';
        statusMessage.style.display = 'block';

        form.reset();

    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        statusMessage.textContent = 'Erro ao enviar inscrição. Tente novamente.';
        statusMessage.className = 'error';
        statusMessage.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar Inscrição';
    }
});