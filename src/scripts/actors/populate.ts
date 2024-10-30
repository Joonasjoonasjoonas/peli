import ActorStore, { Actor } from "../../store/ActorStore";
import { randomNumber } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { NPC} from "./actorTypes"; // Importing the warrior actor type

export const populate = () => {
    const { addActor } = ActorStore;

    for (let i = 0; i < 10; i++) {
        const actor: Actor = {
            ...NPC, // Use the warrior as the base actor
            id: i, // Assign unique ID
            hitpoints: randomNumber(5, 10), // Randomize hitpoints
            xCoord: randomNumber(20, WORLD_WIDTH - 5), // Randomize x coordinate
            yCoord: randomNumber(20, WORLD_HEIGHT - 5), // Randomize y coordinate
        };

        addActor(actor);
    }
 
};
