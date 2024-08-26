import { type Args, CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type Guild, type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";
import { IxveriaCommand } from "#lib/extensions/command";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaEmbedBuilder } from "#lib/extensions/embed-builder";

export class ServerAvatarCommand extends IxveriaCommand {
    public constructor(context: IxveriaCommand.LoaderContext, options: IxveriaCommand.Options) {
        super(context, {
            ...options,
            description: "View the avatar of the server.",
            aliases: ["server-avatar", "serverav", "serverpfp"],
            tags: ["server", "image", "utility"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: IxveriaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: IxveriaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const server: Guild = interaction.guild as Guild;
        const { reply, embed } = this.generateResponse(server);

        return interaction.reply({ content: reply, embeds: [embed] });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const server: Guild = message.guild as Guild;
        const { reply, embed } = this.generateResponse(server);

        return message.reply({ content: reply, embeds: [embed] });
    }

    /* -------------------------------------------------------------------------- */

    private getServerAvatar(server: Guild) {
        const serverAvatar: string | null = server.iconURL({ size: 4096 });
        if (!serverAvatar) return "";

        return serverAvatar;
    }

    private generateResponse(server: Guild) {
        const avatar: string = this.getServerAvatar(server);
        const embed = new IxveriaEmbedBuilder().setTheme("information");

        if (!avatar) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "Unfortunately, this server doesn't have an avatar!",
            });
        }

        const reply = "Here's the requested avatar!~";

        embed.setImage(avatar);

        return {
            reply,
            embed,
        };
    }
}
