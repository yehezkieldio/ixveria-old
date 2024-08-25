import type { ResponseService } from "#services/response";
import type { BotUtilities } from "#utilities/bot";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
    }

    interface Utilities {
        bot: BotUtilities;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}
