import ActorStore, { Actor } from "../../store/ActorStore";
import { randomNumber } from "../../utils/utils";
import { lenkkeilija} from "./actorTypes"; // Importing the warrior actor type

export const populate = () => {
    // const { addActor } = ActorStore;

    // for (let i = 0; i < 50; i++) {
    //     const actor: Actor = {
    //         ...lenkkeilija, // Use the warrior as the base actor
    //         id: i, // Assign unique ID
    //         hitpoints: randomNumber(5, 10), // Randomize hitpoints
    //         xCoord: randomNumber(1, 79), // Randomize x coordinate
    //         yCoord: randomNumber(1, 19), // Randomize y coordinate
    //     };

    //     addActor(actor);
    // }
    console.log("populate");
};
