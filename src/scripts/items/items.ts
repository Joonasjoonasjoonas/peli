import { BaseItem, BASIC_ITEM } from "../items/itemTypes";
import ItemStore from "../../store/ItemStore";
import GameStore from "../../store/GameStore";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../game";
import { getIndexFromXY } from "../../utils/utils";

export const populateItems = () => {
    const { clearItems, addItem } = ItemStore;
    const { worldMap } = GameStore;
    
    // Clear existing items
    clearItems();

    // Generate 10 random items
    for (let i = 0; i < 10; i++) {
        let validPosition = false;
        let x = 0;
        let y = 0;

        // Find a walkable position
        while (!validPosition) {
            x = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
            const index = getIndexFromXY(x, y);
            
            if (!worldMap[index].blocking) {
                validPosition = true;
            }
        }

        const item: BaseItem = {
            ...BASIC_ITEM,
            id: i,
            xCoord: x,
            yCoord: y,
            carriedBy: null
        };

        addItem(item);
    }
};