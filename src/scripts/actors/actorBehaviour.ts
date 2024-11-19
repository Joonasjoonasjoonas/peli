import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import GameStore from "../../store/GameStore";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { createPathfindingMap } from "../world/mapCreator";
import { tryMoveActor } from "./movement";

export const playActors = () => {
    const { actors, updateActor } = ActorStore;
    const { worldMap, addLogMessage } = GameStore;
    const allActors = toJS(actors);

    // Update pathfinding grid with current actor positions
    createPathfindingMap(worldMap, allActors);

    allActors.forEach((actor) => {
        switch (actor.behaviour) {
            case "passing":
                if (actor.race === "lenkkeilijä") {
                    const reached = tryMoveActor(actor, actor.destinationX, actor.destinationY);
                    
                    // Add some randomness to movement (swaying)
                    if (!reached && Math.random() < 0.3) {
                        const randomOffset = Math.random() < 0.5 ? 1 : -1;
                        
                        // Calculate potential new destination
                        let newDestX = actor.destinationX;
                        let newDestY = actor.destinationY;
                        
                        if (Math.random() < 0.5) {
                            newDestX += randomOffset;
                        } else {
                            newDestY += randomOffset;
                        }
                        
                        // Ensure new destination stays within map bounds
                        newDestX = Math.max(1, Math.min(newDestX, WORLD_WIDTH - 2));
                        newDestY = Math.max(1, Math.min(newDestY, WORLD_HEIGHT - 2));
                        
                        // Only update if the tile isn't blocking
                        const index = newDestY * WORLD_WIDTH + newDestX;
                        if (!worldMap[index]?.blocking) {
                            updateActor(actor.id, {
                                destinationX: newDestX,
                                destinationY: newDestY,
                            });
                        }
                    }
                    
                    // Despawn if destination reached
                    if (reached) {
                        addLogMessage(`${actor.race} disappears into the distance`);
                        ActorStore.setActors(allActors.filter(a => a.id !== actor.id));
                    }
                }
                createPathfindingMap(worldMap, allActors);
                break;

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
};