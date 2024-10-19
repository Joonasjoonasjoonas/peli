import { tryMovePlayer } from "./movement";

export const movementKeys = ["w", "a", "x", "d", "q", "z", "c", "e", 
    "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
    "7", "4", "2", "6", "8", "1", "3", "9"];

export const handleKeyPress = (keyPressed: string) => {
    // nw = northwest, n = north, ne = northeast ....

    switch (keyPressed) {
        case "q":
        case "7":
            tryMovePlayer("nw");
            break;
        case "w":
        case "ArrowUp":
        case "8":
            tryMovePlayer("n");
            break;
        case "e":
        case "9":
            tryMovePlayer("ne");
            break;
        case "a":
        case "ArrowLeft":
        case "4":
            tryMovePlayer("w");
            break;
        case "d":
        case "ArrowRight":
        case "6":
            tryMovePlayer("e");
            break;
        case "z":
        case "1":
            tryMovePlayer("sw");
            break;
        case "x":
        case "ArrowDown":
        case "2":
            tryMovePlayer("s");
            break;
        case "c":
        case "3":
            tryMovePlayer("se");
            break;
        default:
    }
};
