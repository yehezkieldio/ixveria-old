import { Subcommand, type SubcommandOptions } from "@sapphire/plugin-subcommands";
import type { ChatMessageContext } from "#lib/typings/message-type";

interface ImperiaSubcommandOptions extends SubcommandOptions {
    tags: string[];
}

export abstract class ImperiaSubcommand extends Subcommand {
    public tags: string[];

    protected constructor(context: Subcommand.LoaderContext, options: ImperiaSubcommandOptions) {
        super(context, {
            ...options,
        });

        this.tags = options.tags;
    }
}

export declare namespace ImperiaSubcommand {
    type Options = ImperiaSubcommandOptions;
    type JSON = Subcommand.JSON;
    type Context = Subcommand.LoaderContext;
    type RunInTypes = Subcommand.RunInTypes;
    type ChatInputCommandInteraction = Subcommand.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Subcommand.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Subcommand.AutocompleteInteraction;
    type Registry = Subcommand.Registry;
    type MessageContext = ChatMessageContext;
}
