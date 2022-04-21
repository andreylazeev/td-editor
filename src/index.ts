import * as PIXI from 'pixi.js';
import tileGrassDark from './images/grass_dark.png';
import tileGrassLight from './images/grass_light.png';
import tileRoad from './images/road.png';
import tileRoadTL from './images/road_t_l.png';
import tileRoadTR from './images/road_t_r.png';
import tileRoadBL from './images/road_b_l.png';
import tileRoadBR from './images/road_b_r.png';
import tilePathStart from './images/path_start.png';
import tilePathEnd from './images/path_end.png';
import tileWaterLight from './images/water_light.png';
import tileWaterWall from './images/water_wall.png';
import tileStoneFirst from './images/stone_1.png';
import tileStoneSecond from './images/stone_2.png';
import { Graph, astar } from 'javascript-astar';
import { WavesEditor } from './entities/wavesEditor';

const navigation: HTMLElement = document.querySelector('.navigation');
const setInput: HTMLInputElement = document.querySelector('#set_input');
const getButton: HTMLElement = document.querySelector('#get_button');
const gridButton: HTMLElement = document.querySelector('#grid_button');
const pathButton: HTMLElement = document.querySelector('#path_button');
const pathSaveButton: HTMLElement = document.querySelector('#pathsave_button');
const clearEmptyButton: HTMLElement = document.querySelector('#clear_empty_button');

const ATTRIBUTE_TILE = 'data-tile';

const WIDTH = 4800;
const HEIGHT = 4800;
const CELL_SIZE = 50;

const EMPTY = 'empty';
const ROAD = 'road';
const ROAD_T_L = 'road-t-l';
const ROAD_T_R = 'road-t-r';
const ROAD_B_L = 'road-b-l';
const ROAD_B_R = 'road-b-r';
const GRASS_DARK = 'grass-dark';
const GRASS_LIGHT = 'grass-light';
const PATH_START = 'path_start';
const PATH_END = 'path_end';
const STONE_1 = 'stone-1';
const STONE_2 = 'stone-2';
const WATER_LIGHT = 'water-light';
const WATER_WALL = 'water-wall';

let activeTile = ROAD;

const BUTTON_CLASS = 'button';
const BUTTON_CLASS_ACTIVE = 'button--active';

let empties = { x: 0, y: 0 };

let pathRoadsIndex = 0;
let pathRoads: { start: [number, number] | []; end: [number, number] | []; id: string }[] = [];

let paths: Record<string, { x: number; y: number }[]> = {};

export const wavesEditor = new WavesEditor(document.querySelector('.waves'), Object.keys(paths));

let waves: any[] = [];

wavesEditor.onEnemyAdd = (a: any) => {
  waves = a;
  // console.log(Object.values(a).map((el: any) => el.map((elem: any) => ({ enemies: elem }))));
};

function createNavigationButton(text: string, img?: string, tile?: any) {
  const button = document.createElement('button');
  button.classList.add(BUTTON_CLASS);
  if (activeTile === tile) {
    button.classList.add(BUTTON_CLASS_ACTIVE);
  }
  button.setAttribute(ATTRIBUTE_TILE, String(tile || EMPTY));

  if (tile) {
    button.style.backgroundImage = `url(${img})`;
  } else {
    button.textContent = text;
  }

  navigation.appendChild(button);
}

createNavigationButton('Пустой блок');
createNavigationButton('Начало пути', tilePathStart, PATH_START);
createNavigationButton('Конец пути', tilePathEnd, PATH_END);
createNavigationButton('', tileRoad, ROAD);
createNavigationButton('', tileRoadTR, ROAD_T_R);
createNavigationButton('', tileRoadTL, ROAD_T_L);
createNavigationButton('', tileRoadBR, ROAD_B_R);
createNavigationButton('', tileRoadBL, ROAD_B_L);
createNavigationButton('', tileGrassDark, GRASS_DARK);
createNavigationButton('', tileGrassLight, GRASS_LIGHT);
createNavigationButton('', tileStoneFirst, STONE_1);
createNavigationButton('', tileStoneSecond, STONE_2);
createNavigationButton('', tileWaterLight, WATER_LIGHT);
createNavigationButton('', tileWaterWall, WATER_WALL);

const gridContainer = new PIXI.Container();
const pathContainer = new PIXI.Container();
const pathLinesContainer = new PIXI.Container();
const containerFirst = new PIXI.Container();

const app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundAlpha: 0,
});
app.stage.addChild(gridContainer, containerFirst, pathContainer, pathLinesContainer);

const drawLines = (x: number, y: number, id: string) => {
  const container = new PIXI.Container();
  const circle = new PIXI.Graphics();
  const text = new PIXI.Text(id);
  text.style.fontSize = 12;
  circle.beginFill(0xff0000);
  circle.drawCircle(15, 15, 15);
  circle.endFill();

  text.x = circle.width / 2 - text.width / 2;
  text.y = circle.height / 2 - text.height / 2;

  container.addChild(circle, text);
  container.x = x * CELL_SIZE + (CELL_SIZE / 2 - container.width / 2);
  container.y = y * CELL_SIZE + (CELL_SIZE / 2 - container.height / 2);

  pathLinesContainer.addChild(container);
};

pathButton.onclick = () => {
  clearEmpty();
  pathLinesContainer.removeChildren();
  if (pathRoads.length > 0) {
    const correctMatrix = MATRIX.map((el) => {
      return el.map((element) => {
        if (element[0] === EMPTY && element[1] === EMPTY) {
          return 0;
        }
        if (element[1] === EMPTY) {
          switch (element[0]) {
            case EMPTY:
            case ROAD:
              return 1;
            default:
              return 0;
          }
        }
        if (element[1] !== EMPTY) {
          switch (element[1]) {
            case ROAD_T_L:
            case ROAD_T_R:
            case ROAD_B_L:
            case ROAD_B_R:
              return 1;
            default:
              return 0;
          }
        }
      });
    });

    pathRoads.forEach((road) => {
      const graph = new Graph(correctMatrix);
      var start = graph.grid[road.start[0]][road.start[1]];
      var end = graph.grid[road.end[0]][road.end[1]];
      var result = astar.search(graph, start, end);
      paths[road.id] = [
        { x: road.start[1], y: road.start[0], id: road.id },
        ...result.map((path: any) => ({ x: path.y, y: path.x, id: road.id })),
      ];
    });
  }

  Object.values(paths).forEach((path) => {
    path.forEach((road) => {
      //@ts-ignore
      drawLines(road.x, road.y, road.id);
    });
  });

  wavesEditor.updatePaths(Object.keys(paths));
};

pathSaveButton.onclick = () => {};

const clearEmpty = () => {
  const emptiesY: boolean[] = [];
  const emptiesX: boolean[] = [];

  for (let y = 0; y < MATRIX.length; y++) {
    emptiesY[y] = true;
    for (let x = 0; x < MATRIX[y].length; x++) {
      if (typeof emptiesX[x] === 'undefined') {
        emptiesX[x] = true;
      }
      const el = MATRIX[y][x][0];
      if (el !== EMPTY) {
        emptiesY[y] = false;
        emptiesX[x] = false;
      }
    }
  }

  for (let i = 0; i < emptiesX.length; i++) {
    empties.x += 1;
    if (!emptiesX[i]) {
      empties.x -= 1;
      break;
    }
  }
  for (let i = 0; i < emptiesY.length; i++) {
    empties.y += 1;
    if (!emptiesY[i]) {
      empties.y -= 1;
      break;
    }
  }

  pathRoads.forEach((road) => {
    road.start[1] -= empties.x;
    road.start[0] -= empties.y;
    road.end[1] -= empties.x;
    road.end[0] -= empties.y;
  });

  MATRIX = MATRIX.map((y) => {
    return y.filter((_, index) => {
      return !emptiesX[index];
    });
  });

  MATRIX = MATRIX.filter((_, index) => {
    return !emptiesY[index];
  });

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
  update();
  empties = { x: 0, y: 0 };
};

clearEmptyButton.onclick = clearEmpty;

navigation.onclick = (e) => {
  const target = e.target as HTMLElement;
  const tile = target.getAttribute('data-tile');

  if (tile) {
    document.querySelectorAll('.' + BUTTON_CLASS_ACTIVE).forEach((e: HTMLElement) => {
      e.classList.remove(BUTTON_CLASS_ACTIVE);
    });
    target.classList.add(BUTTON_CLASS_ACTIVE);
    activeTile = tile;
  }
};

let MATRIX: Array<string[][]> = [];

for (let i = 0; i < HEIGHT / CELL_SIZE; i++) {
  if (!MATRIX[i]) MATRIX[i] = [];

  for (let j = 0; j < WIDTH / CELL_SIZE; j++) {
    MATRIX[i][j] = [EMPTY, EMPTY];
  }
}

function downloadAsFile(data: any, fileName: string) {
  data = JSON.stringify(data);
  const a = document.createElement('a');
  const file = new Blob([data], { type: 'application/json' });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

document.body.appendChild(app.view);

function drawNewGrid(gridContainer: PIXI.Container) {
  const START_X = 0;
  const START_Y = 0;

  for (let i = 0; i < HEIGHT / CELL_SIZE; i++) {
    for (let j = 0; j < WIDTH / CELL_SIZE; j++) {
      let rectangle = new PIXI.Graphics();

      rectangle.lineStyle(2, PIXI.utils.string2hex('#000000'), 0.05);

      rectangle.drawRect(START_X + j * CELL_SIZE, START_Y + i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      gridContainer.addChild(rectangle);
    }
  }
}

drawNewGrid(gridContainer);

gridButton.onclick = () => {
  gridContainer.visible = !gridContainer.visible;
};

function update() {
  containerFirst.removeChildren();
  pathContainer.removeChildren();

  MATRIX.forEach((value, y) => {
    value.forEach((tile, x) => {
      if (tile[0] !== EMPTY && tile) {
        let sprite: PIXI.Sprite;
        let spriteSecond: PIXI.Sprite;

        switch (tile[0]) {
          case ROAD:
            sprite = PIXI.Sprite.from(tileRoad);
            break;
          case GRASS_DARK:
            sprite = PIXI.Sprite.from(tileGrassDark);
            break;
          case GRASS_LIGHT:
            sprite = PIXI.Sprite.from(tileGrassLight);
            break;
          case PATH_START:
            sprite = PIXI.Sprite.from(tilePathStart);
            break;
          case PATH_END:
            sprite = PIXI.Sprite.from(tilePathEnd);
            break;
          case WATER_LIGHT:
            sprite = PIXI.Sprite.from(tileWaterLight);
            break;
          case WATER_WALL:
            sprite = PIXI.Sprite.from(tileWaterWall);
            break;
        }
        switch (tile[1]) {
          case ROAD_B_L:
            spriteSecond = PIXI.Sprite.from(tileRoadBL);
            break;
          case ROAD_B_R:
            spriteSecond = PIXI.Sprite.from(tileRoadBR);
            break;
          case ROAD_T_L:
            spriteSecond = PIXI.Sprite.from(tileRoadTL);
            break;
          case ROAD_T_R:
            spriteSecond = PIXI.Sprite.from(tileRoadTR);
            break;
          case STONE_1:
            spriteSecond = PIXI.Sprite.from(tileStoneFirst);
            break;
          case STONE_2:
            spriteSecond = PIXI.Sprite.from(tileStoneSecond);
            break;
        }

        sprite.y = y * CELL_SIZE;
        sprite.x = x * CELL_SIZE;

        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;

        if (spriteSecond) {
          spriteSecond.y = y * CELL_SIZE;
          spriteSecond.x = x * CELL_SIZE;

          spriteSecond.width = CELL_SIZE;
          spriteSecond.height = CELL_SIZE;
        }

        containerFirst.addChild(sprite);

        if (tile[1] !== EMPTY) {
          containerFirst.addChild(spriteSecond);
        }
      }
    });
  });

  Object.values(pathRoads).forEach((road: any) => {
    createPathTile(road.start, tilePathStart);
    if (road.end) {
      createPathTile(road.end, tilePathEnd);
    }
  });
}

const createPathTile = (dot: [number, number], type: string) => {
  const sprite = PIXI.Sprite.from(type);
  sprite.x = dot[1] * CELL_SIZE;
  sprite.y = dot[0] * CELL_SIZE;
  sprite.width = CELL_SIZE;
  sprite.height = CELL_SIZE;
  pathContainer.addChild(sprite);
};

getButton.onclick = () => {
  const gameMatrix = MATRIX.map((row) =>
    row
      .map((el: any) => {
        let elFirst = -1;
        let elSecond = -1;

        switch (el[0]) {
          case EMPTY:
            elFirst = -1;
            break;
          case GRASS_DARK:
            elFirst = 0;
            break;
          case GRASS_LIGHT:
            elFirst = 1;
            break;
          case ROAD:
            elFirst = 2;
            break;
          case WATER_WALL:
            elFirst = 9;
            break;
          case WATER_LIGHT:
            elFirst = 10;
            break;
        }
        switch (el[1]) {
          case ROAD_B_R:
            elSecond = 3;
            break;
          case ROAD_B_L:
            elSecond = 4;
            break;
          case ROAD_T_R:
            elSecond = 5;
            break;
          case ROAD_T_L:
            elSecond = 6;
            break;
          case STONE_1:
            elSecond = 7;
            break;
          case STONE_2:
            elSecond = 8;
            break;
        }
        return [elFirst, elSecond];
      })
      .filter((element) => JSON.stringify(element) !== '[-1,-1]'),
  ).filter((e) => e.length);

  const correctWaves: any = [];
  Object.values(waves).forEach((wave: any) => {
    const enemies = wave.map((waveType: any) => ({ types: waveType.types.map((el: any) => el.id), path: waveType.path }));
    correctWaves.push({ enemies });
  });
  downloadAsFile({ stage: gameMatrix, paths, waves: correctWaves }, 'matrix.json');
};
export enum Cells {
  'grass-dark',
  'grass-light',
  'road',
  'road-b-r',
  'road-b-l',
  'road-t-r',
  'road-t-l',
  'stone-1',
  'stone-2',
  'water-wall',
  'water-light',
}

setInput.oninput = () => {
  const file = setInput.files[0];

  const reader = new FileReader();

  reader.readAsText(file);

  reader.onload = () => {
    try {
      const array = JSON.parse(String(reader.result));
      MATRIX = array;
      update();
    } catch {
      alert('Упс, чет не так');
    }

    setInput.value = '';
  };

  reader.onerror = () => {
    alert('Упс, чет не так');

    setInput.value = '';
  };
};

app.renderer.view.addEventListener('click', (e) => {
  const HTML = document.documentElement;
  const Y = Math.ceil((HTML.scrollTop + e.clientY) / CELL_SIZE) - 1;
  const X = Math.ceil((HTML.scrollLeft + e.clientX) / CELL_SIZE) - 1;

  if (activeTile === PATH_START) {
    pathRoads[pathRoadsIndex] = { ...pathRoads[pathRoadsIndex], start: [Y, X] };
  } else if (activeTile === PATH_END) {
    pathRoads[pathRoadsIndex] = { ...pathRoads[pathRoadsIndex], end: [Y, X], id: `${pathRoadsIndex}` };
    pathRoadsIndex += 1;
  } else {
    switch (activeTile) {
      case EMPTY:
        MATRIX[Y][X][0] = activeTile;
        MATRIX[Y][X][1] = activeTile;
        break;
      case GRASS_LIGHT:
      case GRASS_DARK:
      case WATER_LIGHT:
      case WATER_WALL:
        MATRIX[Y][X][0] = activeTile;
        break;
      case ROAD_B_L:
      case ROAD_B_R:
      case ROAD_T_R:
      case ROAD_T_L:
      case STONE_1:
      case STONE_2:
        if (MATRIX[Y][X][0] !== EMPTY) {
          MATRIX[Y][X][1] = activeTile;
        }
        break;
      case ROAD:
        if (MATRIX[Y][X][1] !== STONE_1 && MATRIX[Y][X][1] !== STONE_2) {
          MATRIX[Y][X][0] = activeTile;
        }
        break;
    }
  }
  update();
});
