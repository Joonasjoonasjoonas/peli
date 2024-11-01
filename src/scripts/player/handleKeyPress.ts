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
    const { worldMap } = GameStore;
    updatePlayerFOV();
    return worldMap;
};

export const handleKeyPress = (
    key: string, 
    setTurn?: (fn: (prev: number) => number) => void,
    setCurrentWorldMap?: (fn: (prev: any[]) => any[]) => void,
    currentMapType?: MapType
) => {
    const { addCompleteLogMessage, addLogMessage } = GameStore;

    // Handle Ctrl + S
    if (key === 'ctrl+s') {
        const mapName = `Map ${new Date().toLocaleString()}`;
        GameStore.saveCurrentMap(mapName);
        addLogMessage(`Map saved as: ${mapName}`);
        addCompleteLogMessage();
        return;
    }

    // Handle Ctrl + L
    if (key === 'ctrl+l') {
        const savedMaps = GameStore.getAllSavedMaps();
        if (savedMaps.length > 0) {
            const lastMap = savedMaps[savedMaps.length - 1];
            GameStore.loadMap(lastMap.id);
            addLogMessage(`Loaded map: ${lastMap.name}`);
            addCompleteLogMessage();
            updatePlayerFOV();
        }
        return;
    }

    if (movementKeys.includes(key)) {
        handleMovement(key);
        setTurn?.(prev => prev + 1);
        checkForRandomEvent();
        addCompleteLogMessage();
        tryMoveActor();
    } else if (key.toLowerCase() === "p") {
        setCurrentWorldMap?.(prevMap => 
            prevMap.map(tile => ({ ...tile, visible: true }))
        );
    } else if (key === "F") {
        const newMap = generateNewWorld('forest');
        setCurrentWorldMap?.(prevMap => 
            newMap.map(tile => ({ ...tile, visible: true }))
        );
        setTurn?.(prev => 0);
    } else if (key === "C") {
        const newMap = generateNewWorld('cave');
        setCurrentWorldMap?.(prevMap => 
            newMap.map(tile => ({ ...tile, visible: true }))
        );
        setTurn?.(prev => 0);
    } else if (key === "T") {
        const newMap = generateNewWorld('tunnels');
        setCurrentWorldMap?.(prevMap => 
            newMap.map(tile => ({ ...tile, visible: true }))
        );
        setTurn?.(prev => 0);
    } else if (key === "M") {
        const newMap = generateNewWorld(currentMapType || 'forest');
        setCurrentWorldMap?.(prevMap => 
            newMap.map(tile => ({ ...tile, visible: true }))
        );
        setTurn?.(prev => 0);
    }
};

const handleMovement = (key: string) => {
    const directionMap: { [key: string]: string } = {
        w: "n",
        d: "e",
        x: "s",
        a: "w",
        q: "nw",
        e: "ne",
        z: "sw",
        c: "se"
    };

    const direction = directionMap[key];
    if (direction) {
        tryMovePlayer(direction);
    }
};

export const handleKeyboardEvent = (event: KeyboardEvent, options: {
    setTurn?: (fn: (prev: number) => number) => void,
    setCurrentWorldMap?: (fn: (prev: any[]) => any[]) => void,
    currentMapType?: MapType
}) => {
    const { setTurn, setCurrentWorldMap, currentMapType } = options;

    if (event.repeat) {
        return;
    }

    // Handle save/load keyboard shortcuts
    if (event.ctrlKey) {
        if (event.key.toLowerCase() === 's') {
            event.preventDefault();
            handleKeyPress('ctrl+s');
            return;
        }
        if (event.key.toLowerCase() === 'l') {
            event.preventDefault();
            handleKeyPress('ctrl+l');
            return;
        }
    }

    handleKeyPress(event.key, setTurn, setCurrentWorldMap, currentMapType);
};
