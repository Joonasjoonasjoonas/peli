import { TileType } from "../scripts/world/tileTypes";
import { Actor } from "../store/ActorStore";

export interface LevelData {
    mapData: TileType[];
    actors: Actor[];
    playerPosition: { x: number; y: number };
}

export class LevelStorageService {
    private static STORAGE_KEY = 'dungeon_levels';

    static saveLevel(level: number, mapData: TileType[], actors: Actor[], playerPosition: { x: number; y: number }): void {
        const savedLevels = this.getAllLevels();
        savedLevels[level] = {
            mapData,
            actors,
            playerPosition
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedLevels));
    }

    static getLevel(level: number): LevelData | null {
        const savedLevels = this.getAllLevels();
        return savedLevels[level] || null;
    }

    static getAllLevels(): { [key: number]: LevelData } {
        const savedLevelsJson = localStorage.getItem(this.STORAGE_KEY);
        return savedLevelsJson ? JSON.parse(savedLevelsJson) : {};
    }

    static clearLevel(level: number): void {
        const savedLevels = this.getAllLevels();
        delete savedLevels[level];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedLevels));
    }

    static clearAllLevels(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}