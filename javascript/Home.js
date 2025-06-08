document.addEventListener('DOMContentLoaded', () => {
    // ======================================================
    // Lógica do Menu Hamburger Responsivo (mantido)
    // ======================================================
    const menuIcon = document.querySelector('.menu-icon');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    let overlay = document.querySelector('.overlay');

    // Cria o overlay se não existir
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('overlay');
        body.appendChild(overlay);
    }

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('no-scroll'); // Impede o scroll do body
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('no-scroll'); // Restaura o scroll do body
    }

    // Event listeners para o menu e overlay
    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', openSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Fecha a sidebar em telas maiores
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    // ======================================================
    // Lógica do Pop-up (Modal) para Abrir Novo Chamado
    // ======================================================
    const openNewCallBtn = document.querySelector('.open-new-call');
    const newCallModal = document.getElementById('newCallModal');
    const closeButton = newCallModal.querySelector('.close-button');
    const cancelBtn = newCallModal.querySelector('.cancel-btn');
    const newCallForm = document.getElementById('newCallForm');
    const callerNameInput = document.getElementById('callerName');
    const callDateInput = document.getElementById('callDate');
    const urgencyLevelInput = document.getElementById('urgencyLevel'); // Novo seletor para o nível de urgência
    const callsCountElement = document.querySelector('.calls-count'); // Elemento para exibir a contagem de chamados abertos

    function openModal() {
        newCallModal.classList.add('active'); // Adiciona classe 'active' para mostrar o modal
        body.classList.add('no-scroll');

        // Preenche campos Nome e Data automaticamente
        callerNameInput.value = 'Usuário Suporte';
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        callDateInput.value = `${day}/${month}/${year}`;

        // Limpa o formulário, mas mantém os campos readonly preenchidos
        newCallForm.reset();
        callerNameInput.value = 'Usuário Suporte'; // Garante que permaneça após reset
        callDateInput.value = `${day}/${month}/${year}`; // Garante que permaneça após reset
    }

    function closeModal() {
        newCallModal.classList.remove('active'); // Remove classe 'active' para esconder o modal
        body.classList.remove('no-scroll');
    }

    // Event listeners para o botão de abrir e fechar o modal
    if (openNewCallBtn) {
        openNewCallBtn.addEventListener('click', openModal);
    }
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    // Fecha o modal ao clicar fora dele
    if (newCallModal) {
        newCallModal.addEventListener('click', (e) => {
            if (e.target === newCallModal) { // Verifica se o clique foi no overlay do modal
                closeModal();
            }
        });
    }

    // ======================================================
    // Lógica para Chamados Recentes e Detalhes
    // ======================================================
    const callsList = document.querySelector('.calls-list');

    // Função para gerar o próximo código de chamado sequencial (#CH0001, #CH0002, ...)
    function generateNextCallCode() {
        let lastCallNumber = parseInt(localStorage.getItem('lastCallNumber') || '0', 10); // Base 10
        lastCallNumber++;
        localStorage.setItem('lastCallNumber', lastCallNumber.toString());
        // Formata o número para ter 4 dígitos (ex: 1 -> 0001)
        const formattedNumber = String(lastCallNumber).padStart(4, '0');
        return `#CH${formattedNumber}`;
    }

    // Função para atualizar a contagem de chamados abertos no card
    function updateCallsCount() {
        let storedCalls = localStorage.getItem('allCalls'); // Usar 'allCalls'
        let allCalls = storedCalls ? JSON.parse(storedCalls) : [];
        const openCalls = allCalls.filter(call => call.status === 'Aberto');
        if (callsCountElement) {
            callsCountElement.textContent = openCalls.length;
        }
    }

    // Função para renderizar os chamados na lista de "Chamados Recentes"
    function renderCalls() {
        callsList.innerHTML = ''; // Limpa a lista existente

        let storedCalls = localStorage.getItem('allCalls'); // Usar 'allCalls'
        let allCalls = storedCalls ? JSON.parse(storedCalls) : [];

        // Filtra para mostrar APENAS chamados com status "Aberto" na lista principal
        const openCalls = allCalls.filter(call => call.status === 'Aberto');

        if (openCalls.length === 0) {
            callsList.innerHTML = '<li style="text-align: center; color: var(--secondary-text); padding: 15px;">Nenhum chamado aberto no momento.</li>';
        } else {
            // Ordena os chamados pelo código (presumindo que o código crescente implica ordem de criação)
            openCalls.sort((a, b) => a.code.localeCompare(b.code));

            openCalls.forEach(call => {
                const callItem = document.createElement('li');
                // As classes de status agora correspondem ao seu CSS ('aberto', 'em-andamento', 'fechado')
                const statusClass = call.status.toLowerCase().replace(' ', '-');
                callItem.classList.add('call', `status-${statusClass}`);
                
                // Conteúdo do item do chamado, agora com link completo e nível de urgência
                callItem.innerHTML = `
                    <a href="call-details.html?code=${call.code}">
                        <span class="call-icon material-icons">help_outline</span>
                        <div class="call-details">
                            <span class="call-description">${call.reason}</span>
                            <span class="call-date">${call.code} - ${call.date} - Urgência: ${call.urgencyLevel}</span>
                        </div>
                        <span class="call-status ${statusClass}">${call.status}</span>
                    </a>
                `;

                callsList.appendChild(callItem);
            });
        }
        updateCallsCount(); // Atualiza a contagem no card após renderizar
    }

    // Carrega os chamados iniciais ao carregar a página
    renderCalls();
    updateCallsCount(); // Garante que a contagem inicial seja correta

    // Event listener para o envio do formulário de novo chamado
    if (newCallForm) {
        newCallForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            // Coleta os dados do formulário
            const callerName = callerNameInput.value;
            const callDate = callDateInput.value;
            const department = document.getElementById('department').value;
            const responsible = document.getElementById('responsible').value; // Pega do input text
            const urgencyLevel = urgencyLevelInput.value; // Pega o valor do novo campo de urgência
            const callReason = document.getElementById('callReason').value;

            const callCode = generateNextCallCode(); // Gera o novo código sequencial

            // Cria o objeto do chamado
            const callDetails = {
                code: callCode,
                name: callerName,
                date: callDate,
                department: department,
                responsible: responsible,
                urgencyLevel: urgencyLevel, // Adiciona o nível de urgência
                reason: callReason,
                status: 'Aberto' // Novo chamado sempre começa como 'Aberto'
            };

            // Recupera todos os chamados existentes, adiciona o novo e salva de volta
            let storedCalls = localStorage.getItem('allCalls');
            let allCalls = storedCalls ? JSON.parse(storedCalls) : [];
            allCalls.push(callDetails);
            localStorage.setItem('allCalls', JSON.stringify(allCalls)); // Salvar como 'allCalls'

            console.log('Novo Chamado Registrado:', callDetails);
            alert(`Chamado Aberto com Sucesso!\nCódigo do Chamado: ${callCode}\nDetalhes: ${callReason}\nUrgência: ${urgencyLevel}`);

            closeModal(); // Fecha o modal
            renderCalls(); // Atualiza a lista de chamados na interface (apenas abertos)
            updateCallsCount(); // Garante que a contagem seja atualizada
        });
    }

    // Lógica para o botão "Ver todos os Chamados" (exemplo)
    const viewAllCallsBtn = document.querySelector('.view-all-calls');
    if (viewAllCallsBtn) {
        viewAllCallsBtn.addEventListener('click', () => {
            // Em uma aplicação real, aqui você redirecionaria para uma tela de listagem completa
            alert('Funcionalidade "Ver todos os Chamados" seria implementada para exibir todos os chamados (abertos, em andamento, fechados)!');
            // Exemplo: window.location.href = 'all-calls.html';
        });
    }
});