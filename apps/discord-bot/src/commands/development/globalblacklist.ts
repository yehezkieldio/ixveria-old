import type { BlacklistType } from "@ixveria/database/schema";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import type { Message } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaEmbedBuilder } from "#lib/extensions/embed-builder";
import { IxveriaSubcommand } from "#lib/extensions/subcommand";

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

    #types = ["server", "user"];

    /* -------------------------------------------------------------------------- */

    public async messageBlacklistList(message: Message, args: Args): Promise<Message> {
        const typeArgument: ResultType<string> = await args.restResult("string");

        if (typeArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any type of blacklist to list!",
            });
        }

        const type = typeArgument.unwrap() as BlacklistType;

        if (!this.#types.includes(type)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                message: `Invalid blacklist type provided. Valid types are: ${this.#types.join(", ")}`,
            });
        }

        const names: string[] = [];

        if (type === "guild") {
            const list = await this.container.services.blacklist.getServers();
            for (const entity of list) {
                const entityName = this.container.client.guilds.cache.get(entity.entityId);
                names.push(entityName ? entityName.name : entity.entityId);
            }
        }

        if (type === "user") {
            const list = await this.container.services.blacklist.getUsers();
            for (const entity of list) {
                const entityName = this.container.client.users.cache.get(entity.entityId);
                names.push(entityName ? entityName.tag : entity.entityId);
            }
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

    public async messageBlacklistAdd(message: Message, args: Args): Promise<Message> {
        const typeArgument: ResultType<string> = await args.restResult("string");

        if (typeArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any type of blacklist to list!",
            });
        }

        const type = typeArgument.unwrap() as BlacklistType;

        if (!this.#types.includes(type)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                message: `Invalid blacklist type provided. Valid types are: ${this.#types.join(", ")}`,
            });
        }

        const idArgument: ResultType<string> = await args.restResult("string");

        if (idArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any ID to blacklist!",
            });
        }

        const id: string = idArgument.unwrap();

        if (type === "user") {
            const entity = await this.container.utilities.bot.getUserFromId(id);

            if (!entity) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                    message: "Invalid user ID provided!",
                });
            }

            await this.container.services.blacklist.create({
                entityId: entity.id,
                entityType: "user",
            });
        }

        if (type === "guild") {
            const entity = await this.container.utilities.bot.getGuildFromId(id);

            if (!entity) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                    message: "Invalid server ID provided!",
                });
            }

            await this.container.services.blacklist.create({
                entityId: entity.id,
                entityType: "guild",
            });
        }

        return message.reply("Successfully blacklisted the entity!");
    }

    /* -------------------------------------------------------------------------- */

    public async messageBlacklistRemove(message: Message, args: Args): Promise<Message> {
        const typeArgument: ResultType<string> = await args.restResult("string");

        if (typeArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any type of blacklist to list!",
            });
        }

        const type = typeArgument.unwrap() as BlacklistType;

        if (!this.#types.includes(type)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                message: `Invalid blacklist type provided. Valid types are: ${this.#types.join(", ")}`,
            });
        }

        const idArgument: ResultType<string> = await args.restResult("string");

        if (idArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any ID to blacklist!",
            });
        }

        const id: string = idArgument.unwrap();

        if (type === "user") {
            const entity = await this.container.utilities.bot.getUserFromId(id);

            if (!entity) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                    message: "Invalid user ID provided!",
                });
            }

            await this.container.services.blacklist.remove(entity.id);
        }

        if (type === "guild") {
            const entity = await this.container.utilities.bot.getGuildFromId(id);

            if (!entity) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.InvalidArgumentProvided,
                    message: "Invalid server ID provided!",
                });
            }

            await this.container.services.blacklist.remove(entity.id);
        }

        return message.reply("Successfully removed the entity from the blacklist!");
    }
}
