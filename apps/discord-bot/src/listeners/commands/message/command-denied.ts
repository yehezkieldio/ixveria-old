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
        const { logger } = this.container;
        const { message } = payload;

        logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
