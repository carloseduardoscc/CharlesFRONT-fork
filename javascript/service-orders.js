document.addEventListener('DOMContentLoaded', () => {
    const serviceOrdersTableBody = document.getElementById('serviceOrdersTableBody');
    const serviceOrderSearchInput = document.getElementById('serviceOrderSearch');
    const serviceOrderStatusFilterSelect = document.getElementById('serviceOrderStatusFilter');
    const noServiceOrdersMessage = document.getElementById('noServiceOrdersMessage');
    
    // ======================================================
    // Lógica do Menu Hamburger (reutilizar do script.js ou tickets-and-transfer.js)
    // ======================================================
    // Certifique-se de que a lógica para o menu hamburger e overlay esteja
    // em um único arquivo JS que é carregado em todas as páginas (ex: script.js)
    // Ou, se você copiou para tickets-and-transfer.js, copie novamente para cá.
    // Para evitar duplicação de código e potencial conflito, o ideal é ter
    // essa lógica em um script.js global.

    // Exemplo (se não estiver em script.js):
    const menuIcon = document.querySelector('.menu-icon');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    let overlay = document.querySelector('.overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('overlay');
        body.appendChild(overlay);
    }

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('no-scroll');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('no-scroll');
    }

    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', openSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    // ======================================================
    // Lógica do Pop-up (Modal) para Abrir Novo Chamado/OS (reutilizada)
    // ======================================================
    // Assume que a funcionalidade do modal de "Novo Ticket" é a mesma para "Nova OS"
    // e que ele é chamado por 'open-new-call-sidebar' ou um novo botão 'new-service-order-btn'
    const newCallModal = document.getElementById('newCallModal');
    const closeButton = newCallModal.querySelector('.close-button');
    const cancelBtn = newCallModal.querySelector('.cancel-btn');
    const newCallForm = document.getElementById('newCallForm');
    const callerNameInput = document.getElementById('callerName');
    const callDateInput = document.getElementById('callDate');
    const urgencyLevelInput = document.getElementById('urgencyLevel');

    // Botão "Abrir Chamado" na sidebar
    const openNewCallSidebarBtn = document.querySelector('.open-new-call-sidebar');
    // Se você adicionar um botão "Nova OS" na página, adicione seu seletor aqui
    // const newServiceOrderBtn = document.querySelector('.new-service-order-btn'); 

    function openModal() {
        newCallModal.classList.add('active');
        body.classList.add('no-scroll');

        callerNameInput.value = 'John Owner'; // Ou o nome do usuário logado
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        callDateInput.value = `${day}/${month}/${year}`;

        newCallForm.reset();
        callerNameInput.value = 'John Owner'; // Resetando também
        callDateInput.value = `${day}/${month}/${year}`;
        // Altere o título do modal se for uma Nova Ordem de Serviço
        newCallModal.querySelector('h2').textContent = 'NOVA ORDEM DE SERVIÇO';
    }

    function closeModal() {
        newCallModal.classList.remove('active');
        body.classList.remove('no-scroll');
        // Opcional: Resetar o título do modal se ele for genérico
        newCallModal.querySelector('h2').textContent = 'NOVO TICKET'; 
    }

    // Event Listeners para abrir/fechar o modal
    if (openNewCallSidebarBtn) { 
        openNewCallSidebarBtn.addEventListener('click', openModal);
    }
    // if (newServiceOrderBtn) { // Se você adicionar o botão "Nova OS" na página
    //     newServiceOrderBtn.addEventListener('click', openModal);
    // }
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    if (newCallModal) {
        newCallModal.addEventListener('click', (e) => {
            if (e.target === newCallModal) {
                closeModal();
            }
        });
    }

    // Função para gerar o próximo código de Ordem de Serviço sequencial (OS-0001, OS-0002, ...)
    function generateNextOrderCode() {
        let lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
        lastOrderNumber++;
        localStorage.setItem('lastOrderNumber', lastOrderNumber.toString());
        const formattedNumber = String(lastOrderNumber).padStart(4, '0');
        return `OS-${formattedNumber}`;
    }

    // ======================================================
    // Lógica para Listagem, Busca e Filtro de Ordens de Serviço
    // ======================================================

    let allServiceOrders = []; // Variável para armazenar todas as ordens de serviço

    // Por enquanto, vamos carregar do 'allCalls' e adaptar.
    // Idealmente, ordens de serviço teriam sua própria estrutura e chave no localStorage.
    function loadServiceOrders() {
        let storedCalls = localStorage.getItem('allCalls'); // Usando 'allCalls' como base
        let baseCalls = storedCalls ? JSON.parse(storedCalls) : [];

        // Mapeia chamados existentes para o formato de Ordem de Serviço
        allServiceOrders = baseCalls.map(call => ({
            orderCode: call.orderCode || generateNextOrderCode(), // Gera novo se não tiver
            ticketCode: call.code, // O código do chamado é o ticket #
            requester: call.name,
            supporter: call.responsible, // O responsável pelo chamado é o supporter
            createdDate: call.date,
            status: call.status === 'Aberto' ? 'OPEN' : // Mapeia status do português para inglês
                    call.status === 'Em Andamento' ? 'ASSIGNED' :
                    call.status === 'Fechado' ? 'COMPLETED' : call.status.toUpperCase(),
            // Ações: podemos ligar ao call-details.html
        }));
        renderServiceOrders();
    }

    function renderServiceOrders() {
        serviceOrdersTableBody.innerHTML = ''; // Limpa a tabela
        noServiceOrdersMessage.style.display = 'none'; // Esconde a mensagem de "nenhuma ordem"

        const searchTerm = serviceOrderSearchInput.value.toLowerCase();
        const selectedStatus = serviceOrderStatusFilterSelect.value;

        let filteredServiceOrders = allServiceOrders.filter(order => {
            const matchesSearch = 
                order.orderCode.toLowerCase().includes(searchTerm) ||
                order.ticketCode.toLowerCase().includes(searchTerm) ||
                order.requester.toLowerCase().includes(searchTerm) ||
                order.supporter.toLowerCase().includes(searchTerm);
            
            const matchesStatus = 
                selectedStatus === 'All' || 
                order.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // Ordenar as ordens de serviço (ex: mais recente primeiro por código de OS)
        filteredServiceOrders.sort((a, b) => b.orderCode.localeCompare(a.orderCode));

        if (filteredServiceOrders.length === 0) {
            noServiceOrdersMessage.style.display = 'block';
        } else {
            filteredServiceOrders.forEach(order => {
                const row = document.createElement('tr');
                const statusClass = order.status.toLowerCase(); // 'open', 'assigned', 'completed'

                row.innerHTML = `
                    <td>${order.orderCode}</td>
                    <td><a href="call-details.html?code=${order.ticketCode}">${order.ticketCode}</a></td>
                    <td>${order.requester}</td>
                    <td><a href="#">${order.supporter}</a></td> <td>${order.createdDate}</td>
                    <td class="status-${statusClass}">${order.status}</td>
                    <td>
                        <a href="call-details.html?code=${order.ticketCode}" title="Editar"><span class="material-icons action-icon edit-icon">edit</span></a>
                        <span class="material-icons action-icon delete-icon" title="Excluir">close</span>
                    </td>
                `;
                serviceOrdersTableBody.appendChild(row);
            });
        }
    }

    // Event listeners para busca e filtro
    serviceOrderSearchInput.addEventListener('input', renderServiceOrders);
    serviceOrderStatusFilterSelect.addEventListener('change', renderServiceOrders);

    // Event listener para o envio do formulário de novo chamado (se o modal for usado para criar OS)
    if (newCallForm) {
        newCallForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Os campos do formulário são os mesmos do "newCallForm"
            const callerName = callerNameInput.value;
            const callDate = callDateInput.value;
            const department = document.getElementById('department').value;
            const responsible = document.getElementById('responsible').value; // 'responsible' agora é o 'Supporter'
            const urgencyLevel = urgencyLevelInput.value; // 'urgencyLevel' agora é a 'Prioridade'
            const callReason = document.getElementById('callReason').value; // 'callReason' agora é a 'Descrição da Ordem de Serviço'

            const orderCode = generateNextOrderCode();
            const ticketCode = generateNextCallCodeForOS(); // Gera um novo código de ticket para a OS, se necessário

            const serviceOrderDetails = {
                orderCode: orderCode,
                ticketCode: ticketCode,
                requester: callerName,
                department: department, // Embora não esteja na tabela de OS, é bom manter
                supporter: responsible,
                createdDate: callDate,
                status: 'OPEN', // Novas OS sempre começam como 'OPEN'
                priority: urgencyLevel, // Armazena a prioridade
                description: callReason // Descrição
            };

            // Para manter a simplicidade, vamos salvar as OSs em uma nova chave no localStorage.
            // Em um sistema real, Ordens de Serviço seriam entidades separadas dos Chamados.
            let storedServiceOrders = localStorage.getItem('allServiceOrders');
            let allExistingServiceOrders = storedServiceOrders ? JSON.parse(storedServiceOrders) : [];
            allExistingServiceOrders.push(serviceOrderDetails);
            localStorage.setItem('allServiceOrders', JSON.stringify(allExistingServiceOrders));

            alert(`Ordem de Serviço Aberta com Sucesso!\nCódigo da OS: ${orderCode}\nTicket Relacionado: ${ticketCode}`);

            closeModal();
            loadServiceOrders(); // Recarrega e renderiza a lista de ordens de serviço
        });
    }

    // Função auxiliar para gerar um código de ticket para a OS, se for uma nova OS sem um ticket existente
    function generateNextCallCodeForOS() {
        let lastCallNumber = parseInt(localStorage.getItem('lastCallNumber') || '0', 10);
        lastCallNumber++;
        localStorage.setItem('lastCallNumber', lastCallNumber.toString());
        const formattedNumber = String(lastCallNumber).padStart(4, '0');
        return `#TASK${formattedNumber}`; // Ou outro prefixo para tickets gerados por OS
    }

    // Carrega e renderiza as ordens de serviço quando a página é carregada
    loadServiceOrders();
});