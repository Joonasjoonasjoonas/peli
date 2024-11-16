import { makeAutoObservable } from "mobx";

class PlayerStore {
    playerCoords = { x: 1, y: 1 };
    playerIsCaught: boolean = false;
    carriedItemId: number | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    updatePlayerCoords = (x: number, y: number) => {
        this.playerCoords = { x: x, y: y };
    };

    setCarriedItem = (itemId: number | null) => {
        this.carriedItemId = itemId;
    };
}
export default new PlayerStore();
