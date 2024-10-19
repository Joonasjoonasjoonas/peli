export interface TileType {
    type: string;
    blocking: boolean;
    visible: boolean;
    ascii: string;
    color: string;
    backgroundColor: string;
}

export const floor: TileType = {
    type: "floor",
    blocking: false,
    visible: false,
    ascii: ".",
    color: "#8B4513", // Brown color for floor
    backgroundColor: "#000000", // Black background for floor
};

export const wall: TileType = {
    type: "wall",
    blocking: true,
    visible: false,
    ascii: "#",
    color: "#808080", // Gray color for wall
    backgroundColor: "#404040", // Dark gray background for wall
};

export const empty: TileType = {
    type: "empty",
    blocking: true,
    visible: false,
    ascii: " ",
    color: "#000000",
    backgroundColor: "#000000", // Black background for empty
};
