export interface BaseActor {
    id: number;
    race: string;
    char: string;
    hitpoints: number;
    xCoord: number;
    yCoord: number;
    charColor: string;
}

export interface Actor extends BaseActor {
    // Additional properties specific to actors can be added here
    level?: number;
    experience?: number;
}

// Example actor types without specific races
export const lenkkeilija: Actor = {
    id: 1,
    race: "Lenkkeilijä",
    char: "l",
    hitpoints: 15,
    xCoord: 0,
    yCoord: 0,
    charColor: "blue",
};

