import { CELL_SIZE, EMPTY, HEIGHT, MATRIX, WIDTH } from '.';

export function makeid(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function fillEmpties() {
  for (let i = 0; i < HEIGHT / CELL_SIZE; i++) {
    if (!MATRIX[i]) MATRIX[i] = [];

    for (let j = 0; j < WIDTH / CELL_SIZE; j++) {
      if (!MATRIX[i][j]) {
        MATRIX[i][j] = [];
      }

      if (!MATRIX[i][j][0]) {
        MATRIX[i][j][0] = EMPTY;
      }
      if (!MATRIX[i][j][1]) {
        MATRIX[i][j][1] = EMPTY;
      }
    }
  }
}
