(function() {
    const modal = document.querySelector('#modal');
    const form = document.querySelector('#nameForm');

     // Form submission event listener
     form.addEventListener("submit", function(event) {
        event.preventDefault(); 

        const playerName = document.getElementById("name").value;

        // Initialize the GameController with the player's name
        const gameController = GameController(playerName, "Computer");

       // Hide the modal
        modal.style.display = "none"; 

        // Initialize the DisplayController with the GameController instance
        DisplayController(gameController);
    });

    // Function to display results on the screen
    function displayResult(message) {
        const resultDiv = document.querySelector('.result');
        resultDiv.textContent = message; // Update the result div with the game result
    }

    function Cell() {
        let value = 0;

        const addMark = (player) => {
            value = player;
        };

        const getValue = () => value;

        return {
            addMark,
            getValue
        };
    }

    function Gameboard() {
        const rows = 3;
        const columns = 3;
        const board = [];

        // Create 3x3 playing cells
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell());
            }
        }

        const getBoard = () => board;

        const markCell = (row, column, player) => {
            if (board[row][column].getValue() !== 0) return false; // Cell is already marked
            board[row][column].addMark(player);
            return true;
        };

        const resetBoard = () => {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    board[i][j].addMark(0); // Reset all cells
                }
            }
        };

        return { getBoard, markCell, resetBoard };
    }

    function GameController(playerName, computerName = "Computer") {
        const board = Gameboard();

        const players = [
            {
                name: playerName,
                mark: 'X'
            },
            {
                name: computerName,
                mark: 'O'
            }
        ];

        let activePlayer = players[0]; // Player goes first
        let gameOver = false; // Track game state

        const switchPlayerTurn = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
        };

        const getActivePlayer = () => activePlayer;

        const playRound = (row, column) => {
            if (gameOver) return false; // Prevent playing if the game is over

            if (board.markCell(row, column, getActivePlayer().mark)) {
                if (checkWin()) {
                    displayResult(`${getActivePlayer().name} wins! Click 'Reset' to play again!`); // Display the winner's name
                    gameOver = true;
                    return true; // Game Over
                }
                if (checkDraw()) {
                    displayResult("It's a draw! Click 'Reset' to play again!");
                    gameOver = true;
                    return true;
                }
                switchPlayerTurn();
                if (activePlayer === players[1]) {
                    // Computer's turn
                    computerMove();
                    if (checkWin()) {
                        displayResult(`${getActivePlayer().name} wins! Click 'Reset' to play again!`); // Display the computer's win
                        gameOver = true;
                        return true;
                    }
                    if (checkDraw()) {
                        displayResult("It's a draw! Click 'Reset' to play again!");
                        gameOver = true;
                        return true;
                    }
                    switchPlayerTurn();
                }
            }
            return false; // Not a valid move
        };

        const computerMove = () => {
            const availableCells = [];
            const b = board.getBoard();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (b[i][j].getValue() === 0) {
                        availableCells.push({ row: i, column: j });
                    }
                }
            }

            if (availableCells.length > 0) {
                const move = availableCells[Math.floor(Math.random() * availableCells.length)];
                board.markCell(move.row, move.column, getActivePlayer().mark);
            }
        };

        const checkWin = () => {
            const b = board.getBoard();
            // Check rows, columns, and diagonals for a win
            for (let i = 0; i < 3; i++) {
                if (b[i][0].getValue() === activePlayer.mark &&
                    b[i][1].getValue() === activePlayer.mark &&
                    b[i][2].getValue() === activePlayer.mark) return true; // Row check
                if (b[0][i].getValue() === activePlayer.mark &&
                    b[1][i].getValue() === activePlayer.mark &&
                    b[2][i].getValue() === activePlayer.mark) return true; // Column check
            }
            // Diagonal checks
            if (b[0][0].getValue() === activePlayer.mark &&
                b[1][1].getValue() === activePlayer.mark &&
                b[2][2].getValue() === activePlayer.mark) return true;

            if (b[0][2].getValue() === activePlayer.mark &&
                b[1][1].getValue() === activePlayer.mark &&
                b[2][0].getValue() === activePlayer.mark) return true;

            return false;
        };

        const checkDraw = () => {
            const b = board.getBoard();
            return b.flat().every(cell => cell.getValue() !== 0); // Check if all cells are marked
        };

        const resetGame = () => {
            board.resetBoard();
            activePlayer = players[0]; // Reset to player turn
            gameOver = false; // Allow the game to be played again
            displayResult(""); // Clear the result when the game is reset
        };

        return {
            getBoard: board.getBoard,
            playRound,
            getActivePlayer,
            resetGame,
            isGameOver: () => gameOver // Return the game over status
        };
    }

    function DisplayController(game) {
        const playerTurnDiv = document.querySelector('.turn');
        const boardDiv = document.querySelector('.board');
        const resetButton = document.querySelector('.reset');

        const updateScreen = () => {
            boardDiv.innerHTML = "";
            const board = game.getBoard(); // Get the current state of the board
            const activePlayer = game.getActivePlayer();
            playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

            board.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellButton = document.createElement("button");
                    cellButton.classList.add("cell");
                    cellButton.dataset.row = rowIndex;
                    cellButton.dataset.column = colIndex;
                    cellButton.textContent = cell.getValue() || ''; // Show empty for unmarked cells
                    boardDiv.appendChild(cellButton);
                });
            });
        };

        function clickHandlerBoard(e) {
            const selectedColumn = e.target.dataset.column;
            const selectedRow = e.target.dataset.row;

            if (selectedColumn === undefined || selectedRow === undefined) return; // Guard clause
            if (game.isGameOver()) return; // Prevent any actions if the game is over

            const gameOver = game.playRound(parseInt(selectedRow), parseInt(selectedColumn)); // Pass both row and column
            updateScreen();
        }

        function resetGame() {
            game.resetGame();
            updateScreen();
        }

        //********* Listening for events ***********
        boardDiv.addEventListener("click", clickHandlerBoard);
        resetButton.addEventListener("click", resetGame);

        // Initial render
        updateScreen();
    }

   

})();
