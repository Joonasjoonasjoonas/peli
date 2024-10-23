export interface BaseTileType {
    type: string;
    blocking: boolean;
    visible: boolean;
    explored: boolean;
    ascii: string;
    color: string;
    backgroundColor: string;
}

export interface TileType extends BaseTileType {
    obscuring?: boolean;
}

export const floor: TileType = {
    type: "floor",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ".",
    color: "#8B4513", // Brown color for floor
    backgroundColor: "#000000", // Black background for floor
};

export const wall: TileType = {
    type: "wall",
    blocking: true,
    visible: false,
    explored: false,
    ascii: "#",
    color: "#808080", // Gray color for wall
    backgroundColor: "#404040", // Dark gray background for wall
};

export const empty: TileType = {
    type: "empty",
    blocking: true,
    visible: false,
    explored: false,
    ascii: " ",
    color: "#000000",
    backgroundColor: "#000000", // Black background for empty
};

export const bush: TileType = {
    type: "bush",
    blocking: false,
    visible: false,
    explored: false,
    ascii: "\"",
    color: "#008000", // Green color for bush
    backgroundColor: "#000000", // Black background for bush
    obscuring: true,
};

export const grass: TileType = {
    type: "grass",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ",",
    color: "#008000", // Green color for grass
    backgroundColor: "#000000", // Black background for grass
};

export const soil: TileType = {
    type: "soil",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ".",
    color: "#008000", // Green color for soil
    backgroundColor: "#000000", // Black background for soil
};
