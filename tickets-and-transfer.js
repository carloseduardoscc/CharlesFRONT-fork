document.addEventListener('DOMContentLoaded', () => {
    const ticketsTableBody = document.getElementById('ticketsTableBody');
    const ticketSearchInput = document.getElementById('ticketSearch');
    const statusFilterSelect = document.getElementById('statusFilter');
    const noTicketsMessage = document.getElementById('noTicketsMessage');
    const newTicketBtn = document.querySelector('.new-ticket-btn'); // Botão "Novo Ticket" na página
    const openNewCallSidebarBtn = document.querySelector('.open-new-call-sidebar'); // Botão "Abrir Chamado" na sidebar

    // ======================================================
    // Lógica do Menu Hamburger (duplicada para esta página)
    // ======================================================
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
    // Lógica do Pop-up (Modal) para Abrir Novo Chamado/Ticket (reutilizada)
    // ======================================================
    const newCallModal = document.getElementById('newCallModal');
    const closeButton = newCallModal.querySelector('.close-button');
    const cancelBtn = newCallModal.querySelector('.cancel-btn');
    const newCallForm = document.getElementById('newCallForm');
    const callerNameInput = document.getElementById('callerName');
    const callDateInput = document.getElementById('callDate');
    const urgencyLevelInput = document.getElementById('urgencyLevel');

    function openModal() {
        newCallModal.classList.add('active');
        body.classList.add('no-scroll');

        callerNameInput.value = 'Usuário Suporte';
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        callDateInput.value = `${day}/${month}/${year}`;

        newCallForm.reset();
        callerNameInput.value = 'Usuário Suporte';
        callDateInput.value = `${day}/${month}/${year}`;
    }

    function closeModal() {
        newCallModal.classList.remove('active');
        body.classList.remove('no-scroll');
    }

    // Event Listeners para abrir/fechar o modal
    if (newTicketBtn) { // Botão "Novo Ticket" na página
        newTicketBtn.addEventListener('click', openModal);
    }
    if (openNewCallSidebarBtn) { // Botão "Abrir Chamado" na sidebar
        openNewCallSidebarBtn.addEventListener('click', openModal);
    }
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

    // Função para gerar o próximo código de ticket/chamado sequencial (#CH0001, #CH0002, ...)
    function generateNextCallCode() {
        let lastCallNumber = parseInt(localStorage.getItem('lastCallNumber') || '0', 10);
        lastCallNumber++;
        localStorage.setItem('lastCallNumber', lastCallNumber.toString());
        const formattedNumber = String(lastCallNumber).padStart(4, '0');
        return `#CH${formattedNumber}`;
    }

    // ======================================================
    // Lógica para Listagem, Busca e Filtro de Tickets
    // ======================================================

    let allTickets = []; // Variável para armazenar todos os tickets carregados

    function loadTickets() {
        let storedCalls = localStorage.getItem('allCalls');
        allTickets = storedCalls ? JSON.parse(storedCalls) : [];
        // A imagem mostra 'TASK', 'INC', 'REQ' como tipo.
        // Se seus chamados não têm 'tipo', você pode adicionar um valor padrão ao carregá-los
        allTickets = allTickets.map(ticket => ({
            ...ticket,
            type: ticket.type || 'TASK' // Exemplo: se não tiver tipo, define como 'TASK'
        }));
        renderTickets();
    }

    function renderTickets() {
        ticketsTableBody.innerHTML = ''; // Limpa a tabela
        noTicketsMessage.style.display = 'none'; // Esconde a mensagem de "nenhum ticket"

        const searchTerm = ticketSearchInput.value.toLowerCase();
        const selectedStatus = statusFilterSelect.value;

        let filteredTickets = allTickets.filter(ticket => {
            const matchesSearch = 
                ticket.code.toLowerCase().includes(searchTerm) ||
                ticket.name.toLowerCase().includes(searchTerm) ||
                ticket.reason.toLowerCase().includes(searchTerm);
            
            const matchesStatus = 
                selectedStatus === 'All' || 
                ticket.status === selectedStatus ||
                (selectedStatus === 'Atribuído' && ticket.status === 'Em Andamento') || // Mapeia 'Em Andamento' para 'Atribuído' se necessário
                (selectedStatus === 'Concluído' && ticket.status === 'Fechado'); // Mapeia 'Fechado' para 'Concluído' se necessário

            return matchesSearch && matchesStatus;
        });

        // Ordenar os tickets, por exemplo, por código (mais recente primeiro)
        filteredTickets.sort((a, b) => b.code.localeCompare(a.code)); // Ordem decrescente

        if (filteredTickets.length === 0) {
            noTicketsMessage.style.display = 'block';
        } else {
            filteredTickets.forEach(ticket => {
                const row = document.createElement('tr');
                const statusClass = ticket.status.toLowerCase().replace(' ', '-');
                const priorityClass = ticket.urgencyLevel ? `priority-${ticket.urgencyLevel.toLowerCase()}` : ''; // Usa urgencyLevel para prioridade

                row.innerHTML = `
                    <td><a href="call-details.html?code=${ticket.code}">${ticket.code}</a></td>
                    <td>${ticket.name}</td>
                    <td>${ticket.department}</td>
                    <td>${ticket.type}</td>
                    <td class="${priorityClass}">${ticket.urgencyLevel}</td>
                    <td>${ticket.date}</td>
                    <td class="status-${statusClass}">${ticket.status.toUpperCase()}</td>
                    <td><a href="call-details.html?code=${ticket.code}"><span class="material-icons">edit</span></a></td>
                `;
                ticketsTableBody.appendChild(row);
            });
        }
    }

    // Event listeners para busca e filtro
    ticketSearchInput.addEventListener('input', renderTickets);
    statusFilterSelect.addEventListener('change', renderTickets);

    // Event listener para o envio do formulário de novo chamado/ticket
    if (newCallForm) {
        newCallForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const callerName = callerNameInput.value;
            const callDate = callDateInput.value;
            const department = document.getElementById('department').value;
            const responsible = document.getElementById('responsible').value;
            const urgencyLevel = urgencyLevelInput.value;
            const callReason = document.getElementById('callReason').value;

            const callCode = generateNextCallCode();

            const callDetails = {
                code: callCode,
                name: callerName,
                date: callDate,
                department: department,
                responsible: responsible,
                urgencyLevel: urgencyLevel,
                reason: callReason,
                status: 'Aberto', // Novos tickets sempre começam como 'Aberto'
                type: 'TASK' // Valor padrão para 'Tipo' conforme a imagem
            };

            let storedCalls = localStorage.getItem('allCalls');
            let allCalls = storedCalls ? JSON.parse(storedCalls) : [];
            allCalls.push(callDetails);
            localStorage.setItem('allCalls', JSON.stringify(allCalls));

            alert(`Ticket Aberto com Sucesso!\nCódigo do Ticket: ${callCode}\nDetalhes: ${callReason}\nUrgência: ${urgencyLevel}`);

            closeModal();
            loadTickets(); // Recarrega e renderiza a lista de tickets
        });
    }

    // Carrega e renderiza os tickets quando a página é carregada
    loadTickets();
});