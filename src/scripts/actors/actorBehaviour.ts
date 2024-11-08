import { toJS } from "mobx";
import ActorStore from "../../store/ActorStore";
import { tryMoveActor } from "./movement";

export const playActors = () => {
    const { actors } = ActorStore;
    const allActors = toJS(actors);

    allActors.forEach((actor) => {
        switch (actor.behaviour) {
            case 'chase':
                // Chase player
                tryMoveActor(actor.xCoord, actor.yCoord);
                break;
            case 'wander': // tää ei toimi sen takia koska täähän arpoo jokasella vuorolla uuden x ja y koordinaatin ja actor lähtee tavoittelemaan sitä
        
                // Random movement
                const randomX = actor.xCoord + Math.floor(Math.random() * 3) - 1;
                const randomY = actor.yCoord + Math.floor(Math.random() * 3) - 1;
                tryMoveActor(randomX, randomY);
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
