import { Command, type CommandOptions } from "@sapphire/framework";
import type { ChatMessageResponse } from "#lib/typings/message-type";

interface IxveriaCommandOptions extends CommandOptions {
    tags: string[];
}

export abstract class IxveriaCommand extends Command {
    public tags: string[];

    protected constructor(context: Command.LoaderContext, options: IxveriaCommandOptions) {
        super(context, {
            ...options,
        });

        this.tags = options.tags;
    }
}

export declare namespace IxveriaCommand {
    type Options = IxveriaCommandOptions;
    type JSON = Command.JSON;
    type LoaderContext = Command.LoaderContext;
    type RunInTypes = Command.RunInTypes;
    type ChatInputCommandInteraction = Command.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Command.AutocompleteInteraction;
    type Registry = Command.Registry;
    type MessageContext = ChatMessageResponse;
}
