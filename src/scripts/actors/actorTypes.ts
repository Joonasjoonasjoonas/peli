export interface BaseActor {
    id: number | null;
    race: string;
    char: string;
    hitpoints: number;
    xCoord: number;
    yCoord: number;
    charColor: string; 
    behaviour: string;
    destinationX: number;
    destinationY: number;
}

export interface Actor extends BaseActor {
    // Additional properties specific to actors can be added here
    level?: number;
    experience?: number;
}

// Example actor types without specific races
export const NPC: Actor = {
    id: 1,
    race: "NPC",
    char: "@",
    hitpoints: 15,
    xCoord: 0,
    yCoord: 0,
    charColor: "#1E90FF",
    behaviour: "wander",
    destinationX: 0,
    destinationY: 0
};

export const LENKKEILIJA: Actor = {
    id: 2,
    race: "lenkkeilijä",
    char: "@",
    hitpoints: 10,
    xCoord: 0,
    yCoord: 0,
    charColor: "#FF6B6B",  // A reddish color to represent someone exercising
    behaviour: "passing",
    destinationX: 0,
    destinationY: 0
};
