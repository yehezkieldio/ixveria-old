import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { IxveriaCommand } from "#lib/extensions/command";

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

    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
}
