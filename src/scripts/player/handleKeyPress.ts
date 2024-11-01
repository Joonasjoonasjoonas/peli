import GameStore from "../../store/GameStore";
import { tryMovePlayer } from "./movement";
import { checkForRandomEvent } from "../world/randomEvents";
import { tryMoveActor } from "../actors/movement";
import { updatePlayerFOV } from "./fov";
import { createWorldMap } from "../world/mapCreator";
import { populate } from "../actors/populate";

export const movementKeys = ["w", "a", "x", "d", "q", "e", "z", "c"];
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

    // Handle save/load shortcuts
    if (key === 'ctrl+s') {
        const mapName = `Map ${new Date().toLocaleString()}`;
        GameStore.saveCurrentMap(mapName);
        addLogMessage(`Map saved as: ${mapName}`);
        addCompleteLogMessage();
        return;
    }

    if (key === 'ctrl+l' && GameStore.getAllSavedMaps().length > 0) {
        const lastMap = GameStore.getAllSavedMaps().slice(-1)[0];
        GameStore.loadMap(lastMap.id);
        addLogMessage(`Loaded map: ${lastMap.name}`);
        addCompleteLogMessage();
        updatePlayerFOV();
        return;
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
        q: "nw", e: "ne", z: "sw", c: "se"
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
