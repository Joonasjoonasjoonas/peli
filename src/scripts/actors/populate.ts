import ActorStore, { Actor } from "../../store/ActorStore";
import { randomNumber } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { NPC } from "./actorTypes"; // Importing the warrior actor type

export const populate = () => {
    const { addActor, clearActors } = ActorStore;
    // Clear existing actors
    clearActors();

    for (let i = 0; i < 20; i++) {
        const actor: Actor = {
            ...NPC,
            id: i,
            race: NPC.race || "NPC",
            char: NPC.char || "@",
            hitpoints: randomNumber(5, 10),
            xCoord: randomNumber(20, WORLD_WIDTH - 5),
            yCoord: randomNumber(20, WORLD_HEIGHT - 5),
            charColor: NPC.charColor || "white",
            behaviour: NPC.behaviour || "wander",
            destinationX: 0,
            destinationY: 0,
        };

        addActor(actor);
    }
};
