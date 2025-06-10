function generateSudoku() {
    function copyGrid(grid) {
        return grid.map(row => row.slice());
    }

    function isValid_2(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }

    function countSolutions(grid) {
        let count = 0;
        function solve() {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValid_2(grid, row, col, num)) {
                                grid[row][col] = num;
                                solve();
                                grid[row][col] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
            if (count > 1) return;
        }
        solve();
        return count;
    }

    function fillGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isValid_2(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (fillGrid(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    let grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillGrid(grid);

    let positions = [];
    for (let row = 0; row < 9; row++)
        for (let col = 0; col < 9; col++)
            positions.push([row, col]);
    positions = positions.sort(() => Math.random() - 0.5);

    for (let [row, col] of positions) {
        let backup = grid[row][col];
        grid[row][col] = 0;
        let gridCopy = copyGrid(grid);
        if (countSolutions(gridCopy) !== 1) {
            grid[row][col] = backup;
        }
    }
    return grid;
}

let currentPuzzle = [];
let originalPuzzle = [];

function initGame() {
    createBoard();
    newGame();
}

function createBoard() {
    const board = document.getElementById('sudokuBoard');
    board.innerHTML = '';

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('input');
        cell.className = 'sudoku-cell';
        cell.type = 'text';
        cell.maxLength = 1;
        cell.addEventListener('input', handleInput);
        board.appendChild(cell);
    }
}

function handleInput(event) {
    const value = event.target.value;

    if (value && (isNaN(value) || value < 1 || value > 9)) {
        event.target.value = '';
        return;
    }

    clearErrors();
    checkForConflicts();
}

function newGame() {
    let puzzles=generateSudoku();
    currentPuzzle = puzzles.map(row => [...row]);
    originalPuzzle = puzzles.map(row => [...row]);

    loadPuzzle();
    clearMessage();
}

function loadPuzzle() {
    const cells = document.querySelectorAll('.sudoku-cell');

    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = currentPuzzle[row][col];

        if (value !== 0) {
            cell.value = value;
            cell.classList.add('prefilled');
            cell.readOnly = true;
        } else {
            cell.value = '';
            cell.classList.remove('prefilled');
            cell.readOnly = false;
        }

        cell.classList.remove('error');
    });
}

function resetGame() {
    alert("Do You really want to Reset sudoku ?")
    currentPuzzle = originalPuzzle.map(row => [...row]);
    loadPuzzle();
    clearMessage();
}

function checkForConflicts() {
    const cells = document.querySelectorAll('.sudoku-cell');
    let hasConflicts = false;

    cells.forEach((cell, index) => {
        if (!cell.value || cell.classList.contains('prefilled')) return;

        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = parseInt(cell.value);

        if (hasConflict(row, col, value)) {
            cell.classList.add('error');
            hasConflicts = true;
        } else {
            cell.classList.remove('error');
        }
    });

    return !hasConflicts;
}

function hasConflict(row, col, value) {
    const cells = document.querySelectorAll('.sudoku-cell');

    for (let c = 0; c < 9; c++) {
        if (c !== col) {
            const cellIndex = row * 9 + c;
            const cellValue = parseInt(cells[cellIndex].value);
            if (cellValue === value) return true;
        }
    }

    for (let r = 0; r < 9; r++) {
        if (r !== row) {
            const cellIndex = r * 9 + col;
            const cellValue = parseInt(cells[cellIndex].value);
            if (cellValue === value) return true;
        }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (r !== row || c !== col) {
                const cellIndex = r * 9 + c;
                const cellValue = parseInt(cells[cellIndex].value);
                if (cellValue === value) return true;
            }
        }
    }

    return false;
}

function checkSolution() {
    const cells = document.querySelectorAll('.sudoku-cell');

    for (let cell of cells) {
        if (!cell.value) {
            showMessage('Puzzle is not complete!', 'error');
            return;
        }
    }

    if (!checkForConflicts()) {
        showMessage('There are conflicts in your solution!', 'error');
        return;
    }

    showMessage('Congratulations! Puzzle solved correctly! 🎉', 'success');
}

function clearErrors() {
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('error');
    });
}

function showMessage(text, type = '') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function clearMessage() {
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
}

document.addEventListener('DOMContentLoaded', initGame);