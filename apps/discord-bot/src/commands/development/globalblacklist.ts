import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import type { Guild, Message, User } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaEmbedBuilder } from "#lib/extensions/embed-builder";
import { IxveriaSubcommand } from "#lib/extensions/subcommand";
import type { BlacklistEntities } from "#services/blacklist";

export class GlobalBlacklistCommand extends IxveriaSubcommand {
    public constructor(context: IxveriaSubcommand.LoaderContext, options: IxveriaSubcommand.Options) {
        super(context, {
            ...options,
            description: "Manage the global blacklist.",
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

    public async messageBlacklistList(message: Message, args: Args): Promise<Message> {
        const typeArgument: ResultType<string> = await args.restResult("string");

        if (typeArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any type of blacklist to list!",
            });
        }

        const type: string = typeArgument.unwrap();
        const types: string[] = ["guild", "server", "user"];

        if (!types.includes(type)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                message: "You provided an invalid blacklist type!",
            });
        }

        let blacklists: BlacklistEntities[] = [];
        const names: string[] = [];

        if (type === "guild" || type === "server") {
            blacklists = await this.container.services.blacklist.getServers();
            blacklists.map((blacklist) => {
                const guild: Guild | undefined = this.container.client.guilds.cache.get(blacklist.entityId);
                names.push(guild ? guild.name : blacklist.entityId);
            });
        } else {
            blacklists = await this.container.services.blacklist.getUsers();
            blacklists.map((blacklist) => {
                const user: User | undefined = this.container.client.users.cache.get(blacklist.entityId);
                names.push(user ? user.tag : blacklist.entityId);
            });
        }

        const embed: IxveriaEmbedBuilder = new IxveriaEmbedBuilder().setTheme("information");

        embed.setFields([
            {
                name: `Blacklisted ${type}s`,
                value: names.join("\n"),
            },
        ]);

        return message.reply({ embeds: [embed] });
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
