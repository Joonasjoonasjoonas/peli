import { makeAutoObservable } from "mobx";

class PlayerStore {
    playerCoords = { x: 1, y: 1 };
    playerIsCaught: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    updatePlayerCoords = (x: number, y: number) => {
        this.playerCoords = { x: x, y: y };
    };
}

export default new PlayerStore();
