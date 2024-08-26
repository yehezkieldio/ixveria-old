import { type ChatInputCommandErrorPayload, Listener, type UserError } from "@sapphire/framework";
import { IxveriaEvents } from "#lib/extensions/constants/events";

export class ChatInputCommadErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: IxveriaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandErrorPayload) {
        const { logger } = this.container;
        const { interaction } = payload;

        logger.debug(`ChatInputCommadErrorListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
