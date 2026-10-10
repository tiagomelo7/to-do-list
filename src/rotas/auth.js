
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export function mostrarAuth(modo = 'login') {
    const app = document.getElementById('app');
    const modoCadastro = modo === 'cadastro';

    app.innerHTML = `
    <div class="pagina-auth">
        <main class="auth-container">
            <h1 id="tituloAuth">
                ${modoCadastro ? 'Criar conta' : 'Entrar'}
            </h1>

            <form id="formAuth">
                <label for="email">E-mail</label>
                <input
                    type="email"
                    id="email"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required
                >

                <label for="senha">Senha</label>
                <input
                    type="password"
                    id="senha"
                    placeholder="Sua senha"
                    autocomplete="${modoCadastro ? 'new-password' : 'current-password'}"
                    minlength="6"
                    required
                >

                <button type="submit" id="botaoAuth">
                    ${modoCadastro ? 'Cadastrar' : 'Entrar'}
                </button>
            </form>

            <p id="mensagemAuth" role="status" aria-live="polite"></p>

            ${
                modoCadastro
                    ? `
                        <p>
                            Já tem conta?
                            <a href="/login" id="linkAuth">Entre</a>
                        </p>
                    `
                    : `
                        <p>
                            Ainda não tem conta?
                            <a href="/login/cadastro" id="linkAuth">
                                Cadastre-se
                            </a>
                        </p>
                    `
            }
        </main>
        </div>
    `;

    const formAuth = document.getElementById('formAuth');
    const email = document.getElementById('email');
    const senha = document.getElementById('senha');
    const botaoAuth = document.getElementById('botaoAuth');
    const mensagemAuth = document.getElementById('mensagemAuth');
    const linkAuth = document.getElementById('linkAuth');

    // Navegação entre as rotas
    linkAuth.addEventListener('click', (event) => {
        event.preventDefault();

        if (modoCadastro) {
            router.navigate('/login');
        } else {
            router.navigate('/login/cadastro');
        }
    });

    // Envio do formulário
    formAuth.addEventListener('submit', async (event) => {
        event.preventDefault();

        mensagemAuth.textContent = 'Processando...';
        botaoAuth.disabled = true;

        const textoOriginal = modoCadastro ? 'Cadastrar' : 'Entrar';
        botaoAuth.textContent = modoCadastro
            ? 'Cadastrando...'
            : 'Entrando...';

        try {
            let resultado;

            if (modoCadastro) {
                resultado = await supabase.auth.signUp({
                    email: email.value.trim(),
                    password: senha.value
                });
            } else {
                resultado = await supabase.auth.signInWithPassword({
                    email: email.value.trim(),
                    password: senha.value
                });
            }

            const { data, error } = resultado;

            if (error) {
                mensagemAuth.textContent = `Erro: ${error.message}`;
                return;
            }

            // Cadastro que exige confirmação por e-mail
            if (modoCadastro && !data.session) {
                mensagemAuth.textContent =
                    'Conta criada! Verifique seu e-mail para confirmar o cadastro.';
                return;
            }

            mensagemAuth.textContent = modoCadastro
                ? 'Cadastro realizado!'
                : 'Login realizado!';

            router.navigate('/');

        } catch (erro) {
            console.error('Erro na autenticação:', erro);
            mensagemAuth.textContent =
                'Ocorreu um erro inesperado. Tente novamente.';
        } finally {
            botaoAuth.disabled = false;
            botaoAuth.textContent = textoOriginal;
        }
    });
}
