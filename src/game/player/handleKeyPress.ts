import { tryMovePlayer } from "./movement";

export const handleKeyPress = (keyPressed: string) => {
    // nw = northwest, n = north, ne = northeast ....

    switch (keyPressed) {
        case "q":
            tryMovePlayer("nw");
            break;
        case "w":
            tryMovePlayer("n");
            break;
        case "e":
            tryMovePlayer("ne");
            break;
        case "a":
            tryMovePlayer("w");
            break;
        case "d":
            tryMovePlayer("e");
            break;
        case "z":
            tryMovePlayer("sw");
            break;
        case "x":
            tryMovePlayer("s");
            break;
        case "c":
            tryMovePlayer("se");
            break;
        default:
    }
};
