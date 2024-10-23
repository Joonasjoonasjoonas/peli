import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getIndexFromXY } from "../../utils/utils";

export const updatePlayerFOV = () => {
    const { playerCoords } = PlayerStore;
    const { worldMap, setTileVisible, setTileExplored } = GameStore;
    const radius = 5;
    const WORLD_WIDTH = 110; // Assuming WORLD_WIDTH is defined or imported
    const WORLD_HEIGHT = 30; // Assuming WORLD_HEIGHT is defined or imported

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
            
            // Ensure x and y are within the map boundaries
            x = Math.max(0, Math.min(x, WORLD_WIDTH - 1));
            y = Math.max(0, Math.min(y, WORLD_HEIGHT - 1));
            
            const index = getIndexFromXY(x, y);
            
            setTileVisible(index, true);
            setTileExplored(index, true);
        }
    }
    GameStore.triggerMapUpdate();
};
