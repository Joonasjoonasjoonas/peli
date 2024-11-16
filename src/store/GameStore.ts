import { makeAutoObservable } from "mobx";
import { Grid } from "pathfinding";
import { TileType } from "../scripts/world/tileTypes";
import PlayerStore from "./PlayerStore";
import { LevelStorageService } from "../services/LevelStorageService";
import { createWorldMap } from "../scripts/world/mapCreator";
import { populate } from "../scripts/actors/populate";
import { updatePlayerFOV } from "../scripts/player/fov";
import ActorStore from "./ActorStore";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../scripts/game";
import { getIndexFromXY } from "../utils/utils";
import { populateItems } from "../scripts/items/items";

class GameStore {
    isDebugVisible: boolean = false;

    singleEvents: string[] = [];
    completeLogMessages: string[][] = [];
    worldMap: TileType[] = [];
    pathfindingGrid: any;
    currentLevel: number = 0;

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

    // Add to existing GameStore class:
    saveCurrentLevel = () => {
        const { playerCoords } = PlayerStore;
        const { actors } = ActorStore;
        LevelStorageService.saveLevel(
            this.currentLevel,
            this.worldMap,
            actors,
            playerCoords,
            this.pathfindingGrid // Add this line
        );
    };

    loadLevel = (level: number) => {
        const levelData = LevelStorageService.getLevel(level);
        if (levelData) {
            this.worldMap = levelData.mapData;
            this.pathfindingGrid = levelData.pathfindingGrid; // Add this line
            ActorStore.setActors(levelData.actors);
            PlayerStore.updatePlayerCoords(
                levelData.playerPosition.x,
                levelData.playerPosition.y
            );
            this.currentLevel = level;
            this.triggerMapUpdate();
        }
    };

    findStairsCoords = (
        stairsType: "stairsUp" | "stairsDown"
    ): { x: number; y: number } | null => {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let x = 0; x < WORLD_WIDTH; x++) {
                const index = getIndexFromXY(x, y);
                if (this.worldMap[index].type === stairsType) {
                    return { x, y };
                }
            }
        }
        return null;
    };

    changeLevel = (direction: "up" | "down") => {
        // Save current level
        this.saveCurrentLevel();

        const newLevel =
            direction === "down"
                ? this.currentLevel + 1
                : this.currentLevel - 1;

        // Try to load existing level
        const existingLevel = LevelStorageService.getLevel(newLevel);
        if (existingLevel) {
            this.loadLevel(newLevel);

            // Position player at appropriate stairs
            const stairsType = direction === "up" ? "stairsDown" : "stairsUp";
            const stairsCoords = this.findStairsCoords(stairsType);

            if (stairsCoords) {
                PlayerStore.updatePlayerCoords(stairsCoords.x, stairsCoords.y);
            }
        } else if (direction === "down") {
            // Generate new level if going down and level doesn't exist
            this.currentLevel = newLevel;
            createWorldMap("tunnels");
            populate();
            populateItems();

            // Position player at stairs up in new level
            const stairsUpCoords = this.findStairsCoords("stairsUp");
            if (stairsUpCoords) {
                PlayerStore.updatePlayerCoords(
                    stairsUpCoords.x,
                    stairsUpCoords.y
                );
            }

            updatePlayerFOV();
        }
    };

    clearAllLevels = () => {
        LevelStorageService.clearAllLevels();
        this.currentLevel = 0;
        this.worldMap = [];
        this.singleEvents = [];
        this.completeLogMessages = [];
    };

    toggleDebugVisibility = () => {
        this.isDebugVisible = !this.isDebugVisible;

        for (let i = 0; i < this.worldMap.length; i++) {
            this.worldMap[i].visible = this.isDebugVisible;
        }

        this.triggerMapUpdate();
    };
}

export default new GameStore();
