import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";

import { Services } from "./services/services";
import type { ServicesStore } from "./services/services-store";
import { Utilities } from "./utilities/utilities";
import type { UtilitiesStore } from "./utilities/utilities-store";

declare module "discord.js" {
    export interface Client {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        services: ServicesStore;
        utilities: UtilitiesStore;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}

function exposeStorePieces<T>(store: Map<string, T>, exposePiece: (name: string, piece: T) => void): void {
    for (const [name, piece] of store.entries()) {
        exposePiece(name, piece);
    }
}

export class Stores extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        this.services = new Services();
        this.stores.register(this.services.store);

        this.utilities = new Utilities();
        this.stores.register(this.utilities.store);
    }

    public static [postLogin](this: SapphireClient): void {
        exposeStorePieces(this.services.store, this.services.exposePiece.bind(this.services));
        exposeStorePieces(this.utilities.store, this.utilities.exposePiece.bind(this.utilities));
    }
}

SapphireClient.plugins.registerPostInitializationHook(Stores[preInitialization], "IxveriaStores-PreInitialization");
SapphireClient.plugins.registerPostLoginHook(Stores[postLogin], "IxveriaStores-PostLogin");
