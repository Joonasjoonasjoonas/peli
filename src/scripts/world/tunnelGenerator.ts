import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { floor, TileType, wall } from "./map";

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const generateTunnels = (map: TileType[]): TileType[] => {
    const rooms: Room[] = [];
    const numRooms = Math.floor(Math.random() * 7) + 4; // 4 to 10 rooms

    // Create first room in the upper left corner
    rooms.push({
        x: 1,
        y: 1,
        width: Math.floor(Math.random() * 7) + 4, // 4 to 10
        height: Math.floor(Math.random() * 7) + 4 // 4 to 10
    });

    // Create remaining rooms
    for (let i = 1; i < numRooms; i++) {
        let room: Room;
        do {
            room = {
                x: Math.floor(Math.random() * (WORLD_WIDTH - 12)) + 1,
                y: Math.floor(Math.random() * (WORLD_HEIGHT - 12)) + 1,
                width: Math.floor(Math.random() * 7) + 4,
                height: Math.floor(Math.random() * 7) + 4
            };
        } while (rooms.some(r => isOverlapping(r, room)));
        rooms.push(room);
    }

    // Carve out rooms
    for (const room of rooms) {
        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                map[getIndexFromXY(x, y)] = floor;
            }
        }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        const start = rooms[i - 1];
        const end = rooms[i];
        const startX = start.x + Math.floor(start.width / 2);
        const startY = start.y + Math.floor(start.height / 2);
        const endX = end.x + Math.floor(end.width / 2);
        const endY = end.y + Math.floor(end.height / 2);

        // Horizontal corridor
        for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
            for (let y = startY - 1; y <= startY + 1; y++) {
                map[getIndexFromXY(x, y)] = floor;
            }
        }

        // Vertical corridor
        for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
            for (let x = endX - 1; x <= endX + 1; x++) {
                map[getIndexFromXY(x, y)] = floor;
            }
        }
    }

    return map;
};

function isOverlapping(a: Room, b: Room): boolean {
    return (
        a.x < b.x + b.width + 1 &&
        a.x + a.width + 1 > b.x &&
        a.y < b.y + b.height + 1 &&
        a.y + a.height + 1 > b.y
    );
}
