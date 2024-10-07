"use strict";

(() => {
  window.addEventListener("load", () => {
    // ************************************************************************
    // #region Constants and Variables

    // Canvas references
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    // UI references
    const restartButton = document.querySelector("#restart");
    const undoButton = document.querySelector("#undo");

    // Constants
    const CELLS_PER_AXIS = 3;
    const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
    const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;

    // Game objects
    let grids;
    let currentPlayer = "X"; // Player 1 starts as "X"
    let history = [];

    // #endregion

    // ************************************************************************
    // #region Game Logic

    function startGame() {
      grids = Array(CELLS_PER_AXIS * CELLS_PER_AXIS).fill(null);
      history = [];
      render();
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      for (let i = 0; i < CELLS_PER_AXIS; i++) {
        for (let j = 0; j < CELLS_PER_AXIS; j++) {
          const index = i * CELLS_PER_AXIS + j;
          ctx.strokeStyle = "#000";
          ctx.strokeRect(j * CELL_WIDTH, i * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

          if (grids[index]) {
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(grids[index], j * CELL_WIDTH + CELL_WIDTH / 2, i * CELL_HEIGHT + CELL_HEIGHT / 2);
          }
        }
      }
    }

    function updateGridAt(x, y) {
      const column = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);
      const index = row * CELLS_PER_AXIS + column;

      if (!grids[index]) {
        grids[index] = currentPlayer;
        history.push(index);
        checkWinCondition();
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        render();
      }
    }

    function checkWinCondition() {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]            // Diagonals
      ];

      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (grids[a] && grids[a] === grids[b] && grids[a] === grids[c]) {
          alert(`${grids[a]} wins!`);
          startGame();
          return;
        }
      }

      if (!grids.includes(null)) {
        alert("It's a draw!");
        startGame();
      }
    }

    function undoLastMove() {
      if (history.length > 0) {
        const lastMove = history.pop();
        grids[lastMove] = null;
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        render();
      }
    }

    function restart() {
      startGame();
    }

    // #endregion

    // ************************************************************************
    // #region Event Listeners

    canvas.addEventListener("mousedown", (event) => {
      updateGridAt(event.offsetX, event.offsetY);
    });

    restartButton.addEventListener("mousedown", restart);
    undoButton.addEventListener("mousedown", undoLastMove);

    // #endregion

    startGame();
  });
})();
