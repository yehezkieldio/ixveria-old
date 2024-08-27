import type { BlacklistService } from "#services/blacklist";
import type { ModerationService } from "#services/moderation";
import type { ResponseService } from "#services/response";
import type { BotUtilities } from "#utilities/bot";

declare module "@sapphire/pieces" {
    interface Services {
        response: ResponseService;
        moderation: ModerationService;
        blacklist: BlacklistService;
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
    interface ArgType {
        naturalDate: number;
        guild: Guild;
    }

    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
