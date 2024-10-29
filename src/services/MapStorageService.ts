import { TileType } from "../scripts/world/tileTypes";

export interface SavedMap {
    id: string;
    name: string;
    mapData: TileType[];
    playerPosition: { x: number; y: number };
    createdAt: number;
}

export class MapStorageService {
    private static STORAGE_KEY = 'saved_maps';

    static saveMap(mapName: string, mapData: TileType[], playerPosition: { x: number; y: number }): void {
        const savedMaps = this.getAllMaps();
        const newMap: SavedMap = {
            id: crypto.randomUUID(),
            name: mapName,
            mapData,
            playerPosition,
            createdAt: Date.now()
        };

        savedMaps.push(newMap);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedMaps));
    }

    static getMap(id: string): SavedMap | null {
        const savedMaps = this.getAllMaps();
        return savedMaps.find(map => map.id === id) || null;
    }

    static getAllMaps(): SavedMap[] {
        const savedMapsJson = localStorage.getItem(this.STORAGE_KEY);
        return savedMapsJson ? JSON.parse(savedMapsJson) : [];
    }

    static deleteMap(id: string): void {
        const savedMaps = this.getAllMaps();
        const filteredMaps = savedMaps.filter(map => map.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMaps));
    }
}