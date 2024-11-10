import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";

export const updatePlayerFOV = () => {
    const { playerCoords } = PlayerStore;
    const { worldMap, setTileVisible, setTileExplored, isDebugVisible } =
        GameStore;
    const radius = 15;

    // If debug visibility is on, don't update FOV
    if (isDebugVisible) {
        return;
    }

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
            x = Math.round(
                playerCoords.x + r * Math.cos((angle * Math.PI) / 180)
            );
            y = Math.round(
                playerCoords.y + r * Math.sin((angle * Math.PI) / 180)
            );

            // Ensure x and y are within the bounds of WORLD_WIDTH and WORLD_HEIGHT
            x = Math.max(0, Math.min(x, WORLD_WIDTH - 1));
            y = Math.max(0, Math.min(y, WORLD_HEIGHT - 1));

            const index = getIndexFromXY(x, y);

            const tile = worldMap[index];

            setTileVisible(index, true);
            setTileExplored(index, true);

            // Stop after marking blocking tile as visible
            if (tile.obscuring || tile.blocking) {
                break;
            }
        }
    }
    GameStore.triggerMapUpdate();
};
