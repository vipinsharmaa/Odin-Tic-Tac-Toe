// Gameboard
function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const markCell = (row, column, player) => {
        if (board[row][column].getValue() !== 0) return false; // Cell already marked
        board[row][column].addMark(player);
        return true; // Cell successfully marked
    };

    return { getBoard, markCell };
}

// Single cell
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

function GameController(playerName = "Player", computerName = "Computer") {
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

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        if (board.markCell(row, column, getActivePlayer().mark)) {
            if (checkWin()) {
                alert(`${getActivePlayer().name} wins!`); // Notify the winner
                return true; // Game Over
            }
            switchPlayerTurn();
            if (activePlayer === players[1]) {
                // Computer's turn
                computerMove(); // Make the computer move
                if (checkWin()) {
                    alert(`${getActivePlayer().name} wins!`); // Notify the winner
                    return true; // Game Over
                }
                switchPlayerTurn(); // Switch back to player
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

        return false; // No win
    };

    return {
        getBoard: board.getBoard,
        playRound,
        getActivePlayer
    };
}

function DisplayController() {
    const game = GameController(); // Create a new GameController instance
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        boardDiv.innerHTML = ""; // Clear the board before updating
        const board = game.getBoard(); // Get the current state of the board
        const activePlayer = game.getActivePlayer();
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.row = rowIndex; // Add row data
                cellButton.dataset.column = colIndex;
                cellButton.textContent = cell.getValue() || ''; // Show empty for unmarked cells
                boardDiv.appendChild(cellButton);
            });
        });
    }

    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;

        if (selectedColumn === undefined || selectedRow === undefined) return; // Guard clause

        const gameOver = game.playRound(parseInt(selectedRow), parseInt(selectedColumn)); // Pass both row and column
        updateScreen();
        if (gameOver) {
            // Optionally, you can reset or disable further moves here
            alert(`${game.getActivePlayer().name} wins!`); // Notify the winner
        }
    }

    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();
}

// To initialize the game, just call DisplayController();
DisplayController();
