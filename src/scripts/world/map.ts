import GameStore from "../../store/GameStore";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { getIndexFromXY, randomNumber } from "../../utils/utils";
import { generateCave } from "./caveGenerator";

export interface TileType {
    type: string;
    blocking: boolean;
    visible: boolean;
}

export const floor: TileType = {
    type: "floor",
    blocking: false,
    visible: false,
};
export const wall: TileType = {
    type: "wall",
    blocking: true,
    visible: false,
};

const createPathfindingMap = (map: TileType[]) => {
    const { addPathfindingGrid } = GameStore;

    let pathfindingMap: any = [];
    let row: TileType[];
    for (let i = 0; i < WORLD_HEIGHT; i++) {
        row = map.slice(i * WORLD_WIDTH, i * WORLD_WIDTH + WORLD_WIDTH);

        const convertedRow = row.map((tile) => {
            if (tile.blocking === true) return 1;
            else return 0;
        });
        pathfindingMap.push(convertedRow);
    }

    addPathfindingGrid(pathfindingMap);
};

export const createWorldMap = () => {
    const { addWorldMap } = GameStore;
    const map = Array.from({ length: WORLD_HEIGHT * WORLD_WIDTH }, () => {
        const rnd = randomNumber(1, 5);
        if (rnd <= 3) return floor;
        else return wall;
    });

    // make solid walls

    for (let x = 0; x < WORLD_WIDTH; x++) {
        map[getIndexFromXY(x, 0)] = wall;
    }

    for (let x = 0; x < WORLD_WIDTH; x++) {
        map[getIndexFromXY(x, WORLD_HEIGHT - 1)] = wall;
    }

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        map[getIndexFromXY(0, y)] = wall;
    }
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        map[getIndexFromXY(WORLD_WIDTH - 1, y)] = wall;
    }

    const caveMap = generateCave(map);

    addWorldMap(caveMap);
    createPathfindingMap(caveMap);
};
