import { getIndexFromXY } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { floor, TileType, wall } from "./tileTypes";

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
}

// Configuration variables
const MIN_ROOM_WIDTH = 5;
const MAX_ROOM_WIDTH = 15;
const MIN_ROOM_HEIGHT = 4;
const MAX_ROOM_HEIGHT = 8;
const MIN_ROOMS = 5;
const MAX_ROOMS = 30;
const ROOM_SPACING = 1; // Minimum spacing between rooms

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

    // Connect rooms with corridors
    const connectedRooms: Set<number> = new Set([0]);  // Start with the first room
    const remainingRooms: number[] = Array.from({ length: rooms.length - 1 }, (_, i) => i + 1);

    while (remainingRooms.length > 0) {
        let closestPair: [number, number] | null = null;
        let shortestDistance = Infinity;

        for (const connectedRoom of Array.from(connectedRooms)) {
            for (const remainingRoom of remainingRooms) {
                const distance = getDistance(rooms[connectedRoom], rooms[remainingRoom]);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestPair = [connectedRoom, remainingRoom];
                }
            }
        }

        if (closestPair) {
            const [connectedRoom, remainingRoom] = closestPair;
            const startPoint = findClosestWallPoint(rooms[connectedRoom], rooms[remainingRoom]);
            const endPoint = findClosestWallPoint(rooms[remainingRoom], rooms[connectedRoom]);
            createCorridor(map, startPoint, endPoint);

            connectedRooms.add(remainingRoom);
            remainingRooms.splice(remainingRooms.indexOf(remainingRoom), 1);
        } else {
            console.warn("Unable to connect all rooms.");
            break;
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

function getDistance(a: Room, b: Room): number {
    const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
    const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    return Math.sqrt(Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2));
}

function findClosestWallPoint(room: Room, otherRoom: Room): Point {
    const centerOther = { x: otherRoom.x + otherRoom.width / 2, y: otherRoom.y + otherRoom.height / 2 };
    let closestPoint: Point = { x: room.x, y: room.y };
    let shortestDistance = Infinity;

    // Check all points on the walls of the room, excluding corners and adjacent tiles
    for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
        for (let y of [room.y, room.y + room.height - 1]) {
            const distance = Math.sqrt(Math.pow(x - centerOther.x, 2) + Math.pow(y - centerOther.y, 2));
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestPoint = { x, y };
            }
        }
    }
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
        for (let x of [room.x, room.x + room.width - 1]) {
            const distance = Math.sqrt(Math.pow(x - centerOther.x, 2) + Math.pow(y - centerOther.y, 2));
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestPoint = { x, y };
            }
        }
    }

    return closestPoint;
}

function createCorridor(map: TileType[], start: Point, end: Point): void {
    let x = start.x;
    let y = start.y;
    let straightCount = 0;
    let isHorizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

    while (x !== end.x || y !== end.y) {
        map[getIndexFromXY(x, y)] = floor;

        const remainingDistance = Math.abs(end.x - x) + Math.abs(end.y - y);

        if (remainingDistance > 4 && straightCount >= 2 && Math.random() < 0.5) {
            isHorizontal = !isHorizontal;
            straightCount = 0;
        }

        if (isHorizontal) {
            if (x !== end.x) {
                x += x < end.x ? 1 : -1;
                straightCount++;
            } else {
                isHorizontal = false;
                straightCount = 0;
            }
        } else {
            if (y !== end.y) {
                y += y < end.y ? 1 : -1;
                straightCount++;
            } else {
                isHorizontal = true;
                straightCount = 0;
            }
        }
    }
    map[getIndexFromXY(end.x, end.y)] = floor;
}
