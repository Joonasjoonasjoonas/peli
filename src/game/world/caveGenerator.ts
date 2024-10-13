import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { floor, TileType, wall } from "./map";

export const generateCave = (map: any) => {
    let deathLimit = 2;
    let birthLimit = 4;
    let numberOfSteps = 2;

    const countAliveNeighbours = (map: TileType[], x: number, y: number) => {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let nb_x = i + x;
                let nb_y = j + y;
                if (i === 0 && j === 0) {
                } else if (
                    nb_x < 0 ||
                    nb_y < 0 ||
                    nb_x >= WORLD_WIDTH ||
                    nb_y >= WORLD_HEIGHT
                ) {
                    count = count + 1;
                } else if (map[getIndexFromXY(nb_x, nb_y)] === wall) {
                    count = count + 1;
                }
            }
        }
        return count;
    };

    const doSimulationStep = (map: any) => {
        //Here's the new map we're going to copy our data into
        let newMap: TileType[] = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                //Count up the neighbours
                let nbs = countAliveNeighbours(map, x, y);
                //If the tile is currently solid
                if (map[getIndexFromXY(x, y)] === wall) {
                    //See if it should die
                    if (nbs < deathLimit) {
                        newMap[getIndexFromXY(x, y)] = floor;
                    }
                    //Otherwise keep it solid
                    else {
                        newMap[getIndexFromXY(x, y)] = wall;
                    }
                }
                //If the tile is currently empty
                else {
                    //See if it should become solid
                    if (nbs > birthLimit) {
                        newMap[getIndexFromXY(x, y)] = wall;
                    } else {
                        newMap[getIndexFromXY(x, y)] = floor;
                    }
                }
            }
        }

        return newMap;
    };

    //This function counts the number of solid neighbours a tile has

    const generateMap = (map: any) => {
        for (let i = 0; i < numberOfSteps; i++) {
            map = doSimulationStep(map);
        }

        // Add 6x6 area of floor tiles to upper left corner
        for (let x = 1; x < 4; x++) {
            for (let y = 1; y < 4; y++) {
                map[getIndexFromXY(x, y)] = floor;
            }
        }

        return map;
    };

    return generateMap(map);
};
