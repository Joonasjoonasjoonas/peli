import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getIndexFromXY } from "../../utils/utils";

export const updatePlayerFOV = () => {
    const { playerCoords } = PlayerStore;
    const { worldMap, setTileVisible, setTileExplored } = GameStore;
    const radius = 6;

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
            
            const index = getIndexFromXY(x, y);
            
            if (index < 0 || index >= worldMap.length) {
                break;
            }
            
            const tile = worldMap[index];
            
            if (tile.type === "floor") {
                setTileVisible(index, true);
                setTileExplored(index, true);
            } else if (tile.type === "wall") {
                setTileVisible(index, true);
                setTileExplored(index, true);
                break;
            }
        }
    }
};
