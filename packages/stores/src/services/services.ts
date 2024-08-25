import { container } from "@sapphire/pieces";
import type { Service } from "./service";
import { ServicesStore } from "./services-store";

export class Services {
    public readonly store: ServicesStore;

    public constructor() {
        //@ts-ignore Bypass TypeScript check for dynamic property assignment
        container.services = this;
        this.store = new ServicesStore();
    }

    public exposePiece(name: string, piece: Service): void {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}
