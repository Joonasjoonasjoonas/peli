import ActorStore, { Actor } from "../../store/ActorStore";
import { randomNumber } from "../../utils/utils";

export const populate = () => {
    const { addActor } = ActorStore;

    const randomizeRace = () => {
        const rnd = randomNumber(1, 4);
        let actorRace: { race: string; char: string; charColor: string } = {
            race: "",
            char: "",
            charColor: "",
        };

        switch (rnd) {
            case 1:
                actorRace = { race: "orc", char: "o", charColor: "green" };
                break;
            case 2:
                actorRace = { race: "rat", char: "r", charColor: "DarkGrey" };
                break;
            case 3:
                actorRace = {
                    race: "goblin",
                    char: "g",
                    charColor: "LightGreen",
                };
                break;
            case 4:
                actorRace = { race: "human", char: "h", charColor: "white" };
                break;
        }

        return actorRace;
    };

    for (let i = 0; i < 10; i++) {
        const actorRace = randomizeRace();

        const actor: Actor = {
            id: i,
            race: actorRace.race,
            char: actorRace.char,
            hitpoints: randomNumber(5, 10),
            xCoord: randomNumber(40, 79),
            yCoord: randomNumber(1, 19),
            charColor: actorRace.charColor,
        };

        addActor(actor);
    }
};
