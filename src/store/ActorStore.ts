import { makeAutoObservable } from "mobx";

export interface Actor {
    id: number | null;
    race: string;
    char: string;
    hitpoints: number;
    xCoord: number;
    yCoord: number;
    charColor: string;
}

class ActorStore {
    actors: Actor[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    addActor = (actor: Actor) => {
        this.actors.push(actor);
    };

    updateActorCoords = (id: number | null, x: number, y: number) => {
        const updatedActors = this.actors.map((actor) => {
            if (actor.id === id) {
                return { ...actor, xCoord: x, yCoord: y };
            }
            return actor;
        });

        this.actors = updatedActors;
    };

    clearActors = () => {
        this.actors = [];
    };

    // updateActorCoords = (x: number, y: number) => {
    //     this.actorCoords.x = x;
    //     this.actorCoords.y = y;
    // };

    // updateActorTick = () => {
    //     if (this.actorTick > 0) this.actorTick = this.actorTick - 1;
    //     else this.actorTick = 2;
    // };
}

export default new ActorStore();
