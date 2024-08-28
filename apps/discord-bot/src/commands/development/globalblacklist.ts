import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import type { Message } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaSubcommand } from "#lib/extensions/subcommand";

export class GlobalBlacklistCommand extends IxveriaSubcommand {
    public constructor(context: IxveriaSubcommand.LoaderContext, options: IxveriaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage the global blacklist",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            preconditions: [IxveriaIdentifiers.DeveloperUserOnly],
            subcommands: [
                {
                    name: "list",
                    messageRun: "messageBlacklistList",
                    default: true,
                },
                {
                    name: "add",
                    messageRun: "messageBlacklistAdd",
                },
                {
                    name: "remove",
                    messageRun: "messageBlacklistRemove",
                },
            ],
        });
    }

    /* -------------------------------------------------------------------------- */

    public async messageBlacklistList(message: Message): Promise<Message> {
        return message.reply("Under construction!");
    }

    /* -------------------------------------------------------------------------- */

    public async messageBlacklistAdd(message: Message): Promise<Message> {
        return message.reply("Under construction!");
    }

    /* -------------------------------------------------------------------------- */

    public async messageBlacklistRemove(message: Message): Promise<Message> {
        return message.reply("Under construction!");
    }
}
