// @ts-nocheck

export function AI(grid) {
  this.grid = grid;
  this.v = new window.convnetjs.Vol(4, 4, 16, 0.0);
}

AI.prototype.make_input = function () {
  this.v.setConst(0.0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (this.grid.cells[j][i] !== null) {
        let v = this.grid.cells[j][i].value | 0;
        let k = 0;
        while (v > 2) {
          v >>= 1;
          k += 1;
        }
        this.v.w[i * 4 * 16 + j * 16 + k] = 1;
      }
    }
  }
  console.log("input", this.grid);
};

// performs a search and returns the best move
AI.prototype.getBest = function (net) {
  //console.log(this.grid);
  this.make_input();
  //console.log(this.v);
  const p = net.forward(this.v).w;
  let m = [0, 1, 2, 3];
  m.sort(function (i, j) {
    return p[j] - p[i];
  });
  //console.log(p);
  //console.log(m);
  m = m.map(function (x) {
    return (x + 3) % 4;
  });
  return { move: m[0], moves: m };
};

AI.prototype.translate = function (move) {
  return {
    0: "up",
    1: "right",
    2: "down",
    3: "left",
  }[move];
};
