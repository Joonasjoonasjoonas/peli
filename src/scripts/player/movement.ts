import PlayerStore from "../../store/PlayerStore";
import GameStore from "../../store/GameStore";
import { getAdjacentTile } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { toJS } from "mobx";
import { updatePlayerFOV } from "./fov";

const checkIfCanMove = (direction: string) => {
    const { addLogMessage } = GameStore;
    const { playerCoords } = PlayerStore;

    let checkTile = toJS(
        getAdjacentTile(playerCoords.x, playerCoords.y, direction)
    );

    if (direction === "n" && playerCoords.y === 0) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (direction === "w" && playerCoords.x === 0) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (direction === "s" && playerCoords.y === WORLD_HEIGHT - 1) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (direction === "e" && playerCoords.x === WORLD_WIDTH - 1) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (direction === "nw" && (playerCoords.y === 0 || playerCoords.x === 0)) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (
        direction === "sw" &&
        (playerCoords.y === WORLD_HEIGHT - 1 || playerCoords.x === 0)
    ) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (
        direction === "ne" &&
        (playerCoords.y === 0 || playerCoords.x === WORLD_WIDTH - 1)
    ) {
        addLogMessage("You can't move there.");
        return false;
    }
    if (
        direction === "se" &&
        (playerCoords.y === WORLD_HEIGHT - 1 ||
            playerCoords.x === WORLD_WIDTH - 1)
    ) {
        addLogMessage("You can't move there.");
        return false;
    }

    if (checkTile?.blocking === false) return true;
    if (checkTile?.blocking === true) {
        addLogMessage("You bump in to a wall.");
        return false;
    }
};

export const tryMovePlayer = (direction: string) => {
    const { updatePlayerCoords, playerCoords } = PlayerStore;
    const { addLogMessage } = GameStore;

    switch (direction) {
        case "n":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x, playerCoords.y - 1);
                addLogMessage("You move north.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "w":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x - 1, playerCoords.y);
                addLogMessage("You move west.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "s":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x, playerCoords.y + 1);
                addLogMessage("You move south.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "e":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x + 1, playerCoords.y);
                addLogMessage("You move east.");
                updatePlayerFOV();
            }
            break;

        case "nw":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x - 1, playerCoords.y - 1);
                addLogMessage("You move north-west.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "sw":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x - 1, playerCoords.y + 1);
                addLogMessage("You move south-west.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "ne":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x + 1, playerCoords.y - 1);
                addLogMessage("You move north-east.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        case "se":
            if (checkIfCanMove(direction)) {
                updatePlayerCoords(playerCoords.x + 1, playerCoords.y + 1);
                addLogMessage("You move south-east.");
                updatePlayerFOV();
                GameStore.triggerMapUpdate();
            }
            break;

        default:
    }
};
