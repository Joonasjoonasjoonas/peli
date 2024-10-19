import GameStore from "../../store/GameStore";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { getIndexFromXY, randomNumber } from "../../utils/utils";
import { generateCave } from "./caveGenerator";
import { generateTunnels } from "./tunnelGenerator";
import { TileType, wall, floor } from "./tileTypes";

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

export const createWorldMap = (mapType: 'forest' | 'cave' | 'tunnels') => {
    const { addWorldMap } = GameStore;
    let map: TileType[];

    if (mapType === 'cave') {
        map = Array.from({ length: WORLD_HEIGHT * WORLD_WIDTH }, () => {
            const rnd = randomNumber(1, 5);
            if (rnd <= 3) return floor;
            else return wall;
        });
    } else {
        map = Array.from({ length: WORLD_HEIGHT * WORLD_WIDTH }, () => wall);
    }

    // make solid walls
    for (let x = 0; x < WORLD_WIDTH; x++) {
        map[getIndexFromXY(x, 0)] = wall;
        map[getIndexFromXY(x, WORLD_HEIGHT - 1)] = wall;
    }

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        map[getIndexFromXY(0, y)] = wall;
        map[getIndexFromXY(WORLD_WIDTH - 1, y)] = wall;
    }

    let finalMap: TileType[];

    switch (mapType) {
        case 'cave':
            finalMap = generateCave(map);
            break;
        case 'tunnels':
            finalMap = generateTunnels(map);
            break;
        case 'forest':
            // Implement forest generation here
            finalMap = map; // Placeholder
            break;
        default:
            finalMap = map;
    }

    addWorldMap(finalMap);
    createPathfindingMap(finalMap);
};
