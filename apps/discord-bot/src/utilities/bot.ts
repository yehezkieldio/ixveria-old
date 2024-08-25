import { Utility } from "@ixveria/stores/utility";
import type { UserError } from "@sapphire/framework";
import { ChannelType, chatInputApplicationCommandMention, inlineCode } from "discord.js";

export class BotUtilities extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "bot",
        });
    }

    /**
     * Get the channel type from the error context.
     * @param error The error to get the channel type from.
     * @returns The channel type.
     */
    public getChannelType(error: UserError) {
        const channelType = Reflect.get(Object(error.context), "types") as number[];

        if (channelType.includes(ChannelType.GuildText)) return "server text channel.";
        if (channelType.includes(ChannelType.DM)) return "DM channel.";
        return "valid channel.";
    }

    /**
     * Get the missing permissions from the error context.
     * @param error The error to get the missing permissions from.
     * @returns The missing permissions.
     */
    public getMissingPermissions(error: UserError) {
        const missing = Reflect.get(Object(error.context), "missing") as string[];

        return missing.map((perm) => inlineCode(perm)).join(" ");
    }

    /**
     * Get a Discord command mention for the given command name.
     * @param commandName The command name to get the mention for.
     * @returns The command mention.
     */
    public getCommandMention = (commandName: string): string | `</${string}:${string}>` => {
        const command = this.container.applicationCommandRegistries.acquire(commandName);
        const commandId = command.globalChatInputCommandIds.values().next().value;

        if (!commandId) return `/${commandName}`;

        return chatInputApplicationCommandMention(command.commandName, commandId);
    };
}
