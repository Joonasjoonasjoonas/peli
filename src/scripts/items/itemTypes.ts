export {};

export interface BaseItem {
    id?: number;
    name: string;
    char: string;
    color: string;
    xCoord: number;
    yCoord: number;
    carriedBy: number | null; // null if on ground, otherwise entity ID
}

export const BASIC_ITEM: BaseItem = {
    id: 0,
    name: "Item",
    char: "i",
    color: "#FF69B4", // pink
    xCoord: 0,
    yCoord: 0,
    carriedBy: null
};