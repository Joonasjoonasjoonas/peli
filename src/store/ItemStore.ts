import { makeAutoObservable } from "mobx";
import { BaseItem } from "../scripts/items/itemTypes";

class ItemStore {
    items: BaseItem[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    addItem = (item: BaseItem) => {
        this.items.push(item);
    };

    removeItem = (id: number) => {
        this.items = this.items.filter(item => item.id !== id);
    };

    updateItem = (id: number, updates: Partial<BaseItem>) => {
        this.items = this.items.map(item => 
            item.id === id ? { ...item, ...updates } : item
        );
    };

    clearItems = () => {
        this.items = [];
    };
}

export default new ItemStore();