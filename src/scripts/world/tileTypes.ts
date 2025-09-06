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
    color: "#bdaa97", // Brown from palette for floor
    backgroundColor: "#353540", // Dark background from palette
};

export const wall: TileType = {
    type: "wall",
    blocking: true,
    visible: false,
    explored: false,
    ascii: "#",
    color: "#918d8d", // Gray from palette for wall
    backgroundColor: "#353540", // Dark background from palette
};

export const empty: TileType = {
    type: "empty",
    blocking: true,
    visible: false,
    explored: false,
    ascii: " ",
    color: "#353540",
    backgroundColor: "#353540", // Dark background from palette
};

export const bush: TileType = {
    type: "bush",
    blocking: false,
    visible: false,
    explored: false,
    ascii: "\"",
    color: "#557d55", // Green from palette for bush
    backgroundColor: "#353540", // Dark background from palette
    obscuring: true,
};

export const grass: TileType = {
    type: "grass",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ",",
    color: "#8b9150", // Green from palette for grass
    backgroundColor: "#353540", // Dark background from palette
};

export const soil: TileType = {
    type: "soil",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ".",
    color: "#86735b", // Brown from palette for soil
    backgroundColor: "#353540", // Dark background from palette
};

export const tree: TileType = {
    type: "tree",
    blocking: true,
    visible: false,
    explored: false,
    ascii: "^",
    color: "#557d55", // Green from palette for tree
    backgroundColor: "#353540", // Dark background from palette
};

export const stairsDown: TileType = {
    type: "stairsDown",
    blocking: false,
    visible: false,
    explored: false,
    ascii: ">",
    color: "#ede4da", // Light from palette for stairs
    backgroundColor: "#353540", // Dark background from palette
};

export const stairsUp: TileType = {
    type: "stairsUp",
    blocking: false,
    visible: false,
    explored: false,
    ascii: "<",
    color: "#ede4da", // Light from palette for stairs
    backgroundColor: "#353540", // Dark background from palette
};