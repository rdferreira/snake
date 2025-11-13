// Seu código JavaScript corrigido e modificado entrará aqui
        
        // Variáveis do Jogo
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let snake = []; // Inicializado em resetGame
        let food = {}; // Inicializado em placeFood
        let velocityX = gridSize;
        let velocityY = 0;
        let currentStage = 1;
        const maxStages = 10;
        const lengthToAdvance = 50; 
        let gameLoopId;
        let gameRunning = false; // NOVO: Controla se o jogo está rodando/pausado

        // Referências aos elementos
        const stageDisplay = document.getElementById('current-stage');
        const lengthDisplay = document.getElementById('snake-length');
        const startPauseButton = document.getElementById('start-pause-button');
        const resetButton = document.getElementById('reset-button');

        // --- Configurações de Dificuldade por Fase ---
        const initialSpeed = 150;
        const speedDecreasePerStage = 10;

        function getGameSpeed() {
            return Math.max(50, initialSpeed - (currentStage - 1) * speedDecreasePerStage);
        }

        // --- Funções Auxiliares ---

        function resetGame(showPrompt = true) {
            // Se o jogo estiver rodando, pausa ele antes de resetar
            if(gameRunning) {
                toggleGame(); 
            }
            
            snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
            velocityX = gridSize;
            velocityY = 0;
            currentStage = 1;
            placeFood();
            updateDisplay();
            drawGame(); // Desenha o estado inicial
            
            // Atualiza o botão para "Iniciar" e remove a classe 'paused'
            startPauseButton.textContent = 'Iniciar';
            startPauseButton.classList.remove('paused');
            
            if (showPrompt) {
                 alert("Fim de Jogo! Reiniciando na Fase 1. Pressione 'Iniciar' para começar.");
            }
        }
        
        function nextStage() {
             if (currentStage < maxStages) {
                // Pausa o jogo brevemente para o alerta
                clearInterval(gameLoopId); 
                gameRunning = false;
                startPauseButton.textContent = 'Continuar';
                startPauseButton.classList.add('paused');
                
                currentStage++;
                snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
                velocityX = gridSize;
                velocityY = 0;
                placeFood();
                updateDisplay();

                alert(`Parabéns! Fase ${currentStage} desbloqueada! O jogo está mais rápido. Clique em 'Continuar'.`);
                
            } else {
                alert("🎉 PARABÉNS! Você completou todas as 10 fases do Jogo da Cobrinha!");
                resetGame(false); // Reinicia sem o alerta de Fim de Jogo
            }
        }

        function placeFood() {
             let newFood;
             do {
                 newFood = {
                     x: Math.floor(Math.random() * tileCount) * gridSize,
                     y: Math.floor(Math.random() * tileCount) * gridSize
                 };
             } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));
            
             food = newFood;
        }

        function updateDisplay() {
             stageDisplay.textContent = currentStage;
             lengthDisplay.textContent = snake.length;
        }

        // --- Lógica de Desenho ---

        function drawGame() {
             // 1. Limpa a tela
             ctx.fillStyle = '#1e2127';
             ctx.fillRect(0, 0, canvas.width, canvas.height);

             // 2. Desenha a comida (Vermelha)
             ctx.fillStyle = 'red';
             ctx.fillRect(food.x, food.y, gridSize, gridSize);

             // 3. Desenha a cobra (Verde)
             snake.forEach((part, index) => {
                 ctx.fillStyle = (index === 0) ? '#61dafb' : '#4CAF50';
                 ctx.fillRect(part.x, part.y, gridSize, gridSize);
                 ctx.strokeStyle = '#2d2d2d';
                 ctx.strokeRect(part.x, part.y, gridSize, gridSize);
             });
             
             // NOVO: Desenha a mensagem de Pausa se o jogo não estiver rodando
             if (!gameRunning && snake.length > 0) {
                 ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = 'white';
                 ctx.font = '30px Arial';
                 ctx.textAlign = 'center';
                 ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
             }
        }

        // --- Lógica de Movimento e Colisão ---

        function moveSnake() {
            if (!gameRunning) return; // Não move se estiver pausado

             let head = { 
                 x: snake[0].x + velocityX, 
                 y: snake[0].y + velocityY 
             };

             // 1. Verifica Colisão com a Parede
             if (head.x < 0) { // Saiu pela esquerda
        head.x = canvas.width - gridSize;
    } else if (head.x >= canvas.width) { // Saiu pela direita
        head.x = 0;
    }

    if (head.y < 0) { // Saiu por cima
        head.y = canvas.height - gridSize;
    } else if (head.y >= canvas.height) { // Saiu por baixo
        head.y = 0;
    }

             // 2. Verifica Colisão com o Próprio Corpo
            // 2. Verifica Colisão com o Próprio Corpo (Única condição de derrota)
    // Isso é o que você chamou de "bater nela mesma".
    const hitSelf = snake.slice(0).some(part => part.x === head.x && part.y === head.y);
    // Nota: Mudamos de snake.slice(1) para snake.slice(0) para incluir a primeira parte.
    // Isso permite que o novo 'head' verifique a colisão com *qualquer* parte,
    // garantindo que a nova lógica de head.x/head.y seja a única fonte de coordenadas.
    
    // Como a nova cabeça (head) ainda não foi adicionada ao array snake,
    // se head.x/y for igual a qualquer parte de snake[0...n-1], a colisão é detectada.
    // Usar snake.slice(1) é o padrão mais seguro, vamos retornar a ele,
    // já que a colisão cabeça-cabeça só ocorreria em reversão de movimento, que já é evitada.
    const hitSelfFinal = snake.slice(1).some(part => part.x === head.x && part.y === head.y);


    if (hitSelfFinal) {
        // Se bater no próprio corpo, o jogo termina.
        resetGame(true); 
        return;
    }

    // Adiciona a nova cabeça ao início
    snake.unshift(head);
    
    // 3. Verifica se Comeu a Comida
    if (head.x === food.x && head.y === food.y) {
        placeFood();
        updateDisplay();

        if (snake.length >= lengthToAdvance) {
            nextStage();
            return;
        }
    } else {
        // A cobra se move (remove o rabo para simular o movimento)
        snake.pop();
    }
}

        // --- Loop Principal do Jogo ---

        function gameLoop() {
             moveSnake();
             drawGame();
        }

        function startGameLoop() {
             if (gameRunning) return; // Impede múltiplos loops
             gameRunning = true;
             gameLoopId = setInterval(gameLoop, getGameSpeed());
             startPauseButton.textContent = 'Pausar';
             startPauseButton.classList.remove('paused');
        }
        
        function pauseGameLoop() {
            if (!gameRunning) return;
            clearInterval(gameLoopId);
            gameRunning = false;
            startPauseButton.textContent = 'Continuar';
            startPauseButton.classList.add('paused');
            drawGame(); // Redesenha para mostrar a mensagem de PAUSADO
        }

        // NOVO: Função para alternar Start/Pause
        function toggleGame() {
            if (gameRunning) {
                pauseGameLoop();
            } else {
                // Se for a primeira vez, inicializa o loop do jogo
                startGameLoop(); 
            }
        }


        // --- Controle de Teclas ---

        document.addEventListener('keydown', (event) => {
            if (!gameRunning) return; // Ignora o input se estiver pausado

             // Tecla Cima (ArrowUp) e a cobra não está indo para baixo
             if (event.key === 'ArrowUp' && velocityY === 0) {
                 velocityX = 0;
                 velocityY = -gridSize;
             }
             // Tecla Baixo (ArrowDown) e a cobra não está indo para cima
             else if (event.key === 'ArrowDown' && velocityY === 0) {
                 velocityX = 0;
                 velocityY = gridSize;
             }
             // Tecla Esquerda (ArrowLeft) e a cobra não está indo para direita
             else if (event.key === 'ArrowLeft' && velocityX === 0) {
                 velocityX = -gridSize;
                 velocityY = 0;
             }
             // Tecla Direita (ArrowRight) e a cobra não está indo para esquerda
             else if (event.key === 'ArrowRight' && velocityX === 0) {
                 velocityX = gridSize;
                 velocityY = 0;
             }
             // NOVO: Adiciona a tecla Espaço para Pausa (Opcional)
             else if (event.key === ' ') {
                 toggleGame();
                 event.preventDefault(); // Evita o scroll da página ao apertar Espaço
             }
        });
        
        // NOVO: Adiciona eventos de clique aos botões
        startPauseButton.addEventListener('click', toggleGame);
        resetButton.addEventListener('click', () => resetGame(false)); // Reinicia sem o alerta de Fim de Jogo

        // --- Inicialização ---
        // O jogo não inicia automaticamente, apenas prepara o campo
        resetGame(false); // Inicia o estado inicial do jogo e coloca "Iniciar" no botão
