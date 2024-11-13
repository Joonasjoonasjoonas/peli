import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import { tryMoveActor } from "./movement";
import GameStore from "../../store/GameStore";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../game";
import { createPathfindingMap } from "../world/mapCreator";

export const playActors = () => {
    const { actors, updateActor } = ActorStore;
    const { worldMap } = GameStore;
    const allActors = toJS(actors);

    // Update pathfinding grid with current actor positions
    createPathfindingMap(worldMap, allActors);

    allActors.forEach((actor) => {
        switch (actor.behaviour) {
            case "chase":
                tryMoveActor(actor, actor.xCoord, actor.yCoord);
                // Update pathfinding grid after each actor moves
                createPathfindingMap(worldMap, allActors);
                break;
            case "wander":
                if (!actor.destinationX ||
                    !actor.destinationY ||
                    tryMoveActor(actor, actor.destinationX, actor.destinationY)
                ) {
                    let newDestX, newDestY;
                    do {
                        newDestX = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
                        newDestY = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
                    } while (
                        worldMap[newDestY * WORLD_WIDTH + newDestX]?.blocking
                    );

                    updateActor(actor.id, {
                        destinationX: newDestX,
                        destinationY: newDestY,
                    });
                }
                // Update pathfinding grid after each actor moves
                createPathfindingMap(worldMap, allActors);
                break;
            case "idle":
                break;
            default:
                break;
        }
    });
}
