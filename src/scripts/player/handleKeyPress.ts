import GameStore from "../../store/GameStore";
import { tryMovePlayer } from "./movement";
import { checkForRandomEvent } from "../world/randomEvents";
import { tryMoveActor } from "../actors/movement";
import { updatePlayerFOV } from "./fov";
import { createWorldMap } from "../world/mapCreator";
import { populate } from "../actors/populate";
import PlayerStore from "../../store/PlayerStore";
import { getIndexFromXY } from "../../utils/utils";

export const movementKeys = ["w", "a", "x", "d", "q", "e", "z", "c", 
    "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
    "Home", "PageUp", "End", "PageDown",
    "8", "4", "2", "6",
    "7", "9", "1", "3"
];
type MapType = 'tunnels' | 'forest' | 'cave';

export const generateNewWorld = (mapType: MapType = 'forest') => {
    createWorldMap(mapType);
    populate();
    updatePlayerFOV();
    return GameStore.worldMap;
};

const generateAndSetMap = (
    mapType: MapType,
    setCurrentWorldMap?: (fn: (prev: any[]) => any[]) => void,
    setTurn?: (fn: (prev: number) => number) => void
) => {
    const newMap = generateNewWorld(mapType);
    setCurrentWorldMap?.(prevMap => newMap.map(tile => ({ ...tile, visible: true })));
    setTurn?.(prev => 0);
};

export const handleKeyPress = (
    key: string,
    setTurn?: (fn: (prev: number) => number) => void, 
    setCurrentWorldMap?: (fn: (prev: any[]) => any[]) => void,
    currentMapType?: MapType
) => {
    const { addCompleteLogMessage, addLogMessage } = GameStore;

    if (key === '>') {
        const { playerCoords } = PlayerStore;
        const currentTile = GameStore.worldMap[getIndexFromXY(playerCoords.x, playerCoords.y)];
        if (currentTile.type === 'stairsDown') {
            GameStore.changeLevel('down');
            addLogMessage("You descend deeper into the dungeon.");
            addCompleteLogMessage();
        }
    }
    
    if (key === '<') {
        const { playerCoords } = PlayerStore;
        const currentTile = GameStore.worldMap[getIndexFromXY(playerCoords.x, playerCoords.y)];
        if (currentTile.type === 'stairsUp') {
            GameStore.changeLevel('up');
            addLogMessage("You climb up the stairs.");
            addCompleteLogMessage();
        }
    }

    // Handle movement
    if (movementKeys.includes(key)) {
        handleMovement(key);
        setTurn?.(prev => prev + 1);
        checkForRandomEvent();
        addCompleteLogMessage();
        tryMoveActor();
        return;
    }

    // Handle map generation/visibility commands
    const mapCommands: { [key: string]: MapType | undefined } = {
        'F': 'forest',
        'C': 'cave', 
        'T': 'tunnels',
        'M': currentMapType || 'forest'
    };

    if (key.toLowerCase() === 'p') {
        setCurrentWorldMap?.(prevMap => prevMap.map(tile => ({ ...tile, visible: true })));
    } else if (key in mapCommands) {
        generateAndSetMap(mapCommands[key] as MapType, setCurrentWorldMap, setTurn);
    }
};

const handleMovement = (key: string) => {
    const directions: Record<string, string> = {
        w: "n", d: "e", x: "s", a: "w",
        q: "nw", e: "ne", z: "sw", c: "se",
        ArrowUp: "n", ArrowRight: "e", ArrowDown: "s", ArrowLeft: "w",
        Home: "nw", PageUp: "ne", End: "sw", PageDown: "se",
        "8": "n", "6": "e", "2": "s", "4": "w",
        "7": "nw", "9": "ne", "1": "sw", "3": "se"
    };
    if (directions[key]) tryMovePlayer(directions[key]);
};

export const handleKeyboardEvent = (event: KeyboardEvent, options: {
    setTurn?: (fn: (prev: number) => number) => void,
    setCurrentWorldMap?: (fn: (prev: any[]) => any[]) => void,
    currentMapType?: MapType
}) => {
    if (event.repeat) return;

    if (event.ctrlKey && ['s', 'l'].includes(event.key.toLowerCase())) {
        event.preventDefault();
        handleKeyPress(`ctrl+${event.key.toLowerCase()}`, options.setTurn, options.setCurrentWorldMap);
        return;
    }

    handleKeyPress(event.key, options.setTurn, options.setCurrentWorldMap, options.currentMapType);
};
