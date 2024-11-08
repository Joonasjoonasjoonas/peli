import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import GameStore from "../../store/GameStore";

import Pathfinding from "pathfinding";


const PF = Pathfinding;

export const tryMoveActor = (destX: number  , destY: number) => {
    const { updateActorCoords, actors } = ActorStore;
    const { pathfindingGrid, addLogMessage } = GameStore;

    // if (actorTick > 1) {
    //     updateActorTick();
    //     return;
    // }

    const allActors = toJS(actors);

    allActors.forEach((actor) => {
        
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

            if (path[1] !== undefined) {
                if (path[1][0] === destX && path[1][1] === destY) {
                    addLogMessage(`${actor.race} bumps into you.`);
                    return;
                }
                updateActorCoords(actor.id, path[1][0], path[1][1]);
            } else {
                return;
            }
        }
    );
    GameStore.triggerMapUpdate();
};
