import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload) {
        const { logger, services } = this.container;
        const { message } = payload;

        logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        const response: string = services.response.generateDeniedResponse(error);

        return message.reply({
            content: response,
            allowedMentions: { users: [message.author.id], roles: [] },
        });
    }
}
