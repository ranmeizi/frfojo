/* eslint-disable @typescript-eslint/no-this-alias */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { AI } from "./ai";
import { Grid } from "./grid";
import { Tile } from "./tile";

export function GameManager(size) {
  this.size = size; // Size of the grid

  this.running = false;

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai = new AI(this.grid);

  this.score = 0;
  this.over = false;
  this.won = false;

  // Update the actuator
  this.actuate();
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  // 没有
};

// makes a given move and updates state
GameManager.prototype.move = function (direction) {
  const result = this.grid.move(direction);
  if (!result.moved) return false;

  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
  return true;
};

// moves continuously until game is over
GameManager.prototype.run = function () {
  const best = this.ai.getBest();
  for (let i = 0; i < 4; i++) {
    const m = best.moves[i];
    if (this.move(m)) break;
  }
  const timeout = 10;
  if (this.running && !this.over && !this.won) {
    const self = this;
    setTimeout(function () {
      self.run();
    }, timeout);
  }
};

GameManager.prototype.setGrid = function (grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      this.grid.removeTile({ x, y });
      if (grid[y][x]) {
        this.grid.insertTile(new Tile({ x, y }, grid[y][x]));
      }
    }
  }
  this.actuate();
};
