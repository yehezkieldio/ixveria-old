import type { Services } from "./services/services";
import type { ServicesStore } from "./services/services-store";

export * from "./services/service";
export * from "./services/services-store";
export * from "./services/services";

declare module "discord.js" {
    export interface Client {
        services: Services;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        services: ServicesStore;
    }

    interface Container {
        services: Services;
    }
}
