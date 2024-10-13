import GameStore from "../store/GameStore";
import { WORLD_WIDTH } from "../scripts/game";

export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const getIndexFromXY = (x, y) => {
    return x + WORLD_WIDTH * y;
};

export const getAdjacentTile = (x, y, direction) => {
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
    }
};

export const getDistance = (x1, y1, x2, y2) => {
    return Math.hypot(x2 - x1, y2 - y1);
};
