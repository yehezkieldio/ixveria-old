import { type Args, CommandOptionsRunTypeEnum, type ResultType } from "@sapphire/framework";
import { UserError } from "@sapphire/framework";
import { type Guild, type GuildMember, type Message, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { IxveriaCommand } from "#lib/extensions/command";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ModerationActionContext } from "#services/moderation";

export class UnBanCommand extends IxveriaCommand {
    public constructor(context: IxveriaCommand.LoaderContext, options: IxveriaCommand.Options) {
        super(context, {
            ...options,
            description: "Remove a ban from a user in the server.",
            tags: ["moderation", "moderation-action", "punishment"],
            requiredClientPermissions: [PermissionFlagsBits.BanMembers],
            requiredUserPermissions: [PermissionFlagsBits.BanMembers],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: IxveriaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("user_id").setDescription("The user id to unban from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for unbanning the user from the server.")
                    .setRequired(false),
            );

        void registry.registerChatInputCommand(command);
    }

    #serverOnly = "This command can only be executed in a server.";
    #defaultReason = "No reason provided.";

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: IxveriaCommand.ChatInputCommandInteraction) {
        const { bot } = this.container.utilities;

        const userId: string = interaction.options.getString("user_id", true);
        const reason: string = interaction.options.getString("reason") ?? this.#defaultReason;

        if (!interaction.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(interaction.user.id, interaction.guild);

        const response = await this.unbanUser(interaction.guild, {
            executor: executor,
            targetUserId: userId,
            reason: reason,
        });

        return interaction.reply(response);
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const { bot } = this.container.utilities;

        const userIdArgument: ResultType<string> = await args.restResult("string");
        if (userIdArgument.isErr()) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ArgsMissing,
                message: "You didn't provide any user id to unban, how am I supposed to do that?",
            });
        }
        const userId: string = userIdArgument.unwrap();

        const reasonArgument: ResultType<string> = await args.restResult("string");
        let reason: string;
        if (reasonArgument.isErr()) {
            reason = this.#defaultReason;
        } else {
            reason = reasonArgument.unwrap();
        }

        if (!message.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(message.author.id, message.guild);

        const response = await this.unbanUser(message.guild, {
            executor: executor,
            targetUserId: userId,
            reason: reason,
        });

        return message.reply(response);
    }

    /* -------------------------------------------------------------------------- */

    private async unbanUser(guild: Guild, context: Omit<ModerationActionContext, "targetUser">): Promise<string> {
        const { moderation } = this.container.services;

        const unban = await moderation.unban(guild, context);
        if (unban) {
            return `Kicking ${context.targetUserId} for reason: ${context.reason}`;
        }

        throw new UserError({
            identifier: IxveriaIdentifiers.CommandServiceError,
            message: `I cannot kick ${context.targetUserId}.`,
        });
    }
}
