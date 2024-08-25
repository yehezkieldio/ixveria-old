import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputCommadDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        const { logger } = this.container;
        const { interaction } = payload;

        logger.debug(`ChatInputCommadDeniedListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
