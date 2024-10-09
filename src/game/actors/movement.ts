import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import GameStore from "../../store/GameStore";
import PlayerStore from "../../store/PlayerStore";
import Pathfinding from "pathfinding";
import { getDistance } from "../../utils/utils";

const PF = Pathfinding;

export const tryMoveActor = () => {
    const { playerCoords } = PlayerStore;
    const { updateActorCoords, actors } = ActorStore;
    const { pathfindingGrid } = GameStore;

    // if (actorTick > 1) {
    //     updateActorTick();
    //     return;
    // }

    const allActors = toJS(actors);

    allActors.forEach((actor) => {
        if (
            getDistance(
                playerCoords.x,
                playerCoords.y,
                actor.xCoord,
                actor.yCoord
            ) < 10
        ) {
            const finder = new PF.AStarFinder({
                diagonalMovement: 1,
            });
            const grid = new PF.Grid(toJS(pathfindingGrid));
            const path = finder.findPath(
                actor.xCoord,
                actor.yCoord,
                playerCoords.x,
                playerCoords.y,
                grid
            );

            if (path[1] !== undefined) {
                updateActorCoords(actor.id, path[1][0], path[1][1]);
            } else {
                return;
            }
        }
    });
};
