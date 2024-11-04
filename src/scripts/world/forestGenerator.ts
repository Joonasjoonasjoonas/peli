import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { TileType, bush, grass, soil, tree, stairsDown } from "./tileTypes";
import { createNoise2D } from "simplex-noise"; 

export const generateForest = (): TileType[] => {
    const noise2D = createNoise2D();
    const map: TileType[] = [];
    const noiseScale = 0.1; // Adjust for more or less detail
    const thresholdGrass = 0.01; // Threshold for grass
    const thresholdBush = 0.6; // Threshold for bushes
    const treeChance = 0.1; // 10% chance for trees on grass

    // First pass - generate base terrain
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

    // Second pass - add trees on grass, checking adjacent tiles
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const index = y * WORLD_WIDTH + x;
            
            if (map[index].type === "grass" && Math.random() < treeChance) {
                // Check all adjacent tiles for existing trees
                let hasAdjacentTree = false;
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const checkY = y + dy;
                        const checkX = x + dx;
                        
                        if (checkY >= 0 && checkY < WORLD_HEIGHT && 
                            checkX >= 0 && checkX < WORLD_WIDTH) {
                            const checkIndex = checkY * WORLD_WIDTH + checkX;
                            if (map[checkIndex].type === "tree") {
                                hasAdjacentTree = true;
                                break;
                            }
                        }
                    }
                    if (hasAdjacentTree) break;
                }

                if (!hasAdjacentTree) {
                    map[index] = tree;
                }
            }
        }
    }

    // Add stairs down at a random location at least 10 tiles from spawn (1,1)
    let stairsPlaced = false;
    while (!stairsPlaced) {
        const stairsX = Math.floor(Math.random() * WORLD_WIDTH);
        const stairsY = Math.floor(Math.random() * WORLD_HEIGHT);
        
        // Check distance from spawn point (1,1)
        const distance = Math.sqrt(
            Math.pow(stairsX - 1, 2) + Math.pow(stairsY - 1, 2)
        );
        
        if (distance >= 10) {
            const stairsIndex = stairsY * WORLD_WIDTH + stairsX;
            map[stairsIndex] = stairsDown;
            stairsPlaced = true;
        }
    }

    return map;
};
