import { WORLD_WIDTH } from "../scripts/game";

export const randomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const getIndexFromXY = (x: number, y: number): number => {
    return x + WORLD_WIDTH * y;
};

export const directionDeltas = {
    n:  [0, -1],
    s:  [0, 1],
    w:  [-1, 0],
    e:  [1, 0],
    nw: [-1, -1],
    ne: [1, -1],
    sw: [-1, 1],
    se: [1, 1]
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.hypot(x2 - x1, y2 - y1);
};

export function darkenColor(color: string): string {
    // Simple implementation, you might want to use a more sophisticated method
    return color === "black" ? "black" : "#" + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - 40)).toString(16)).slice(-2));
}