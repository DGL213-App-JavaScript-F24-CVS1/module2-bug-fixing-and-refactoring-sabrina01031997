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
    const rotateButton = document.querySelector("#rotate");
    const colorSelectButtons = document.querySelectorAll(".color-select");
    const playerScoreText = document.querySelector("#score-text");

    // Constants
    const CELL_COLORS = {
      white: [255, 255, 255],
      black: [0, 0, 0],
      red: [255, 0, 0],
      green: [0, 255, 0],
      blue: [0, 0, 255],
    };
    const CELLS_PER_AXIS = 9;
    const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
    const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;
    const MAXIMUM_SCORE = CELLS_PER_AXIS * CELLS_PER_AXIS;

    // Game objects
    let replacementColor = CELL_COLORS.white;
    let grids;
    let playerScore = MAXIMUM_SCORE;

    // #endregion

    // ************************************************************************
    // #region Game Logic

    function startGame(startingGrid = []) {
      if (startingGrid.length === 0) {
        startingGrid = initializeGrid();
      }
      initializeHistory(startingGrid);
      render(grids[0]);
    }

    function initializeGrid() {
      const newGrid = [];
      for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
        newGrid.push(chooseRandomPropertyFrom(CELL_COLORS));
      }
      return newGrid;
    }

    function initializeHistory(startingGrid) {
      grids = [];
      grids.push(startingGrid);
    }

    function rollBackHistory() {
      if (grids.length > 1) { // Prevent rollback if there is only the initial grid
        grids.pop();
        render(grids[grids.length - 1]);
      }
    }

    function transposeGrid() {
      const currentGrid = grids[grids.length - 1];
      for (let i = 0; i < currentGrid.length; i++) {
        const currentGridRow = Math.floor(i / CELLS_PER_AXIS);
        const currentGridColumn = i % CELLS_PER_AXIS;
        if (currentGridColumn >= currentGridRow) {
          const tempCellStorage = currentGrid[i];
          currentGrid[i] = currentGrid[currentGridColumn * CELLS_PER_AXIS + currentGridRow];
          currentGrid[currentGridColumn * CELLS_PER_AXIS + currentGridRow] = tempCellStorage;
        }
      }
      render(currentGrid);
    }

    function render(grid) {
      for (let i = 0; i < grid.length; i++) {
        ctx.fillStyle = `rgb(${grid[i][0]}, ${grid[i][1]}, ${grid[i][2]})`;
        ctx.fillRect(
          (i % CELLS_PER_AXIS) * CELL_WIDTH,
          Math.floor(i / CELLS_PER_AXIS) * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
      playerScoreText.textContent = playerScore;
    }

    function updateGridAt(gridCoordinates) {
      const newGrid = grids[grids.length - 1].slice();
      const colorToChange = newGrid[gridCoordinates.column * CELLS_PER_AXIS + gridCoordinates.row];
      
      if (!arraysAreEqual(colorToChange, replacementColor)) {
        floodFill(newGrid, gridCoordinates, colorToChange);
        grids.push(newGrid);
        return true; // Return true if a change was made
      }
      return false; // No change made
    }

    function updatePlayerScore() {
      playerScore = playerScore > 0 ? playerScore - 1 : 0;
    }

    function floodFill(grid, gridCoordinate, colorToChange) {
      if (arraysAreEqual(colorToChange, replacementColor)) return;
      if (!arraysAreEqual(grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column], colorToChange)) return;
      
      grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] = replacementColor;
      
      floodFill(grid, { column: Math.max(gridCoordinate.column - 1, 0), row: gridCoordinate.row }, colorToChange);
      floodFill(grid, { column: Math.min(gridCoordinate.column + 1, CELLS_PER_AXIS - 1), row: gridCoordinate.row }, colorToChange);
      floodFill(grid, { column: gridCoordinate.column, row: Math.max(gridCoordinate.row - 1, 0) }, colorToChange);
      floodFill(grid, { column: gridCoordinate.column, row: Math.min(gridCoordinate.row + 1, CELLS_PER_AXIS - 1) }, colorToChange);
    }

    function restart() {
      startGame(grids[0]);
    }

    // #endregion

    // ************************************************************************
    // #region Event Listeners

    canvas.addEventListener("mousedown", gridClickHandler);
    function gridClickHandler(event) {
      const gridCoordinates = convertCartesiansToGrid(event.offsetX, event.offsetY);
      if (updateGridAt(gridCoordinates)) { // Call render only if a change occurs
        updatePlayerScore();
        render(grids[grids.length - 1]);
      }
    }

    restartButton.addEventListener("mousedown", restartClickHandler);
    function restartClickHandler() {
      restart();
    }

    undoButton.addEventListener("mousedown", undoLastMove);
    function undoLastMove() {
      rollBackHistory();
    }

    rotateButton.addEventListener("mousedown", rotateGrid);
    function rotateGrid() {
      transposeGrid();
    }

    colorSelectButtons.forEach((button) => {
      button.addEventListener("mousedown", () => (replacementColor = CELL_COLORS[button.name]));
    });

    // #endregion

    // ************************************************************************
    // #region Helper Functions

    function convertCartesiansToGrid(xPos, yPos) {
      return {
        column: Math.floor(xPos / CELL_WIDTH),
        row: Math.floor(yPos / CELL_HEIGHT),
      };
    }

    function chooseRandomPropertyFrom(object) {
      const keys = Object.keys(object);
      return object[keys[Math.floor(keys.length * Math.random())]];
    }

    function arraysAreEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      return true;
    }

    // #endregion

    startGame();
  });
})();
