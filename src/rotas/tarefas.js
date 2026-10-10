
import { supabase } from '../supabase.js';

export function mostrarTarefas(usuarioId) {
    const app = document.getElementById('app');
    let textoTemporario = '';
    let salvando = false;

    app.innerHTML = `
        <header>
            <div class="logo">
                <img
                    src="/src/assets/logotodo2.png"
                    alt="Logo da To Do List"
                    class="logo-img"
                >
            </div>

            <div class="social-media">
                <a
                    href="https://www.instagram.com/tiago_melog/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                >
                    <i class="fa-brands fa-instagram"></i>
                </a>

                <a
                    href="https://www.linkedin.com/in/tiagomelo7"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                >
                    <i class="fa-brands fa-linkedin"></i>
                </a>

                <a
                    href="https://github.com/tiagomelo7"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                >
                    <i class="fa-brands fa-github"></i>
                </a>
            </div>
        </header>

        <main>
            <div class="entrada">
                <input
                    type="text"
                    id="campotask"
                    placeholder="Digite sua próxima task"
                    autocomplete="off"
                >

                <button type="button" id="adc">Adicionar</button>
            </div>

            <p id="mensagemTarefas" role="status" aria-live="polite"></p>

            <ul id="todolist"></ul>
        </main>

        <div id="modalComentario" aria-hidden="true">
            <div
                class="modal-conteudo"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tituloModal"
            >
                <h2 id="tituloModal">Adicionar comentário</h2>

                <span id="tituloTaskModal"></span>

                <textarea
                    id="campoComentario"
                    placeholder="Coloque um comentário nessa task"
                    aria-label="Comentário da tarefa"
                ></textarea>

                <div class="acoes-modal">
                    <button type="button" id="cancelarComentario">
                        Cancelar
                    </button>

                    <button type="button" id="adcComentario">
                        Salvar tarefa
                    </button>
                </div>
            </div>
        </div>
    `;

    const campo = document.getElementById('campotask');
    const botaoAdicionar = document.getElementById('adc');
    const lista = document.getElementById('todolist');
    const mensagem = document.getElementById('mensagemTarefas');

    const modal = document.getElementById('modalComentario');
    const tituloTaskModal = document.getElementById('tituloTaskModal');
    const campoComentario = document.getElementById('campoComentario');
    const botaoSalvar = document.getElementById('adcComentario');
    const botaoCancelar = document.getElementById('cancelarComentario');

    function mostrarMensagem(texto, tipo = '') {
        mensagem.textContent = texto;
        mensagem.className = tipo;
    }

    function abrirModal(texto) {
        textoTemporario = texto;
        tituloTaskModal.textContent = texto;

        campoComentario.value = '';
        campoComentario.setCustomValidity('');

        modal.classList.add('ativa');
        modal.setAttribute('aria-hidden', 'false');

        campoComentario.focus();
    }

    function fecharModal() {
        if (salvando) return;

        modal.classList.remove('ativa');
        modal.setAttribute('aria-hidden', 'true');

        textoTemporario = '';
        campoComentario.value = '';
        campoComentario.setCustomValidity('');

        campo.focus();
    }

    async function carregarTarefas() {
        lista.innerHTML = '';
        mostrarMensagem('Carregando tarefas...');

        const { data, error } = await supabase
            .from('tarefas')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('criado_em', { ascending: false });

        if (error) {
            console.error('Erro ao carregar tarefas:', error.message);
            mostrarMensagem('Não foi possível carregar as tarefas.', 'erro');
            return;
        }

        mostrarMensagem('');

        data.forEach((tarefa) => {
            const li = document.createElement('li');
            const infoTarefa = document.createElement('div');
            const titulo = document.createElement('span');
            const comentario = document.createElement('span');
            const checkbox = document.createElement('input');
            const botaoExcluir = document.createElement('button');

            li.classList.toggle('concluida', tarefa.concluida);

            infoTarefa.classList.add('info-tarefa');
            titulo.classList.add('titulo-tarefa');
            comentario.classList.add('comentario');

            titulo.textContent = tarefa.texto;
            comentario.textContent = tarefa.comentario || 'Sem comentário.';

            checkbox.type = 'checkbox';
            checkbox.classList.add('checkbox');
            checkbox.checked = tarefa.concluida;
            checkbox.setAttribute(
                'aria-label',
                `Marcar "${tarefa.texto}" como concluída`
            );

            botaoExcluir.type = 'button';
            botaoExcluir.classList.add('botao-excluir');
            botaoExcluir.textContent = 'Excluir';
            botaoExcluir.setAttribute(
                'aria-label',
                `Excluir tarefa: ${tarefa.texto}`
            );

            // Atualizar o estado de conclusão
            checkbox.addEventListener('change', async () => {
                const estadoAnterior = tarefa.concluida;
                const novoEstado = checkbox.checked;

                checkbox.disabled = true;

                const { data: atualizadas, error } = await supabase
                    .from('tarefas')
                    .update({ concluida: novoEstado })
                    .eq('id', tarefa.id)
                    .eq('usuario_id', usuarioId)
                    .select('id');

                if (error || !atualizadas || atualizadas.length === 0) {
                    console.error(
                        'Erro ao atualizar tarefa:',
                        error?.message || 'Nenhuma tarefa foi atualizada.'
                    );

                    checkbox.checked = estadoAnterior;
                    mostrarMensagem('Não foi possível atualizar a tarefa.', 'erro');
                } else {
                    tarefa.concluida = novoEstado;
                    li.classList.toggle('concluida', novoEstado);
                    mostrarMensagem('');
                }

                checkbox.disabled = false;
            });

            // Excluir tarefa
            botaoExcluir.addEventListener('click', async () => {
                const confirmar = window.confirm(
                    `Deseja excluir a tarefa "${tarefa.texto}"?`
                );

                if (!confirmar) return;

                botaoExcluir.disabled = true;

                const { data: excluidas, error } = await supabase
                    .from('tarefas')
                    .delete()
                    .eq('id', tarefa.id)
                    .eq('usuario_id', usuarioId)
                    .select('id');

                if (error || !excluidas || excluidas.length === 0) {
                    console.error(
                        'Erro ao excluir tarefa:',
                        error?.message || 'Nenhuma tarefa foi excluída.'
                    );

                    mostrarMensagem('Não foi possível excluir a tarefa.', 'erro');
                    botaoExcluir.disabled = false;
                    return;
                }

                li.remove();

                if (lista.children.length === 0) {
                    mostrarMensagem(
                        'Você ainda não tem tarefas. Adicione a primeira!'
                    );
                } else {
                    mostrarMensagem('');
                }
            });

            infoTarefa.appendChild(titulo);
            infoTarefa.appendChild(comentario);

            li.appendChild(checkbox);
            li.appendChild(infoTarefa);
            li.appendChild(botaoExcluir);

            lista.appendChild(li);
        });
    }

    function prepararNovaTarefa() {
        const texto = campo.value.trim();

        if (!texto) {
            mostrarMensagem('Digite um título para a tarefa.', 'erro');
            campo.focus();
            return;
        }

        mostrarMensagem('');
        abrirModal(texto);
    }

    async function salvarTarefa() {
        if (salvando) return;

        const comentario = campoComentario.value.trim();

        if (!textoTemporario) {
            mostrarMensagem('Digite um título para a tarefa.', 'erro');
            fecharModal();
            return;
        }

        if (!comentario) {
            campoComentario.setCustomValidity(
                'Digite um comentário para a tarefa.'
            );
            campoComentario.reportValidity();
            return;
        }

        campoComentario.setCustomValidity('');

        salvando = true;
        botaoSalvar.disabled = true;
        botaoCancelar.disabled = true;
        botaoSalvar.textContent = 'Salvando...';

        try {
            const novaTarefa = {
                texto: textoTemporario,
                comentario,
                concluida: false,
                usuario_id: usuarioId
            };

            const { error } = await supabase
                .from('tarefas')
                .insert([novaTarefa]);

            if (error) {
                console.error('Erro ao salvar tarefa:', error.message);
                mostrarMensagem('Não foi possível salvar a tarefa.', 'erro');
                return;
            }

            modal.classList.remove('ativa');
            modal.setAttribute('aria-hidden', 'true');

            textoTemporario = '';
            campo.value = '';
            campoComentario.value = '';

            await carregarTarefas();
        } catch (erro) {
            console.error('Erro inesperado ao salvar tarefa:', erro);
            mostrarMensagem('Ocorreu um erro ao salvar a tarefa.', 'erro');
        } finally {
            salvando = false;
            botaoSalvar.disabled = false;
            botaoCancelar.disabled = false;
            botaoSalvar.textContent = 'Salvar tarefa';
        }
    }

    botaoAdicionar.addEventListener('click', prepararNovaTarefa);

    campo.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            prepararNovaTarefa();
        }
    });

    botaoSalvar.addEventListener('click', salvarTarefa);
    botaoCancelar.addEventListener('click', fecharModal);

    campoComentario.addEventListener('input', () => {
        campoComentario.setCustomValidity('');
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('ativa')) {
            fecharModal();
        }
    });

    carregarTarefas();
}
