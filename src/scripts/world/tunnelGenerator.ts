import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { floor, TileType, wall } from "./tileTypes";

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Configuration variables
const MIN_ROOM_WIDTH = 5;
const MAX_ROOM_WIDTH = 9;
const MIN_ROOM_HEIGHT = 5;
const MAX_ROOM_HEIGHT = 9;
const MIN_ROOMS = 4;
const MAX_ROOMS = 10;
const ROOM_SPACING = 3; // Minimum spacing between rooms

export const generateTunnels = (map: TileType[]): TileType[] => {
    const rooms: Room[] = [];
    const numRooms = Math.floor(Math.random() * (MAX_ROOMS - MIN_ROOMS + 1)) + MIN_ROOMS;

    // Create first room in the upper left corner
    rooms.push({
        x: 1,
        y: 1,
        width: Math.floor(Math.random() * (MAX_ROOM_WIDTH - MIN_ROOM_WIDTH + 1)) + MIN_ROOM_WIDTH,
        height: Math.floor(Math.random() * (MAX_ROOM_HEIGHT - MIN_ROOM_HEIGHT + 1)) + MIN_ROOM_HEIGHT
    });

    // Create remaining rooms
    for (let i = 1; i < numRooms; i++) {
        let room: Room;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop

        do {
            room = {
                x: Math.floor(Math.random() * (WORLD_WIDTH - MAX_ROOM_WIDTH - 2)) + 1,
                y: Math.floor(Math.random() * (WORLD_HEIGHT - MAX_ROOM_HEIGHT - 2)) + 1,
                width: Math.floor(Math.random() * (MAX_ROOM_WIDTH - MIN_ROOM_WIDTH + 1)) + MIN_ROOM_WIDTH,
                height: Math.floor(Math.random() * (MAX_ROOM_HEIGHT - MIN_ROOM_HEIGHT + 1)) + MIN_ROOM_HEIGHT
            };
            attempts++;
        } while (rooms.some(r => isOverlapping(r, room, ROOM_SPACING)) && attempts < maxAttempts);

        if (attempts < maxAttempts) {
            rooms.push(room);
        } else {
            console.warn("Could not place all rooms. Continuing with", i, "rooms.");
            break;
        }
    }

    // Carve out rooms
    for (const room of rooms) {
        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                map[getIndexFromXY(x, y)] = floor;
            }
        }
    }

    // Connect rooms with simple corridors
    for (let i = 1; i < rooms.length; i++) {
        const start = rooms[i - 1];
        const end = rooms[i];
        let x = start.x + Math.floor(start.width / 2);
        let y = start.y + Math.floor(start.height / 2);
        const endX = end.x + Math.floor(end.width / 2);
        const endY = end.y + Math.floor(end.height / 2);

        // Create horizontal corridor
        while (x !== endX) {
            map[getIndexFromXY(x, y)] = floor;
            x += x < endX ? 1 : -1;
        }

        // Create vertical corridor
        while (y !== endY) {
            map[getIndexFromXY(x, y)] = floor;
            y += y < endY ? 1 : -1;
        }
    }

    return map;
};

function isOverlapping(a: Room, b: Room, spacing: number): boolean {
    return (
        a.x < b.x + b.width + spacing &&
        a.x + a.width + spacing > b.x &&
        a.y < b.y + b.height + spacing &&
        a.y + a.height + spacing > b.y
    );
}
