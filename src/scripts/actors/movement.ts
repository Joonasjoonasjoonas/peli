import { toJS } from "mobx";
import ActorStore, { Actor } from "../../store/ActorStore";
import GameStore from "../../store/GameStore";
import Pathfinding from "pathfinding";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";

const PF = Pathfinding;

export const tryMoveActor = (
    actor: Actor,
    destX: number,
    destY: number
): boolean => {
    const { updateActor } = ActorStore;
    const { pathfindingGrid, addLogMessage, worldMap } = GameStore;

    const finder = new PF.AStarFinder({
        diagonalMovement: 1,
    });
    const grid = new PF.Grid(toJS(pathfindingGrid));
    const path = finder.findPath(
        actor.xCoord,
        actor.yCoord,
        destX,
        destY,
        grid
    );

    // If no path is found and actor is wandering, set new random destination
    if (path.length === 0 && actor.behaviour === "wander") {
        let newDestX, newDestY;
        let attempts = 0;
        const maxAttempts = 20;

        do {
            newDestX = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
            newDestY = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
            attempts++;
        } while (
            worldMap[newDestY * WORLD_WIDTH + newDestX]?.blocking &&
            attempts < maxAttempts
        );

        if (attempts < maxAttempts) {
            updateActor(actor.id, {
                destinationX: newDestX,
                destinationY: newDestY,
            });
            addLogMessage(`${actor.race} changes direction`);
        }
        return false;
    }

    // Only proceed if we have a path
    if (path.length > 1) {
        // Check if actor has reached destination
        if (path[1][0] === destX && path[1][1] === destY) {
            addLogMessage(`${actor.race} has reached destination`);
            updateActor(actor.id, {
                xCoord: destX,
                yCoord: destY,
            });
            GameStore.triggerMapUpdate();
            return true;
        }

        // Calculate the distance to the next step
        const dx = path[1][0] - actor.xCoord;
        const dy = path[1][1] - actor.yCoord;
        const stepDistance = Math.sqrt(dx * dx + dy * dy);

        // Only move if the next step is 1 tile away (or ~1.4 for diagonal)
        if (stepDistance <= 1.5) {
            updateActor(actor.id, {
                xCoord: path[1][0],
                yCoord: path[1][1],
            });
        }
    }
    GameStore.triggerMapUpdate();
    return false;
};
