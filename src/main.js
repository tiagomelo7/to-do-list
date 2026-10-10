
import './style.css';

import { mostrarTarefas } from './rotas/tarefas.js';
import { mostrarAuth } from './rotas/auth.js';
import { router } from './router.js';
import { supabase } from './supabase.js';

// Rota principal: exige autenticação
router.on('/', async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Erro ao verificar sessão:', error.message);
        router.navigate('/login');
        return;
    }

    const session = data.session;

    if (!session) {
        router.navigate('/login');
        return;
    }

    mostrarTarefas(session.user.id);
});

// Rota de login
router.on('/login', () => {
    mostrarAuth('login');
});

// Rota de cadastro
router.on('/login/cadastro', () => {
    mostrarAuth('cadastro');
});

// Inicializa o roteador
router.resolve();
