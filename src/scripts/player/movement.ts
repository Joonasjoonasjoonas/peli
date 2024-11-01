import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getAdjacentTile } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH, Direction } from "../game";
import { toJS } from "mobx";
import { updatePlayerFOV } from "./fov";

const checkIfCanMove = (direction: string) => {
    const { addLogMessage } = GameStore;
    const { playerCoords } = PlayerStore;
    const { x, y } = playerCoords;

    const boundaryChecks = {
        n: y === 0,
        s: y === WORLD_HEIGHT - 1,
        w: x === 0,
        e: x === WORLD_WIDTH - 1,
        nw: y === 0 || x === 0,
        ne: y === 0 || x === WORLD_WIDTH - 1,
        sw: y === WORLD_HEIGHT - 1 || x === 0,
        se: y === WORLD_HEIGHT - 1 || x === WORLD_WIDTH - 1
    };

    if (boundaryChecks[direction as Direction]) {
        addLogMessage("You can't move there.");
        return false;
    }

    const checkTile = toJS(getAdjacentTile(x, y, direction));
    
    if (checkTile?.blocking) {
        addLogMessage("You bump in to a wall.");
        return false;
    }

    return true;
};

export const tryMovePlayer = (direction: string) => {
    const { updatePlayerCoords, playerCoords } = PlayerStore;
    const { addLogMessage } = GameStore;
    const { x, y } = playerCoords;

    const moveDeltas = {
        n:  [0, -1],
        s:  [0, 1],
        w:  [-1, 0],
        e:  [1, 0],
        nw: [-1, -1],
        ne: [1, -1],
        sw: [-1, 1],
        se: [1, 1]
    };

    if (checkIfCanMove(direction)) {
        const [dx, dy] = moveDeltas[direction as Direction];
        updatePlayerCoords(x + dx, y + dy);
        addLogMessage(`You move ${direction.replace('n', 'north').replace('s', 'south').replace('e', 'east').replace('w', 'west')}.`);
        updatePlayerFOV();
        GameStore.triggerMapUpdate();
    }
};
