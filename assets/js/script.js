// ========== CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ==========
const nomeMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const nomesDiasSemana = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

let modoVisualizacao = "mes";
let dataAtualCalendario = new Date();

const dataHoje = new Date();
const diaHoje = dataHoje.getDate();
const mesHoje = dataHoje.getMonth();
const anoHoje = dataHoje.getFullYear();

let instanciaModalTarefa = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
    atualizarBotaoCalendario(modoVisualizacao);
    configurarEventListeners();
    adicionarEstilosTarefas();

    // Aguarda o carregamento dos dados antes de atualizar o calendário
    setTimeout(() => {
        atualizarCalendario();
    }, 100);
});

// ========== FUNÇÕES DE VISUALIZAÇÃO DO CALENDÁRIO ==========
function loadCalendarioMensal() {
    const blocosCalendario = document.getElementById("canvaCalendario");
    const ano = dataAtualCalendario.getFullYear();
    const mes = dataAtualCalendario.getMonth();

    const quantidadeDiasMesAtual = new Date(ano, mes + 1, 0).getDate();
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const difDiasProxMes = 42 - quantidadeDiasMesAtual - primeiroDiaMes;

    configurarGridCalendario(blocosCalendario, "repeat(7, 1fr)", "repeat(6, 1fr)");
    blocosCalendario.innerHTML = '';

    // Dias do mês anterior
    for (let i = primeiroDiaMes - 1; i >= 0; i--) {
        criarDiaCalendario(blocosCalendario, diasMesAnterior - i, true);
    }

    // Dias do mês atual
    for (let i = 1; i <= quantidadeDiasMesAtual; i++) {
        const ehHoje = i === diaHoje && mes === mesHoje && ano === anoHoje;
        criarDiaCalendario(blocosCalendario, i, false, ehHoje);
    }

    // Dias do próximo mês
    for (let i = 1; i <= difDiasProxMes; i++) {
        criarDiaCalendario(blocosCalendario, i, true);
    }

    cabecalhoNomesDiaSemana();
}

function loadCalendarioSemanal() {
    const blocosCalendario = document.getElementById("canvaCalendario");
    const diaSemana = dataAtualCalendario.getDay();
    const inicioSemana = new Date(dataAtualCalendario);
    inicioSemana.setDate(inicioSemana.getDate() - diaSemana);

    configurarGridCalendario(blocosCalendario, "repeat(7, 1fr)", "auto repeat(24, 1fr)", "visualizacao-semanal");

    // Cabeçalho com dias da semana
    for (let i = 0; i < 7; i++) {
        const diaAtual = new Date(inicioSemana);
        diaAtual.setDate(inicioSemana.getDate() + i);
        criarCabecalhoDiaSemanal(blocosCalendario, diaAtual);
    }

    // Células de horas
    for (let hora = 0; hora < 24; hora++) {
        for (let dia = 0; dia < 7; dia++) {
            const diaAtual = new Date(inicioSemana);
            diaAtual.setDate(inicioSemana.getDate() + dia);
            diaAtual.setHours(hora, 0, 0, 0);
            criarCelulaHora(blocosCalendario, diaAtual, hora, dia === 0);
        }
    }

    cabecalhoNomesDiaSemana();
}

function loadCalendarioDiario() {
    const canva = document.getElementById("canvaCalendario");
    const dia = dataAtualCalendario.getDate();
    const mes = dataAtualCalendario.getMonth();
    const ano = dataAtualCalendario.getFullYear();
    const ehHoje = dia === diaHoje && mes === mesHoje && ano === anoHoje;

    configurarGridCalendario(canva, "1fr", "auto repeat(24, 1fr)", "visualizacao-diaria");

    // Cabeçalho do dia
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("cabecalho-dia-diario");
    headerDiv.innerHTML = `
            <div class="numero-dia-diario" style="${ehHoje ? 'background-color: #150A35; color: white;' : ''}">${dia}</div>
        `;
    canva.appendChild(headerDiv);

    // Células de horas
    for (let i = 0; i < 24; i++) {
        const dataAtual = new Date(ano, mes, dia, i, 0, 0, 0);
        criarCelulaHora(canva, dataAtual, i, true);
    }

    cabecalhoNomesDiaSemana();
}

// ========== FUNÇÕES AUXILIARES DE CRIAÇÃO DE ELEMENTOS ==========
function configurarGridCalendario(elemento, colunas, linhas, classe) {
    elemento.innerHTML = "";
    elemento.style.gridTemplateColumns = colunas;
    elemento.style.gridTemplateRows = linhas;
    elemento.style.overflow = "hidden";
    elemento.className = classe || "";
}

function criarDiaCalendario(container, dia, cinza = false, destaque = false) {
    const diaDiv = document.createElement('div');
    diaDiv.classList.add('cardDiaCalendario');

    const estilo = cinza ? 'color: gray;' : '';
    const estiloDestaque = destaque ? 'background-color: #150A35; color: white;' : '';

    diaDiv.innerHTML = `
            <div style="width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; margin: auto; border-radius: 50%; font-size: 12px; ${estilo} ${estiloDestaque}">${dia}</div>
        `;

    container.appendChild(diaDiv);
}

function criarCabecalhoDiaSemanal(container, data) {
    const dia = data.getDate();
    const mes = data.getMonth();
    const ano = data.getFullYear();
    const ehHoje = dia === diaHoje && mes === mesHoje && ano === anoHoje;

    const cabecalhoDia = document.createElement("div");
    cabecalhoDia.classList.add("cabecalho-dia-diario");
    cabecalhoDia.innerHTML = `
            <div class="numero-dia-diario" style="${ehHoje ? 'background-color: #150A35; color: white;' : ''}">${dia}</div>
        `;

    container.appendChild(cabecalhoDia);
}

function criarCelulaHora(container, data, hora, mostrarHora) {
    const celulaHora = document.createElement("div");
    celulaHora.classList.add("celula-hora-diaria");

    const horaFormatada = hora.toString().padStart(2, '0') + ":00";
    const dataFormatada = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;

    celulaHora.dataset.hora = horaFormatada;
    celulaHora.dataset.data = dataFormatada;

    if (mostrarHora) {
        celulaHora.innerHTML = `<span class="indicador-hora-diaria">${horaFormatada}</span>`;
    }

    container.appendChild(celulaHora);
}

// ========== CONTROLE DE NAVEGAÇÃO ==========
function atualizarCalendario() {
    const ano = dataAtualCalendario.getFullYear();
    const mes = nomeMeses[dataAtualCalendario.getMonth()];
    document.getElementById("mesAtual").innerHTML = `${mes}<br>${ano}`;

    const visualizacoes = {
        "mes": loadCalendarioMensal,
        "semana": loadCalendarioSemanal,
        "dia": loadCalendarioDiario
    };

    visualizacoes[modoVisualizacao]?.();
    renderizarTarefas();
}

function navegarCalendario(direcao) {
    const incrementos = {
        "semana": direcao * 7,
        "dia": direcao * 1,
        "mes": null
    };

    if (modoVisualizacao === "mes") {
        dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() + direcao);
    } else {
        dataAtualCalendario.setDate(dataAtualCalendario.getDate() + incrementos[modoVisualizacao]);
    }

    atualizarCalendario();
}

function irParaHoje() {
    dataAtualCalendario = new Date();
    atualizarCalendario();
}

// ========== CONTROLE DE VISUALIZAÇÃO ==========
function alterarModoVisualizacao(novoModo) {
    modoVisualizacao = novoModo;
    atualizarBotaoCalendario(modoVisualizacao);
    atualizarCalendario();
}

function atualizarBotaoCalendario(visualizacaoAtual) {
    const botoes = {
        "mes": document.getElementById("botaoCalendarioMes"),
        "semana": document.getElementById("botaoCalendarioSemanal"),
        "dia": document.getElementById("botaoCalendarioDia")
    };

    Object.values(botoes).forEach(botao => botao?.classList.remove("esconderBotao"));
    botoes[visualizacaoAtual]?.classList.add("esconderBotao");
}

function cabecalhoNomesDiaSemana() {
    const cabecalhoCalendario = document.getElementById("cabecalhoCalendario");
    cabecalhoCalendario.innerHTML = "";

    if (modoVisualizacao === "dia") {
        const diaAtual = dataAtualCalendario.getDay();
        cabecalhoCalendario.style.gridTemplateColumns = "1fr";
        criarDivCabecalho(cabecalhoCalendario, nomesDiasSemana[diaAtual]);
    } else {
        cabecalhoCalendario.style.gridTemplateColumns = "repeat(7, 1fr)";
        nomesDiasSemana.forEach(nome => criarDivCabecalho(cabecalhoCalendario, nome));
    }
}

function criarDivCabecalho(container, texto) {
    const diaDiv = document.createElement("div");
    diaDiv.classList.add("cardCabecalhoCalendario");
    diaDiv.textContent = texto;
    container.appendChild(diaDiv);
}

// ========== RENDERIZAÇÃO DE TAREFAS ==========
function renderizarTarefas() {
    // Limpar tarefas existentes
    document.querySelectorAll('.tarefa-evento').forEach(tarefa => tarefa.remove());

    // Verifica se as tarefas foram carregadas
    const tarefasCarregadas = typeof obterTarefas === 'function' ? obterTarefas() : [];

    tarefasCarregadas.forEach(tarefa => {
        const dataTarefa = new Date(tarefa.data + 'T' + tarefa.hora.replace('Z', ''));
        const corPrioridade = typeof obterCorPrioridade === 'function' ?
            obterCorPrioridade(tarefa.prioridade) : "#4CAF50";
        const estiloRealizada = tarefa.realizada ? "text-decoration: line-through; opacity: 0.7;" : "";

        const renderizadores = {
            "mes": () => renderizarTarefaMensal(tarefa, dataTarefa, corPrioridade, estiloRealizada),
            "semana": () => renderizarTarefaSemanalDiaria(tarefa, dataTarefa, corPrioridade, estiloRealizada),
            "dia": () => renderizarTarefaSemanalDiaria(tarefa, dataTarefa, corPrioridade, estiloRealizada)
        };

        renderizadores[modoVisualizacao]?.();
    });
}

function renderizarTarefaMensal(tarefa, dataTarefa, corPrioridade, estiloRealizada) {
    const dia = dataTarefa.getDate();
    const mes = dataTarefa.getMonth();
    const ano = dataTarefa.getFullYear();
    const anoAtual = dataAtualCalendario.getFullYear();
    const mesAtual = dataAtualCalendario.getMonth();

    if (mes === mesAtual && ano === anoAtual) {
        const celulas = document.querySelectorAll('.cardDiaCalendario');
        const primeiroDiaMes = new Date(ano, mes, 1).getDay();
        const indexCelula = primeiroDiaMes + dia - 1;

        if (celulas[indexCelula]) {
            adicionarTarefaMensal(celulas[indexCelula], tarefa, dataTarefa, corPrioridade, estiloRealizada);
        }
    }
}

function renderizarTarefaSemanalDiaria(tarefa, dataTarefa, corPrioridade, estiloRealizada) {
    const dataFormatada = typeof formatarData === 'function' ?
        formatarData(dataTarefa) :
        `${dataTarefa.getFullYear()}-${(dataTarefa.getMonth() + 1).toString().padStart(2, '0')}-${dataTarefa.getDate().toString().padStart(2, '0')}`;
    const horaFormatada = dataTarefa.getHours().toString().padStart(2, '0') + ":00";

    const celula = document.querySelector(`.celula-hora-diaria[data-data="${dataFormatada}"][data-hora="${horaFormatada}"]`);
    if (celula) {
        adicionarTarefaNaCelula(celula, tarefa, corPrioridade, estiloRealizada);
    }
}

function adicionarTarefaMensal(celula, tarefa, dataTarefa, corPrioridade, estiloRealizada) {
    let container = celula.querySelector('.tarefas-container-mes');
    if (!container) {
        container = document.createElement('div');
        container.classList.add('tarefas-container-mes');
        celula.appendChild(container);
    }

    const tarefaElemento = document.createElement('div');
    tarefaElemento.classList.add('tarefa-evento', 'tarefa-item-mes');
    tarefaElemento.setAttribute('data-id-tarefa', tarefa.id);
    tarefaElemento.style.backgroundColor = corPrioridade;

    const horaExibicao = dataTarefa.getHours().toString().padStart(2, '0') + ":00";
    const iconeRecorrente = tarefa.recorrencia !== "Não repete" ? '<i class="icone-recorrente">🔄</i>' : '';

    tarefaElemento.innerHTML = `
            <span style="${estiloRealizada}">${horaExibicao} ${tarefa.titulo}</span>
            ${iconeRecorrente}
        `;

    tarefaElemento.addEventListener('click', () => {
        if (typeof mostrarDetalhesTarefa === 'function') {
            mostrarDetalhesTarefa(tarefa);
        }
    });
    container.appendChild(tarefaElemento);
}

function adicionarTarefaNaCelula(celula, tarefa, corPrioridade, estiloRealizada) {
    let container = celula.querySelector('.tarefas-container-celula');
    if (!container) {
        container = document.createElement('div');
        container.classList.add('tarefas-container-celula');
        celula.appendChild(container);
    }

    const tarefaElemento = document.createElement('div');
    tarefaElemento.classList.add('tarefa-evento');

    if (modoVisualizacao === "dia") {
        tarefaElemento.classList.add('tarefa-evento-diaria');
    } else if (modoVisualizacao === "semana") {
        tarefaElemento.classList.add('tarefa-evento-semanal');
    }

    tarefaElemento.setAttribute('data-id-tarefa', tarefa.id);
    tarefaElemento.style.backgroundColor = corPrioridade;

    const iconeRecorrente = tarefa.recorrencia !== "Não repete" ? '<i class="icone-recorrente">🔄</i>' : '';
    tarefaElemento.innerHTML = `
            <span style="${estiloRealizada}">${tarefa.titulo}</span>
            ${iconeRecorrente}
        `;

    container.appendChild(tarefaElemento);
}

// ========== EVENT LISTENERS ==========
function configurarEventListeners() {
    document.getElementById("hoje")?.addEventListener("click", irParaHoje);
    document.getElementById("avancar")?.addEventListener("click", () => navegarCalendario(1));
    document.getElementById("voltar")?.addEventListener("click", () => navegarCalendario(-1));

    document.getElementById("botaoCalendarioSemanal")?.addEventListener("click", () => alterarModoVisualizacao("semana"));
    document.getElementById("botaoCalendarioDia")?.addEventListener("click", () => alterarModoVisualizacao("dia"));
    document.getElementById("botaoCalendarioMes")?.addEventListener("click", () => alterarModoVisualizacao("mes"));
}

// ========== ESTILOS CSS ==========
function adicionarEstilosTarefas() {
    const estilosTarefas = document.createElement('style');
    estilosTarefas.textContent = `
            .tarefa-evento {
                padding: 2px 5px;
                margin: 2px 0;
                border-radius: 3px;
                color: white;
                font-size: 12px;
                cursor: pointer; 
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: calc(100% - 10px);
                box-sizing: border-box;
            }
            
            .tarefa-item-mes {
                width: 100%;
                text-align: left;
                padding: 1px 3px;
                margin: 1px 0;
                font-size: 10px;
            }
            
            .tarefas-container-mes {
                display: flex;
                flex-direction: column;
                width: 100%;
                max-height: calc(100% - 20px);
                overflow-y: auto;
                margin-top: 2px;
            }
            
            .icone-recorrente {
                font-size: 10px;
                margin-left: 3px;
            }
            
            .visualizacao-semanal .celula-hora-diaria,
            .visualizacao-diaria .celula-hora-diaria {
                height: auto;
                min-height: 30px;
                position: relative;
                padding-right: 5px;
            }
            
            .visualizacao-diaria .celula-hora-diaria {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .visualizacao-diaria .celula-hora-diaria .indicador-hora-diaria {
                align-self: flex-start;
                margin-bottom: 3px; 
            }
            
            .visualizacao-diaria .tarefa-evento {
                width: 100%;
                max-width: calc(100% - 5px);
            }
            
            .tarefas-container-celula {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 2px;
                margin-top: 2px;
            }
            
            .tarefa-evento[style*="background-color: #B71C1C"],
            .tarefa-evento[style*="background-color: #F44336"] {
                color: white;
            }
            
            .tarefa-evento[style*="background-color: #FFEB3B"] {
                color: #212121;
            }
            
            .tarefa-evento[style*="background-color: #4CAF50"],
            .tarefa-evento[style*="background-color: #8BC34A"] {
                color: white;
            }
        `;
    document.head.appendChild(estilosTarefas);
}

// Função para criar o modal de tarefa
function criarModalTarefa() {
    // Verificar se o modal já existe
    let modalExistente = document.getElementById("modalTarefa");
    if (modalExistente) {
        // Se o modal já existe, remover para recriar limpo
        modalExistente.remove();
    }

    // Criar elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'modalTarefa';
    modalDiv.tabIndex = '-1';
    modalDiv.setAttribute('aria-labelledby', 'modalTarefaLabel');
    modalDiv.setAttribute('aria-hidden', 'true');

    modalDiv.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTarefaLabel">Nova Tarefa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <form id="formTarefa">
                        <div class="mb-3">
                            <label for="tituloTarefa" class="form-label">Título</label>
                            <input type="text" class="form-control" id="tituloTarefa" required>
                        </div>
                        <div class="row mb-3">
                            <div class="col">
                                <label for="dataTarefa" class="form-label">Data</label>
                                <input type="date" class="form-control" id="dataTarefa" required>
                            </div>
                            <div class="col">
                                <label for="horaTarefa" class="form-label">Horário</label>
                                <input type="time" class="form-control" id="horaTarefa" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="prioridadeTarefa" class="form-label">Prioridade</label>
                            <select class="form-select" id="prioridadeTarefa" required>
                                <option value="Muito baixa">Muito baixa</option>
                                <option value="Baixa">Baixa</option>
                                <option value="Média" selected>Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Muito alta">Muito alta</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="recorrenciaTarefa" class="form-label">Recorrência</label>
                            <select class="form-select" id="recorrenciaTarefa" required>
                                <option value="Não repete" selected>Não repete</option>
                                <option value="Diariamente">Diariamente</option>
                                <option value="Semanalmente">Semanalmente</option>
                                <option value="Mensalmente">Mensalmente</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="descricaoTarefa" class="form-label">Descrição</label>
                            <textarea class="form-control" id="descricaoTarefa" rows="3"></textarea>
                        </div>
                    </form>
                    <div id="areaBotaoConcluido" class="d-none">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="tarefaRealizada">
                            <label class="form-check-label" for="tarefaRealizada">Tarefa realizada</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-danger" id="btnExcluirTarefa">Excluir</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" id="btnSalvarTarefa">Salvar</button>
                </div>
            </div>
        </div>
    `;

    // Adicionar o modal ao corpo do documento
    document.body.appendChild(modalDiv);

    instanciaModalTarefa = new bootstrap.Modal(document.getElementById('modalTarefa'));

    // Configurar eventos
    const btnSalvar = document.getElementById('btnSalvarTarefa');
    const btnExcluir = document.getElementById('btnExcluirTarefa');
    const formTarefa = document.getElementById('formTarefa');

    btnSalvar.addEventListener('click', () => {
        console.log("Botão salvar clicado");
        if (formTarefa.checkValidity()) {
            salvarTarefa();
            modal.hide();
        } else {
            formTarefa.reportValidity();
        }
    });

    btnExcluir.addEventListener('click', () => {
        if (tarefaEditandoId !== null) {
            excluirTarefa(tarefaEditandoId);
            modal.hide();
        }
    });

    // Ajustar estado do botão excluir quando o modal é aberto
    document.getElementById('modalTarefa').addEventListener('show.bs.modal', function (event) {
        const botaoExcluir = document.getElementById('btnExcluirTarefa');
        const areaBotaoConcluido = document.getElementById('areaBotaoConcluido');

        if (tarefaEditandoId !== null) {
            document.getElementById('modalTarefaLabel').textContent = 'Editar Tarefa';
            botaoExcluir.classList.remove('d-none');
            areaBotaoConcluido.classList.remove('d-none');
        } else {
            document.getElementById('modalTarefaLabel').textContent = 'Nova Tarefa';
            botaoExcluir.classList.add('d-none');
            areaBotaoConcluido.classList.add('d-none');
        }
    });
}

// Função para abrir o modal para adicionar uma nova tarefa em uma data específica
function abrirModalNovaTarefa(data, hora = '08:00') {
    tarefaEditandoId = null; // Indicar que estamos criando uma nova tarefa

    // Garantir que o modal seja criado ou recriado para ter os listeners corretos
    criarModalTarefa();

    // Formatar a data para o input date
    const dataFormatada = formatarDataParaInput(data);

    // Limpar e configurar o formulário para uma nova tarefa
    document.getElementById('tituloTarefa').value = '';
    document.getElementById('dataTarefa').value = dataFormatada;
    document.getElementById('horaTarefa').value = hora + ':00';
    document.getElementById('prioridadeTarefa').value = 'Média';
    document.getElementById('descricaoTarefa').value = '';
    document.getElementById('recorrenciaTarefa').value = 'Não repete';

    // Esconder botão de excluir para novas tarefas
    document.getElementById('btnExcluirTarefa').classList.add('d-none');

    instanciaModalTarefa?.show();
}

// Função para abrir o modal de edição de tarefa
function abrirModalEditarTarefa(idTarefa) {
    const tarefa = tarefas.find(t => t.id === idTarefa);
    if (!tarefa) return;

    // Garantir que o modal seja criado ou recriado para ter os listeners corretos
    criarModalTarefa();

    tarefaEditandoId = idTarefa; // Armazenar o ID da tarefa que está sendo editada

    // Preencher o formulário com os dados da tarefa
    document.getElementById('tituloTarefa').value = tarefa.titulo;
    document.getElementById('dataTarefa').value = tarefa.data;
    document.getElementById('horaTarefa').value = tarefa.hora;
    document.getElementById('prioridadeTarefa').value = tarefa.prioridade;
    document.getElementById('descricaoTarefa').value = tarefa.descricao || '';
    document.getElementById('tarefaRealizada').checked = tarefa.realizada || false;
    document.getElementById('recorrenciaTarefa').value = tarefa.recorrencia || 'Não repete';

    // Mostrar botão de excluir para edição de tarefas
    document.getElementById('btnExcluirTarefa').classList.remove('d-none');
    document.getElementById('areaBotaoConcluido').classList.remove('d-none');

    instanciaModalTarefa?.show();
}


function salvarTarefa() { 
    const titulo = document.getElementById('tituloTarefa').value; 
    const data = document.getElementById('dataTarefa').value; 
    const hora = document.getElementById('horaTarefa').value; 
    const prioridade = document.getElementById('prioridadeTarefa').value; 
    const descricao = document.getElementById('descricaoTarefa').value; 
    const recorrencia = document.getElementById('recorrenciaTarefa').value; 
    const realizada = document.getElementById('tarefaRealizada')?.checked || false; 

    const userId = typeof currentLoggedInUserId !== 'undefined' ? currentLoggedInUserId : "defaultUser"; 

    if (tarefaEditandoId !== null) { 
        const index = tarefas.findIndex(t => t.id === tarefaEditandoId); 
        const tarefaEditada = { 
            ...tarefas[index], 
            titulo, 
            data, 
            hora, 
            prioridade, 
            descricao, 
            recorrencia, 
            realizada 
        };

        fetch(`http://localhost:3000/tarefas/${tarefaEditandoId}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(tarefaEditada) 
        })
            .then(response => response.json()) 
            .then(() => {
                recarregarTarefas(); 
                renderizarTarefas(); 
                if (instanciaModalTarefa) instanciaModalTarefa.hide(); 
                tarefaEditandoId = null; 
            })
            .catch(error => console.error('Erro ao editar tarefa:', error)); 

    } else {
        
        const novaTarefa = { 
            titulo, 
            data, 
            hora, 
            prioridade, 
            descricao, 
            realizada: false, 
            recorrencia, 
            exp: 0.5, 
            sequencia: 0, 
            userId 
        };

        fetch('http://localhost:3000/tarefas', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(novaTarefa) 
        })
            .then(response => response.json()) 
            .then(() => {
                if (recorrencia !== "Não repete") { 
                    
                    gerarTarefasRecorrentes({ ...novaTarefa, data, userId }); 
                }
                recarregarTarefas(); 
                renderizarTarefas(); 
                if (instanciaModalTarefa) instanciaModalTarefa.hide(); 
            })
            .catch(error => console.error('Erro ao salvar nova tarefa:', error)); 
    }
}

function gerarTarefasRecorrentes(tarefaBase) { 
    const dataOriginal = new Date(tarefaBase.data); 
    const ano = dataOriginal.getFullYear(); 
    const mes = dataOriginal.getMonth(); 
    const dia = dataOriginal.getDate(); 
    const tarefasAGerar = []; 

    if (tarefaBase.recorrencia === 'Diariamente') { 
        const diasNoMes = new Date(ano, mes + 1, 0).getDate(); 
        for (let d = 1; d <= diasNoMes; d++) { 
            if (d === dia) continue; 
            const novaData = new Date(ano, mes, d); 
            tarefasAGerar.push({ ...tarefaBase, data: formatarDataParaInput(novaData), userId: tarefaBase.userId }); 
        }
    } else if (tarefaBase.recorrencia === 'Semanalmente') { 
        const diaSemanaOriginal = dataOriginal.getDay(); 
        const ultimoDiaMes = new Date(ano, mes + 1, 0); 

        let dataAtual = new Date(dataOriginal); 

        while (true) { 
            dataAtual.setDate(dataAtual.getDate() + 7); 

            if (dataAtual > ultimoDiaMes) break; 

            if (dataAtual.getDay() === diaSemanaOriginal) { 
                tarefasAGerar.push({ 
                    ...tarefaBase, 
                    data: formatarDataParaInput(dataAtual), 
                    userId: tarefaBase.userId 
                });
            }
        }
    } else if (tarefaBase.recorrencia === 'Mensalmente') { 
        for (let m = 0; m < 12; m++) { 
            if (m === mes) continue; 
            const novaData = new Date(ano, m, dia); 
            if (novaData.getDate() === dia) { 
                tarefasAGerar.push({ ...tarefaBase, data: formatarDataParaInput(novaData), userId: tarefaBase.userId }); 
            }
        }
    }

    // Enviar todas as tarefas geradas
    tarefasAGerar.forEach(tarefa => { 
        delete tarefa.id; 
        tarefa.realizada = false; 

        fetch('http://localhost:3000/tarefas', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(tarefa) 
        }).catch(err => console.error('Erro ao criar tarefa recorrente:', err)); 
    });
}

function excluirTarefa(idTarefa) {
    fetch(`http://localhost:3000/tarefas/${idTarefa}`, {
        method: 'DELETE'
    })
        .then(() => {
            recarregarTarefas();
            if (instanciaModalTarefa) instanciaModalTarefa.hide();
        })

        .catch(error => console.error('Erro ao excluir tarefa:', error));
}

// Função auxiliar para formatar a data para o input date (YYYY-MM-DD)
function formatarDataParaInput(data) {
    const d = new Date(data);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Função para exibir detalhes da tarefa quando clicada
function mostrarDetalhesTarefa(tarefa) {
    abrirModalEditarTarefa(tarefa.id);
}

// Adicionar evento de clique nas células do calendário
function configurarEventosCalendario() {
    // Configurar eventos para calendário mensal
    document.querySelectorAll('.cardDiaCalendario').forEach(celula => {
        // Remover qualquer evento de clique existente para evitar duplicação
        celula.removeEventListener('dblclick', celula.eventoCliqueCalendario);

        // Adicionar novo evento de duplo clique
        celula.eventoCliqueCalendario = function (e) {
            // Ignorar se o clique foi em uma tarefa existente
            if (e.target.closest('.tarefa-evento')) return;

            // Obter o número do dia clicado
            const diaTexto = this.querySelector('div')?.textContent;
            if (!diaTexto || isNaN(parseInt(diaTexto))) return;

            const dia = parseInt(diaTexto);
            const ano = dataAtualCalendario.getFullYear();
            const mes = dataAtualCalendario.getMonth();

            // Verificar se o dia pertence ao mês atual
            // Se o dia tem cor cinza (dias do mês anterior ou próximo), não adicionar tarefa
            if (this.querySelector('div[style*="color: gray"]')) return;

            const data = new Date(ano, mes, dia);
            abrirModalNovaTarefa(data);
        };

        celula.addEventListener('dblclick', celula.eventoCliqueCalendario);
    });

    // Configurar eventos para calendário diário e semanal
    document.querySelectorAll('.celula-hora-diaria').forEach(celula => {
        // Remover qualquer evento de clique existente para evitar duplicação
        celula.removeEventListener('dblclick', celula.eventoCliqueCalendario);

        // Adicionar novo evento de duplo clique
        celula.eventoCliqueCalendario = function (e) {
            // Ignorar se o clique foi em uma tarefa existente
            if (e.target.closest('.tarefa-evento')) return;

            // Obter a data e hora da célula
            const dataStr = this.dataset.data;
            const horaStr = this.dataset.hora;

            if (!dataStr) return;

            const data = new Date(dataStr);
            abrirModalNovaTarefa(data, horaStr?.split(':')[0] || '08');
        };

        celula.addEventListener('dblclick', celula.eventoCliqueCalendario);
    });

    // Configurar cliques em tarefas existentes
    document.querySelectorAll('.tarefa-evento').forEach(tarefaEl => {
        tarefaEl.addEventListener('click', function (e) {
            e.stopPropagation(); // Impedir propagação do evento

            const idTarefa = parseInt(this.getAttribute('data-id-tarefa'));
            if (!isNaN(idTarefa)) {
                const tarefa = tarefas.find(t => t.id === idTarefa);
                if (tarefa) {
                    mostrarDetalhesTarefa(tarefa);
                }
            }
        });
    });
}

// Atualizar a função original de renderização de calendário para adicionar os eventos de clique
const atualizarCalendarioOriginal2 = atualizarCalendario;
atualizarCalendario = function () {
    atualizarCalendarioOriginal2();
    // Adicionar um pequeno atraso para garantir que o DOM foi atualizado
    setTimeout(() => {
        configurarEventosCalendario();
    }, 100);
};

// Chamar renderizarTarefas para exibir as tarefas já existentes
renderizarTarefas();