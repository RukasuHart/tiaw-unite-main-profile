document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerModalElement = document.getElementById('registerModal'); 
    const registerIdDisplay = document.getElementById('registerIdDisplay');
    const registerIdInput = document.getElementById('registerId');

    // Função para buscar o último ID e gerar o próximo
    async function getNextUserId() {
        try {
            const response = await fetch('http://localhost:3000/db');
            const db = await response.json();
            let lastUserId = db.lastUserId || 0;
            const newUserIdNumber = lastUserId + 1;
            return `user${newUserIdNumber}`;
        } catch (error) {
            console.error('Erro ao obter o último ID do usuário:', error);
            return `user${Date.now()}`; 
        }
    }

    
    async function updateLastUserId(newNumber) {
        try {
            const response = await fetch('http://localhost:3000/db');
            const db = await response.json();

            db.lastUserId = newNumber;

            await fetch('http://localhost:3000/db', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(db)
            });
        } catch (error) {
            console.error('Erro ao atualizar lastUserId:', error);
        }
    }

    
    registerModalElement.addEventListener('show.bs.modal', async () => {
        const generatedId = await getNextUserId();
        registerIdDisplay.textContent = generatedId; 
        registerIdInput.value = generatedId;       
    });

  
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginUsername = document.getElementById('loginUsername').value; 
        const loginPassword = document.getElementById('loginPassword').value;

        try {
            
            const response = await fetch(`http://localhost:3000/users?name=${loginUsername}&senha=${loginPassword}`);
            const users = await response.json();

            if (users.length > 0) {
                localStorage.setItem('currentUserId', users[0].id);
                window.location.href = 'index.html';
            } else {
                alert('Nome de usuário ou senha inválidos.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const registerUsername = document.getElementById('registerUsername').value;
        const userId = registerIdInput.value;
        const registerPassword = document.getElementById('registerPassword').value;
        const profilePic = "img/man.png";

        try {
            const checkNameResponse = await fetch(`http://localhost:3000/users?name=${registerUsername}`);
            const existingUsersByName = await checkNameResponse.json();

            if (existingUsersByName.length > 0) {
                alert('Este nome de usuário já está em uso. Por favor, escolha outro.');
                return;
            }

            const newUser = {
                id: userId,
                senha: registerPassword,
                name: registerUsername,
                profilePic: profilePic,
                xp: 0,
                level: 1
            };

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                const newUserIdNumber = parseInt(userId.replace('user', ''));
                await updateLastUserId(newUserIdNumber);

                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                localStorage.setItem('currentUserId', newUser.id);
                window.location.href = 'index.html';
            } else {
                alert('Erro ao cadastrar usuário. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Ocorreu um erro ao tentar cadastrar. Tente novamente.');
        }
    });
});