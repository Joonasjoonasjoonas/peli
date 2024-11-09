import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import { tryMoveActor } from "./movement";
import GameStore from "../../store/GameStore";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../game";

export const playActors = () => {
    const { actors, updateActor } = ActorStore;
    const { worldMap } = GameStore;
    const allActors = toJS(actors);

    allActors.forEach((actor) => {
        switch (actor.behaviour) {
            case 'chase':
                // Chase player
                tryMoveActor(actor.xCoord, actor.yCoord);
                break;
            case 'wander':
                // If no destination is set or actor has reached destination
                if (!actor.destinationX || !actor.destinationY || 
                    (actor.xCoord === actor.destinationX && actor.yCoord === actor.destinationY)) {
                    
                    // Find new random destination on walkable tile
                    let newDestX, newDestY;
                    do {
                        newDestX = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
                        newDestY = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
                    } while (worldMap[newDestY * WORLD_WIDTH + newDestX]?.blocking);

                    // Update actor with new destination
                    updateActor(actor.id, {
                        destinationX: newDestX,
                        destinationY: newDestY
                    });
                    
                    // Move towards new destination
                    tryMoveActor(newDestX, newDestY);
                } else {
                    // Continue moving towards existing destination
                    tryMoveActor(actor.destinationX, actor.destinationY);
                }
                break;
            case 'idle':
                // Do nothing
                break;
            default:
                // Default to idle
                break;
        }
    });
};