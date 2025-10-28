<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Sorteio</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --mackenzie-red: #9E0B0F;
            --mackenzie-dark-red: #7A090C;
            --mackenzie-gold: #D4AF37;
            --mackenzie-dark: #333333;
            --mackenzie-light: #F5F5F5;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--mackenzie-light);
            color: var(--mackenzie-dark);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            flex: 1;
        }
        
        header {
            background-color: var(--mackenzie-red);
            color: white;
            padding: 20px 0;
            text-align: center;
            border-bottom: 5px solid var(--mackenzie-gold);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .logo-container {
            margin-bottom: 15px;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .main-content {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-top: 30px;
        }
        
        .panel {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            padding: 25px;
            flex: 1;
            min-width: 300px;
        }
        
        .panel h2 {
            color: var(--mackenzie-red);
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--mackenzie-gold);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        input, select, button {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        button {
            background-color: var(--mackenzie-red);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.3s;
            margin-top: 10px;
        }
        
        button:hover {
            background-color: var(--mackenzie-dark-red);
        }
        
        .file-upload {
            border: 2px dashed #ddd;
            padding: 30px;
            text-align: center;
            border-radius: 5px;
            cursor: pointer;
            transition: border-color 0.3s;
        }
        
        .file-upload:hover {
            border-color: var(--mackenzie-red);
        }
        
        .file-upload i {
            font-size: 3rem;
            color: #ddd;
            margin-bottom: 15px;
        }
        
        .file-upload.active {
            border-color: var(--mackenzie-red);
            background-color: rgba(158, 11, 15, 0.05);
        }
        
        .file-upload.active i {
            color: var(--mackenzie-red);
        }
        
        .results-container {
            text-align: center;
            padding: 20px;
        }
        
        .winner-display {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--mackenzie-red);
            margin: 20px 0;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .reveal-btn {
            background-color: var(--mackenzie-gold);
            color: var(--mackenzie-dark);
            font-size: 1.2rem;
            padding: 15px 30px;
            border-radius: 50px;
            margin: 20px auto;
            max-width: 300px;
        }
        
        .reveal-btn:hover {
            background-color: #c19b2f;
        }
        
        .reset-btn {
            background-color: var(--mackenzie-dark);
            max-width: 300px;
        }
        
        .reset-btn:hover {
            background-color: #555;
        }
        
        .animation-container {
            position: relative;
            height: 200px;
            margin: 30px 0;
            overflow: hidden;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: var(--mackenzie-red);
            opacity: 0.7;
        }
        
        .history-panel {
            margin-top: 30px;
        }
        
        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .history-controls {
            display: flex;
            gap: 10px;
        }
        
        .history-controls button {
            width: auto;
            padding: 8px 15px;
            font-size: 0.9rem;
        }
        
        .history-list {
            max-height: 300px;
            overflow-y: auto;
            display: none; /* Inicialmente oculto */
        }
        
        .history-list.visible {
            display: block;
        }
        
        .history-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .history-item:last-child {
            border-bottom: none;
        }
        
        .history-item-info {
            flex-grow: 1;
        }
        
        .history-item-actions {
            display: flex;
            gap: 5px;
        }
        
        .delete-history-item {
            background: transparent;
            color: var(--mackenzie-red);
            border: none;
            cursor: pointer;
            width: auto;
            padding: 5px;
            margin: 0;
        }
        
        .delete-history-item:hover {
            background: transparent;
            color: var(--mackenzie-dark-red);
        }
        
        .screen-mode-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--mackenzie-dark);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            cursor: pointer;
            z-index: 1000;
            width: auto;
        }
        
        .screen-mode {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--mackenzie-red) 0%, var(--mackenzie-dark-red) 100%);
            color: white;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999;
            overflow: hidden;
        }
        
        .screen-mode.active {
            display: flex;
        }
        
        .screen-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .screen-logo {
            max-width: 300px;
            margin-bottom: 20px;
        }
        
        .screen-title {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .screen-winner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
            width: 100%;
            padding: 0 20px;
        }
        
        .screen-current-winner {
            font-size: 6rem;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
            width: 100%;
        }
        
        .screen-previous-winners {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin-top: 40px;
            max-width: 90%;
        }
        
        .previous-winner {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1.8rem;
            border: 2px solid var(--mackenzie-gold);
        }
        
        .screen-controls {
            display: flex;
            gap: 20px;
            margin-top: 40px;
        }
        
        .screen-btn {
            background-color: var(--mackenzie-gold);
            color: var(--mackenzie-dark);
            border: none;
            border-radius: 50px;
            padding: 20px 40px;
            font-size: 1.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .screen-btn:hover {
            background-color: #c19b2f;
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        
        .screen-btn:active {
            transform: translateY(1px);
        }
        
        .screen-btn-secondary {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        .screen-btn-secondary:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        .close-screen {
            position: absolute;
            top: 30px;
            right: 30px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            color: white;
            font-size: 2rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
            z-index: 1001;
        }
        
        .close-screen:hover {
            background: rgba(0, 0, 0, 0.7);
        }
        
        footer {
            background-color: var(--mackenzie-dark);
            color: white;
            text-align: center;
            padding: 20px 0;
            margin-top: 40px;
        }
        
        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .footer-content a {
            color: var(--mackenzie-gold);
            text-decoration: none;
        }
        
        .footer-content a:hover {
            text-decoration: underline;
        }
        
        @keyframes confetti-fall {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(1000px) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
        
        @keyframes highlight {
            0% {
                background-color: transparent;
            }
            50% {
                background-color: var(--mackenzie-gold);
                color: var(--mackenzie-dark);
            }
            100% {
                background-color: transparent;
            }
        }
        
        .pulse {
            animation: pulse 0.5s infinite;
        }
        
        .highlight {
            animation: highlight 1.5s ease;
        }
        
        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }
            
            .screen-title {
                font-size: 2.5rem;
            }
            
            .screen-current-winner {
                font-size: 3rem;
            }
            
            .previous-winner {
                font-size: 1.2rem;
                padding: 10px 15px;
            }
            
            .screen-btn {
                padding: 15px 25px;
                font-size: 1.2rem;
            }
            
            .close-screen {
                top: 15px;
                right: 15px;
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo-container">
                <!-- Logo será carregado aqui -->
                <img src="logo.png" alt="Logo" class="logo" onerror="this.style.display='none'">
            </div>
        </div>
    </header>
    
    <div class="container">
        <button class="screen-mode-btn" id="screenModeBtn">
            <i class="fas fa-tv"></i> Modo Telão
        </button>
        
        <div class="main-content">
            <div class="panel">
                <h2>Configuração do Sorteio</h2>
                
                <div class="form-group">
                    <label for="fileUpload">Upload da Planilha</label>
                    <div class="file-upload" id="fileUploadArea">
                        <i class="fas fa-file-csv"></i>
                        <p>Clique para selecionar ou arraste uma planilha CSV</p>
                        <input type="file" id="fileInput" accept=".csv" style="display: none;">
                    </div>
                    <div id="fileName" style="margin-top: 10px; font-style: italic;"></div>
                </div>
                
                <div class="form-group">
                    <label for="columnSelect">Coluna para Sorteio</label>
                    <select id="columnSelect">
                        <option value="">Selecione uma coluna</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="quantity">Quantidade de Sorteados</label>
                    <input type="number" id="quantity" min="1" value="1">
                </div>
                
                <div class="form-group">
                    <label for="groupColumnSelect">Coluna de Agrupamento (opcional)</label>
                    <select id="groupColumnSelect">
                        <option value="">Nenhum agrupamento</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="groupValueSelect">Valor do Agrupamento</label>
                    <select id="groupValueSelect" disabled>
                        <option value="">Selecione primeiro a coluna de agrupamento</option>
                    </select>
                </div>
                
                <button id="drawButton">Realizar Sorteio</button>
                <button class="reset-btn" id="resetButton">
                    <i class="fas fa-redo"></i> Reiniciar Sistema
                </button>
            </div>
            
            <div class="panel">
                <h2>Resultado do Sorteio</h2>
                
                <div class="animation-container" id="animationContainer">
                    <!-- Confetti será gerado aqui via JavaScript -->
                </div>
                
                <div class="results-container">
                    <div class="winner-display" id="winnerDisplay">
                        <!-- Resultado será exibido aqui -->
                    </div>
                    
                    <button class="reveal-btn" id="revealBtn">
                        <i class="fas fa-gift"></i> Revelar Próximo
                    </button>
                </div>
                
                <div class="history-panel">
                    <div class="history-header">
                        <h3>Histórico de Sorteios</h3>
                        <div class="history-controls">
                            <button id="toggleHistoryBtn">
                                <i class="fas fa-eye"></i> Mostrar
                            </button>
                            <button id="clearHistoryBtn">
                                <i class="fas fa-trash"></i> Limpar
                            </button>
                        </div>
                    </div>
                    <div class="history-list" id="historyList">
                        <!-- Histórico será preenchido aqui -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <footer>
        <div class="footer-content">
            <p>Desenvolvido por <strong>Thiago Graziani Traue</strong> | 
               <a href="https://github.com/traue/sistema-sorteio-fci" target="_blank">
                   <i class="fab fa-github"></i> Repositório do Projeto
               </a>
            </p>
        </div>
    </footer>
    
    <div class="screen-mode" id="screenMode">
        <button class="close-screen" id="closeScreen">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="screen-header">
            <img src="logo.png" alt="Logo" class="screen-logo" onerror="this.style.display='none'">
            <div class="screen-title">Resultados do Sorteio</div>
        </div>
        
        <div class="screen-winner-container">
            <div class="screen-current-winner" id="screenCurrentWinner">
                <!-- Vencedor atual será exibido aqui -->
            </div>
            
            <div class="screen-previous-winners" id="screenPreviousWinners">
                <!-- Vencedores anteriores serão exibidos aqui -->
            </div>
        </div>
        
        <div class="screen-controls">
            <button class="screen-btn" id="screenRevealBtn">
                <i class="fas fa-gift"></i> Revelar Próximo
            </button>
        </div>
        
        <div class="animation-container" id="screenAnimation">
            <!-- Confetti para o telão -->
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Elementos DOM
            const fileInput = document.getElementById('fileInput');
            const fileUploadArea = document.getElementById('fileUploadArea');
            const fileName = document.getElementById('fileName');
            const columnSelect = document.getElementById('columnSelect');
            const groupColumnSelect = document.getElementById('groupColumnSelect');
            const groupValueSelect = document.getElementById('groupValueSelect');
            const quantityInput = document.getElementById('quantity');
            const drawButton = document.getElementById('drawButton');
            const resetButton = document.getElementById('resetButton');
            const winnerDisplay = document.getElementById('winnerDisplay');
            const revealBtn = document.getElementById('revealBtn');
            const historyList = document.getElementById('historyList');
            const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            const screenModeBtn = document.getElementById('screenModeBtn');
            const screenMode = document.getElementById('screenMode');
            const closeScreen = document.getElementById('closeScreen');
            const screenCurrentWinner = document.getElementById('screenCurrentWinner');
            const screenPreviousWinners = document.getElementById('screenPreviousWinners');
            const screenRevealBtn = document.getElementById('screenRevealBtn');
            const animationContainer = document.getElementById('animationContainer');
            const screenAnimation = document.getElementById('screenAnimation');
            
            // Variáveis globais
            let csvData = [];
            let currentWinners = [];
            let currentIndex = 0;
            let screenWinners = [];
            let screenCurrentIndex = 0;
            let history = JSON.parse(localStorage.getItem('drawHistory')) || [];
            let isHistoryVisible = false; // Inicialmente oculto
            
            // Atualizar histórico na tela
            function updateHistory() {
                historyList.innerHTML = '';
                
                if (history.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'history-item';
                    emptyMessage.textContent = 'Nenhum sorteio realizado ainda.';
                    historyList.appendChild(emptyMessage);
                    return;
                }
                
                history.forEach((item, index) => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    
                    const itemInfo = document.createElement('div');
                    itemInfo.className = 'history-item-info';
                    itemInfo.innerHTML = `
                        <strong>${item.timestamp}</strong><br>
                        ${item.winners.join(', ')}<br>
                        <small>${item.column}${item.groupColumn && item.groupValue ? ` | ${item.groupColumn}: ${item.groupValue}` : ''}</small>
                    `;
                    
                    const itemActions = document.createElement('div');
                    itemActions.className = 'history-item-actions';
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-history-item';
                    deleteButton.innerHTML = '<i class="fas fa-times"></i>';
                    deleteButton.title = 'Remover este item';
                    deleteButton.addEventListener('click', () => {
                        removeHistoryItem(index);
                    });
                    
                    itemActions.appendChild(deleteButton);
                    historyItem.appendChild(itemInfo);
                    historyItem.appendChild(itemActions);
                    historyList.appendChild(historyItem);
                });
            }
            
            // Remover item do histórico
            function removeHistoryItem(index) {
                if (confirm('Tem certeza que deseja remover este item do histórico?')) {
                    history.splice(index, 1);
                    localStorage.setItem('drawHistory', JSON.stringify(history));
                    updateHistory();
                }
            }
            
            // Limpar histórico
            function clearHistory() {
                if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                    history = [];
                    localStorage.setItem('drawHistory', JSON.stringify(history));
                    updateHistory();
                }
            }
            
            // Alternar visibilidade do histórico
            function toggleHistoryVisibility() {
                isHistoryVisible = !isHistoryVisible;
                if (isHistoryVisible) {
                    historyList.classList.add('visible');
                    toggleHistoryBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar';
                } else {
                    historyList.classList.remove('visible');
                    toggleHistoryBtn.innerHTML = '<i class="fas fa-eye"></i> Mostrar';
                }
            }
            
            // Inicializar histórico
            updateHistory();
            
            // Configurar eventos dos controles do histórico
            toggleHistoryBtn.addEventListener('click', toggleHistoryVisibility);
            clearHistoryBtn.addEventListener('click', clearHistory);
            
            // Upload de arquivo
            fileUploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('active');
            });
            
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('active');
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('active');
                
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    handleFileUpload();
                }
            });
            
            fileInput.addEventListener('change', handleFileUpload);
            
            function handleFileUpload() {
                if (fileInput.files.length) {
                    const file = fileInput.files[0];
                    fileName.textContent = `Arquivo: ${file.name}`;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        parseCSV(e.target.result);
                    };
                    reader.readAsText(file);
                }
            }
            
            // Parse do CSV
            function parseCSV(csvText) {
                const lines = csvText.split('\n');
                if (lines.length < 2) {
                    alert('Arquivo CSV inválido');
                    return;
                }
                
                // Detecta o separador (ponto e vírgula ou vírgula)
                const firstLine = lines[0];
                const separator = firstLine.includes(';') ? ';' : ',';
                
                // Obtém os cabeçalhos
                const headers = firstLine.split(separator).map(h => h.trim());
                
                // Limpa e preenche os selects
                columnSelect.innerHTML = '<option value="">Selecione uma coluna</option>';
                groupColumnSelect.innerHTML = '<option value="">Nenhum agrupamento</option>';
                
                headers.forEach(header => {
                    const option = document.createElement('option');
                    option.value = header;
                    option.textContent = header;
                    columnSelect.appendChild(option);
                    
                    const groupOption = document.createElement('option');
                    groupOption.value = header;
                    groupOption.textContent = header;
                    groupColumnSelect.appendChild(groupOption);
                });
                
                // Processa os dados
                csvData = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    
                    const values = lines[i].split(separator).map(v => v.trim());
                    const row = {};
                    
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    
                    csvData.push(row);
                }
                
                alert(`Planilha carregada com ${csvData.length} registros`);
            }
            
            // Atualizar valores de agrupamento quando a coluna de agrupamento for selecionada
            groupColumnSelect.addEventListener('change', function() {
                const selectedColumn = this.value;
                groupValueSelect.innerHTML = '';
                
                if (!selectedColumn) {
                    groupValueSelect.disabled = true;
                    groupValueSelect.innerHTML = '<option value="">Selecione primeiro a coluna de agrupamento</option>';
                    return;
                }
                
                groupValueSelect.disabled = false;
                
                // Obter valores únicos da coluna selecionada
                const uniqueValues = [...new Set(csvData.map(row => row[selectedColumn]))].filter(val => val);
                
                // Adicionar opção para todos os valores
                const allOption = document.createElement('option');
                allOption.value = '';
                allOption.textContent = 'Todos os valores';
                groupValueSelect.appendChild(allOption);
                
                // Adicionar cada valor único
                uniqueValues.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    groupValueSelect.appendChild(option);
                });
            });
            
            // Realizar sorteio
            drawButton.addEventListener('click', performDraw);
            
            function performDraw() {
                const column = columnSelect.value;
                const groupColumn = groupColumnSelect.value;
                const groupValue = groupValueSelect.value;
                const quantity = parseInt(quantityInput.value);
                
                if (!column) {
                    alert('Selecione uma coluna para o sorteio');
                    return;
                }
                
                if (isNaN(quantity) || quantity < 1) {
                    alert('Informe uma quantidade válida');
                    return;
                }
                
                // Filtra os dados se um agrupamento foi selecionado
                let dataToDraw = csvData;
                if (groupColumn && groupValue) {
                    dataToDraw = csvData.filter(row => row[groupColumn] === groupValue);
                }
                
                if (dataToDraw.length === 0) {
                    alert('Nenhum dado encontrado com os filtros selecionados');
                    return;
                }
                
                if (quantity > dataToDraw.length) {
                    alert(`Quantidade solicitada (${quantity}) é maior que o número de registros (${dataToDraw.length})`);
                    return;
                }
                
                // Realiza o sorteio
                const winners = [];
                const availableIndices = [...Array(dataToDraw.length).keys()];
                
                for (let i = 0; i < quantity; i++) {
                    if (availableIndices.length === 0) break;
                    
                    const randomIndex = Math.floor(Math.random() * availableIndices.length);
                    const winnerIndex = availableIndices.splice(randomIndex, 1)[0];
                    winners.push(dataToDraw[winnerIndex][column]);
                }
                
                // Atualiza a interface
                currentWinners = winners;
                currentIndex = 0;
                winnerDisplay.textContent = '???';
                revealBtn.disabled = false;
                revealBtn.textContent = 'Revelar Próximo';
                
                // Também atualiza o modo telão
                screenWinners = [...winners];
                screenCurrentIndex = 0;
                screenCurrentWinner.textContent = '???';
                screenPreviousWinners.innerHTML = '';
                screenRevealBtn.disabled = false;
                
                // Adiciona ao histórico
                const now = new Date();
                const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
                
                history.unshift({
                    timestamp,
                    winners,
                    column,
                    groupColumn,
                    groupValue
                });
                
                // Mantém apenas os últimos 10 sorteios
                if (history.length > 10) {
                    history = history.slice(0, 10);
                }
                
                // Salva no localStorage
                localStorage.setItem('drawHistory', JSON.stringify(history));
                
                // Atualiza o histórico na tela
                updateHistory();
            }
            
            // Reiniciar sistema
            resetButton.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja reiniciar o sistema? Isso irá limpar todos os dados atuais, exceto o histórico.')) {
                    // Limpa os dados atuais
                    csvData = [];
                    currentWinners = [];
                    currentIndex = 0;
                    screenWinners = [];
                    screenCurrentIndex = 0;
                    
                    // Limpa a interface
                    fileName.textContent = '';
                    columnSelect.innerHTML = '<option value="">Selecione uma coluna</option>';
                    groupColumnSelect.innerHTML = '<option value="">Nenhum agrupamento</option>';
                    groupValueSelect.innerHTML = '<option value="">Selecione primeiro a coluna de agrupamento</option>';
                    groupValueSelect.disabled = true;
                    quantityInput.value = '1';
                    winnerDisplay.textContent = '';
                    revealBtn.disabled = true;
                    screenCurrentWinner.textContent = '';
                    screenPreviousWinners.innerHTML = '';
                    screenRevealBtn.disabled = true;
                    
                    alert('Sistema reiniciado com sucesso!');
                }
            });
            
            // Revelar próximo vencedor
            revealBtn.addEventListener('click', revealNextWinner);
            
            function revealNextWinner() {
                if (currentIndex < currentWinners.length) {
                    // Animação de confete
                    createConfetti(animationContainer);
                    
                    // Exibe o vencedor
                    winnerDisplay.textContent = currentWinners[currentIndex];
                    
                    // Adiciona efeito de pulso
                    winnerDisplay.classList.add('pulse');
                    
                    setTimeout(() => {
                        winnerDisplay.classList.remove('pulse');
                    }, 500);
                    
                    currentIndex++;
                    
                    if (currentIndex >= currentWinners.length) {
                        revealBtn.disabled = true;
                        revealBtn.textContent = 'Sorteio Concluído';
                    }
                }
            }
            
            // Revelar próximo vencedor no modo telão
            screenRevealBtn.addEventListener('click', revealNextScreenWinner);
            
            function revealNextScreenWinner() {
                if (screenCurrentIndex < screenWinners.length) {
                    // Animação de confete
                    createConfetti(screenAnimation);
                    
                    // Exibe o vencedor atual
                    screenCurrentWinner.textContent = screenWinners[screenCurrentIndex];
                    screenCurrentWinner.classList.add('highlight');
                    
                    // Adiciona o vencedor à lista de anteriores
                    if (screenCurrentIndex > 0) {
                        const previousWinner = document.createElement('div');
                        previousWinner.className = 'previous-winner';
                        previousWinner.textContent = screenWinners[screenCurrentIndex - 1];
                        screenPreviousWinners.appendChild(previousWinner);
                    }
                    
                    setTimeout(() => {
                        screenCurrentWinner.classList.remove('highlight');
                    }, 1500);
                    
                    screenCurrentIndex++;
                    
                    if (screenCurrentIndex >= screenWinners.length) {
                        screenRevealBtn.disabled = true;
                        // Adiciona o último vencedor à lista
                        const previousWinner = document.createElement('div');
                        previousWinner.className = 'previous-winner';
                        previousWinner.textContent = screenWinners[screenWinners.length - 1];
                        screenPreviousWinners.appendChild(previousWinner);
                    }
                }
            }
            
            // Criar efeito de confete
            function createConfetti(container) {
                container.innerHTML = '';
                
                for (let i = 0; i < 100; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    
                    // Cores aleatórias
                    const colors = [
                        '#9E0B0F', '#D4AF37', '#FFFFFF', '#333333'
                    ];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.backgroundColor = color;
                    
                    // Posição e animação aleatórias
                    confetti.style.left = `${Math.random() * 100}%`;
                    confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
                    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
                    
                    container.appendChild(confetti);
                }
                
                // Remove os confetes após a animação
                setTimeout(() => {
                    container.innerHTML = '';
                }, 5000);
            }
            
            // Modo telão
            screenModeBtn.addEventListener('click', () => {
                screenMode.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            
            closeScreen.addEventListener('click', () => {
                screenMode.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
            
            // Tecla ESC para sair do modo telão
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && screenMode.classList.contains('active')) {
                    screenMode.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                // Barra de espaço para revelar próximo no modo telão
                if (e.key === ' ' && screenMode.classList.contains('active') && 
                    screenCurrentIndex < screenWinners.length) {
                    e.preventDefault(); // Evita que a página role
                    revealNextScreenWinner();
                }
            });
        });
    </script>
</body>
</html>