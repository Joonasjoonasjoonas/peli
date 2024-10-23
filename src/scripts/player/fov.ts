import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";

export const updatePlayerFOV = () => {
    const { playerCoords } = PlayerStore;
    const { worldMap, setTileVisible, setTileExplored } = GameStore;
    const radius = 5;

    // Set all visible tiles to not visible
    worldMap.forEach((tile, index) => {
        if (tile.visible) {
            setTileVisible(index, false);
        }
    });

    for (let angle = 0; angle < 360; angle += 1) {
        let x = playerCoords.x;
        let y = playerCoords.y;
        
        for (let r = 0; r <= radius; r++) {
            x = Math.round(playerCoords.x + r * Math.cos(angle * Math.PI / 180));
            y = Math.round(playerCoords.y + r * Math.sin(angle * Math.PI / 180));
            
            // Ensure x and y are within the bounds of WORLD_WIDTH and WORLD_HEIGHT
            x = Math.max(0, Math.min(x, WORLD_WIDTH - 1));
            y = Math.max(0, Math.min(y, WORLD_HEIGHT - 1));
            
            const index = getIndexFromXY(x, y);
            
            const tile = worldMap[index];
            
            // Check if the player is on the same coordinates with a tile that has obscuring true
            if (r === 0 && tile.obscuring) {
                // Randomly break the line of fov with 50% chance
                if (Math.random() < 0.5) {
                    break;
                }
            } else if (tile.obscuring || tile.blocking) {
                // If the player is on the same coordinates with a tile that has obscuring false, break the line of fov every time it bumps into tiles that have obscuring true
                break;
            } else {
                setTileVisible(index, true);
                setTileExplored(index, true);
            }
        }
    }
    GameStore.triggerMapUpdate();
};

