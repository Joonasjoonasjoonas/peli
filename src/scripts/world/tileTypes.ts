export interface TileType {
    type: string;
    blocking: boolean;
    visible: boolean;
}

export const floor: TileType = {
    type: "floor",
    blocking: false,
    visible: false,
};
export const wall: TileType = {
    type: "wall",
    blocking: true,
    visible: false,
};
