import { makeAutoObservable } from "mobx";
import { Grid } from "pathfinding";
import { TileType } from "../scripts/world/tileTypes";

class GameStore {
    singleEvents: string[] = [];
    completeLogMessages: string[][] = [];
    worldMap: TileType[] = [];
    pathfindingGrid: any;

    constructor() {
        makeAutoObservable(this);
    }

    addLogMessage = (event: string) => {
        this.singleEvents.push(event + " ");
    };

    addCompleteLogMessage = () => {
        this.completeLogMessages.unshift(this.singleEvents);
        this.singleEvents = [];
    };

    addWorldMap = (map: TileType[]) => {
        this.worldMap = map;
    };

    addPathfindingGrid = (grid: Grid) => {
        this.pathfindingGrid = grid;
    };

    setTileVisible = (index: number, visible: boolean) => {
        if (index >= 0 && index < this.worldMap.length) {
            this.worldMap[index].visible = visible;
        }
    };

    setTileExplored = (index: number, explored: boolean) => {
        if (index >= 0 && index < this.worldMap.length) {
            this.worldMap[index].explored = explored;
        }
    };  
}

export default new GameStore();
