import GameStore from "../store/GameStore";
import { WORLD_WIDTH } from "../scripts/game";
import { TileType } from "../scripts/world/tileTypes";

export const randomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const getIndexFromXY = (x: number, y: number): number => {
    return x + WORLD_WIDTH * y;
};

export const getAdjacentTile = (x: number, y: number, direction: string): TileType | undefined => {
    const { worldMap } = GameStore;

    switch (direction) {
        case "n":
            return worldMap[getIndexFromXY(x, y - 1)];
        case "w":
            return worldMap[getIndexFromXY(x - 1, y)];
        case "s":
            return worldMap[getIndexFromXY(x, y + 1)];
        case "e":
            return worldMap[getIndexFromXY(x + 1, y)];
        case "nw":
            return worldMap[getIndexFromXY(x - 1, y - 1)];
        case "sw":
            return worldMap[getIndexFromXY(x - 1, y + 1)];
        case "se":
            return worldMap[getIndexFromXY(x + 1, y + 1)];
        case "ne":
            return worldMap[getIndexFromXY(x + 1, y - 1)];
        default:
            return undefined;
    }
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.hypot(x2 - x1, y2 - y1);
};

export function darkenColor(color: string): string {
    // Simple implementation, you might want to use a more sophisticated method
    return color === "black" ? "black" : "#" + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - 40)).toString(16)).slice(-2));
}