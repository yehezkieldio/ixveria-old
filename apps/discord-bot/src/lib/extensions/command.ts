import { Command, type CommandOptions } from "@sapphire/framework";
import type { ChatMessageResponse } from "#lib/typings/message-type";

interface ImperiaCommandOptions extends CommandOptions {
    tags: string[];
}

export abstract class ImperiaCommand extends Command {
    public tags: string[];

    protected constructor(context: Command.LoaderContext, options: ImperiaCommandOptions) {
        super(context, {
            ...options,
        });

        this.tags = options.tags;
    }
}

export declare namespace ImperiaCommand {
    type Options = ImperiaCommandOptions;
    type JSON = Command.JSON;
    type LoaderContext = Command.LoaderContext;
    type RunInTypes = Command.RunInTypes;
    type ChatInputCommandInteraction = Command.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Command.AutocompleteInteraction;
    type Registry = Command.Registry;
    type MessageContext = ChatMessageResponse;
}
