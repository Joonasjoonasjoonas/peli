import ActorStore, { Actor } from "../../store/ActorStore";
import GameStore from "../../store/GameStore";
import ItemStore from "../../store/ItemStore";
import { getIndexFromXY, randomNumber } from "../../utils/utils";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../game";
import { BaseItem, BASIC_ITEM } from "../items/itemTypes";
import { LENKKEILIJA, NPC } from "./actorTypes"; // Importing the warrior actor type

const getRandomEdgePosition = (exclude?: 'top' | 'right' | 'bottom' | 'left'): { pos: number, edge: 'top' | 'right' | 'bottom' | 'left' } => {
    const edges = ['top', 'right', 'bottom', 'left'].filter(e => e !== exclude) as ('top' | 'right' | 'bottom' | 'left')[];
    const edge = edges[Math.floor(Math.random() * edges.length)];
    
    let pos;
    switch (edge) {
        case 'top':
        case 'bottom':
            pos = Math.floor(Math.random() * (WORLD_WIDTH - 4)) + 2;
            break;
        case 'left':
        case 'right':
            pos = Math.floor(Math.random() * (WORLD_HEIGHT - 4)) + 2;
            break;
    }
    
    return { pos, edge };
};

const getEdgeCoordinates = (pos: number, edge: 'top' | 'right' | 'bottom' | 'left'): { x: number, y: number } => {
    switch (edge) {
        case 'top':
            return { x: pos, y: 1 };
        case 'right':
            return { x: WORLD_WIDTH - 2, y: pos };
        case 'bottom':
            return { x: pos, y: WORLD_HEIGHT - 2 };
        case 'left':
            return { x: 1, y: pos };
    }
};

export const populate = () => {
    const { addActor, clearActors } = ActorStore;
    const { worldMap, currentMapType } = GameStore;
    clearActors();

    // Add Lenkkeilijä only in forest maps
    if (currentMapType === 'forest') {
        for (let i = 0; i < 20; i++) {
            const startEdge = getRandomEdgePosition();
            const startPos = getEdgeCoordinates(startEdge.pos, startEdge.edge);
            
            const endEdge = getRandomEdgePosition(startEdge.edge);
            const endPos = getEdgeCoordinates(endEdge.pos, endEdge.edge);

            const lenkkeilija: Actor = {
                ...LENKKEILIJA,
                id: 21 + i,
                xCoord: startPos.x,
                yCoord: startPos.y,
                destinationX: endPos.x,
                destinationY: endPos.y,
            };
            
            addActor(lenkkeilija);
        }
    }

    // Add NPCs to all map types
    for (let i = 0; i < 20; i++) {
        // Find a random non-blocking position for the NPC
        let x, y;
        do {
            x = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
        } while (worldMap[y * WORLD_WIDTH + x]?.blocking);

        const npc: Actor = {
            ...NPC,
            id: 41 + i,
            xCoord: x,
            yCoord: y,
            destinationX: Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1,
            destinationY: Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1,
        };
        
        addActor(npc);
    }
};