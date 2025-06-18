// ========== CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ==========
const urlTarefas = 'http://localhost:3000/tarefas';
let tarefas = [];
let currentLoggedInUserId = localStorage.getItem('currentUserId'); 

if (!currentLoggedInUserId) { 
    window.location.href = 'login.html'; 
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
    carregaDadosJSONServer(() => {
        if (typeof atualizarCalendario === 'function') {
            atualizarCalendario();
        }
    });
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.classList.add('btn', 'btn-danger', 'ms-3'); 
    logoutBtn.addEventListener('click', logout);
    document.querySelector('header').appendChild(logoutBtn); 
});

function logout() { 
    localStorage.removeItem('currentUserId'); 
    window.location.href = 'login.html'; 
}

// ========== CARREGAMENTO DE DADOS ==========
function carregaDadosJSONServer(callback) {
    fetch(`${urlTarefas}?userId=${currentLoggedInUserId}`) 
        .then(response => response.json()) 
        .then(dados => {
            tarefas = dados; 

            if (typeof htmlSequenciaTarefas === 'function') {
                htmlSequenciaTarefas(); 
            }
            callback?.(); 
        })
        .catch(error => {
            tarefas = []; 
            console.error('Erro ao carregar tarefas:', error); 
        });
}

function recarregarTarefas() {
    carregaDadosJSONServer(() => {
        if (typeof atualizarCalendario === 'function') {
            atualizarCalendario(); 
        }
    });
}

// ========== FUNÇÕES UTILITÁRIAS PARA TAREFAS ==========
function obterCorPrioridade(prioridade) { 
    const cores = { 
        "Muito alta": "#B71C1C", 
        "Alta": "#F44336", 
        "Média": "#d5c000", 
        "Baixa": "#4CAF50", 
        "Muito baixa": "#8BC34A" 
    };
    return cores[prioridade] || "#4CAF50"; 
}

function formatarData(data) { 
    const ano = data.getFullYear(); 
    const mes = (data.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = data.getDate().toString().padStart(2, '0'); 
    return `${ano}-${mes}-${dia}`; 
}

// ========== FUNÇÕES DE ACESSO AOS DADOS ==========
function obterTarefas() { 
    return tarefas; 
}

function obterTarefaPorId(id) { 
    return tarefas.find(tarefa => tarefa.id === id); 
}

// Função para mostrar detalhes da tarefa (se necessário)
function mostrarDetalhesTarefa(tarefa) { 
    abrirModalEditarTarefa(tarefa.id); 
}