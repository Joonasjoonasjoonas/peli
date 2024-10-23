import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { TileType, bush, grass, soil} from "./tileTypes";
import { createNoise2D } from "simplex-noise"; 

const noise2D = createNoise2D();

export const generateForest = (): TileType[] => {
    const map: TileType[] = [];
    const noiseScale = 0.1; // Adjust for more or less detail
    const thresholdGrass = 0.01; // Threshold for grass
    const thresholdBush = 0.6; // Threshold for bushes


    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const noiseValue = noise2D(x * noiseScale, y * noiseScale);

            let tile: TileType;

            if (noiseValue > thresholdBush) {
                tile = bush;
            } else if (noiseValue > thresholdGrass) {
                tile = grass;
            } else {
                tile = soil;
            }

            map.push(tile);
        }
    }

    return map;
};
