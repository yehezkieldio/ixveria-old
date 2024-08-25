import type { ResponseService } from "#services/response";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
    }

    interface Container {
        services: Services;
    }
}
