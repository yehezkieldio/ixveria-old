import { type Args, CommandOptionsRunTypeEnum, type Result, type ResultType } from "@sapphire/framework";
import { UserError } from "@sapphire/framework";
import {
    type Guild,
    type GuildMember,
    type Message,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type User,
} from "discord.js";
import { IxveriaCommand } from "#lib/extensions/command";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaEmbedBuilder } from "#lib/extensions/embed-builder";
import { IxveriaResolvers } from "#lib/extensions/resolvers";
import type { BanActionContext, ModerationActionContext } from "#services/moderation";

export class BanCommand extends IxveriaCommand {
    public constructor(context: IxveriaCommand.LoaderContext, options: IxveriaCommand.Options) {
        super(context, {
            ...options,
            description: "Ban a user from the server.",
            tags: ["moderation", "moderation-action", "punishment"],
            requiredClientPermissions: [PermissionFlagsBits.BanMembers],
            requiredUserPermissions: [PermissionFlagsBits.BanMembers],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            flags: ["silent", "s"],
        });
    }

    public override registerApplicationCommands(registry: IxveriaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to ban from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for banning the user from the server.")
                    .setRequired(false),
            )
            .addStringOption((option) =>
                option
                    .setName("delete_message")
                    .setDescription("The arbitrary time interval to delete the message, i.e. 7 days, 18h, etc.")
                    .setRequired(false),
            )
            .addBooleanOption((option) =>
                option
                    .setName("silent")
                    .setDescription("Whether to send a message to the user being banned.")
                    .setRequired(false),
            );

        void registry.registerChatInputCommand(command);
    }

    #serverOnly = "This command can only be executed in a server.";
    #defaultReason = "No reason provided.";

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: IxveriaCommand.ChatInputCommandInteraction) {
        const { bot } = this.container.utilities;

        const user: User = interaction.options.getUser("user", true);
        const reason: string = interaction.options.getString("reason") ?? this.#defaultReason;
        const isSilent: boolean = interaction.options.getBoolean("silent") ?? false;
        const deleteMessage: string = interaction.options.getString("delete_message") ?? "0";

        const seconds: Result<number, string> = IxveriaResolvers.resolveNaturalDate(deleteMessage);

        if (seconds.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: seconds.unwrapErr(),
            });
        }

        if (!interaction.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(interaction.user.id, interaction.guild);
        const target: GuildMember = await bot.getUserAsGuildMember(user.id, interaction.guild);

        const response = await this.banUser(interaction.guild, {
            executor: executor,
            targetUser: target,
            reason: reason,
            silent: isSilent,
            deleteMessageSeconds: seconds.unwrap(),
        });

        return interaction.reply(response);
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const { bot } = this.container.utilities;

        const userArgument: ResultType<User> = await args.restResult("user");
        if (userArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any user to kick, how am I supposed to do that?",
            });
        }
        const user: User = userArgument.unwrap();

        const reasonArgument: ResultType<string> = await args.restResult("string");
        let reason: string;
        if (reasonArgument.isErr()) {
            reason = this.#defaultReason;
        } else {
            reason = reasonArgument.unwrap();
        }

        const secondsArgument: ResultType<number> = await args.restResult("naturalDate");
        let seconds: number;
        if (secondsArgument.isErr()) {
            seconds = 0;
        } else {
            seconds = secondsArgument.unwrap();
        }

        const isSilent: boolean = args.getFlags("silent", "s");

        if (!message.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(message.author.id, message.guild);
        const target: GuildMember = await bot.getUserAsGuildMember(user.id, message.guild);

        const response = await this.banUser(message.guild, {
            executor: executor,
            targetUser: target,
            reason: reason,
            silent: isSilent,
            deleteMessageSeconds: seconds,
        });

        return message.reply(response);
    }

    /* -------------------------------------------------------------------------- */

    private async banUser(
        guild: Guild,
        context: Omit<ModerationActionContext & BanActionContext, "targetUserId">,
    ): Promise<string> {
        const { moderation } = this.container.services;

        const ban = await moderation.ban(guild, context);
        if (ban) {
            if (!context.silent) {
                context.targetUser.send({
                    embeds: [
                        new IxveriaEmbedBuilder()
                            .setTheme("warning")
                            .setDescription(`You have been banned from ${guild.name} for reason: ${context.reason}`),
                    ],
                });
            }

            return `Banning ${context.targetUser.user.tag} for reason: ${context.reason}`;
        }

        throw new UserError({
            identifier: IxveriaIdentifiers.CommandServiceError,
            message: `I cannot ban ${context.targetUser.user.tag}.`,
        });
    }
}
