import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getIndexFromXY } from "../../utils/utils";
import { TileType } from "../../game/world/map";

export const updatePlayerFOV = () => {
    const { playerCoords } = PlayerStore;
    const { worldMap, setTileVisible } = GameStore;
    const radius = 6;

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
                setTileVisible(index);
            } else if (tile.type === "wall") {
                setTileVisible(index);
                break;
            }
        }
    }
};
