import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
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

export class KickCommand extends IxveriaCommand {
    public constructor(context: IxveriaCommand.LoaderContext, options: IxveriaCommand.Options) {
        super(context, {
            ...options,
            description: "Kick a user from the server.",
            tags: ["moderation"],
            requiredClientPermissions: [PermissionFlagsBits.KickMembers],
            requiredUserPermissions: [PermissionFlagsBits.KickMembers],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: IxveriaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to kick from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for kicking the user from the server.")
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

        if (!interaction.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(interaction.user.id, interaction.guild);
        const target: GuildMember = await bot.getUserAsGuildMember(user.id, interaction.guild);

        const response: string = await this.kickUser(interaction.guild, executor, target, reason);

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

        if (!message.guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: this.#serverOnly,
            });
        }

        const executor: GuildMember = await bot.getUserAsGuildMember(message.author.id, message.guild);
        const target: GuildMember = await bot.getUserAsGuildMember(user.id, message.guild);

        const response: string = await this.kickUser(message.guild, executor, target, reason);

        return message.reply(response);
    }

    /* -------------------------------------------------------------------------- */

    private async kickUser(guild: Guild, executor: GuildMember, target: GuildMember, reason: string) {
        const { moderation } = this.container.services;

        await moderation.kick(guild, {
            executor: executor,
            targetUser: target,
            reason: reason,
        });

        target.send({
            embeds: [
                new IxveriaEmbedBuilder()
                    .setTheme("warning")
                    .setDescription(`You have been kicked from ${guild.name} for reason: ${reason}`),
            ],
        });

        return `Kicking ${target.user.tag} for reason: ${reason}`;
    }
}
