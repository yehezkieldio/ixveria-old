import type { ModerationService } from "#services/moderation";
import type { ResponseService } from "#services/response";
import type { BotUtilities } from "#utilities/bot";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
        moderation: ModerationService;
    }

    interface Utilities {
        bot: BotUtilities;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
