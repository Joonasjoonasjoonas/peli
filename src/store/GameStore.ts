import { makeAutoObservable } from "mobx";
import { Grid } from "pathfinding";
import { TileType } from "../scripts/world/tileTypes";
import PlayerStore from "./PlayerStore";
import { MapStorageService } from "../services/MapStorageService";

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

    triggerMapUpdate = () => {
        this.worldMap = [...this.worldMap];
    };

    saveCurrentMap = (mapName: string) => {
        const { playerCoords } = PlayerStore;
        MapStorageService.saveMap(mapName, this.worldMap, playerCoords);
    };

    loadMap = (mapId: string) => {
        const savedMap = MapStorageService.getMap(mapId);
        if (savedMap) {
            this.worldMap = savedMap.mapData;
            PlayerStore.updatePlayerCoords(
                savedMap.playerPosition.x,
                savedMap.playerPosition.y
            );
            this.triggerMapUpdate();
        }
    };

    getAllSavedMaps = () => {
        return MapStorageService.getAllMaps();
    };
}

export default new GameStore();
