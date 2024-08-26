import { type Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type GuildMember, type InteractionResponse, type Message, SlashCommandBuilder, type User } from "discord.js";
import { IxveriaCommand } from "#lib/extensions/command";
import { IxveriaEmbedBuilder } from "#lib/extensions/embed-builder";

export class UserAvatarCommand extends IxveriaCommand {
    public constructor(context: IxveriaCommand.LoaderContext, options: IxveriaCommand.Options) {
        super(context, {
            ...options,
            description: "View the avatar of a user or yourself.",
            aliases: ["user-avatar", "avatar", "av", "pfp"],
            tags: ["user", "image", "utility"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: IxveriaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to view the avatar of.").setRequired(false),
            );

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: IxveriaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User = interaction.options.getUser("user") ?? interaction.user;
        const member: GuildMember | undefined =
            interaction.guild?.members.cache.get(user.id) ?? (await interaction.guild?.members.fetch(user.id));

        const { reply, embed } = this.generateResponse(user, member);

        return interaction.reply({ content: reply, embeds: [embed] });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const user: User = await args.pick("user").catch(() => message.author);
        const member: GuildMember | undefined =
            message.guild?.members.cache.get(user.id) ?? (await message.guild?.members.fetch(user.id));

        const { reply, embed } = this.generateResponse(user, member);

        return message.reply({ content: reply, embeds: [embed] });
    }

    /* -------------------------------------------------------------------------- */

    private getAvatar(user: User, member?: GuildMember): string {
        const userAvatar: string = user.displayAvatarURL({ size: 4096 });

        if (!member) return userAvatar;
        const memberAvatar: string = member.displayAvatarURL({ size: 4096 });

        return userAvatar !== memberAvatar ? memberAvatar : userAvatar;
    }

    private generateResponse(user: User, member?: GuildMember) {
        const avatar: string = this.getAvatar(user, member);
        const embed = new IxveriaEmbedBuilder().setTheme("information");

        const reply = "˖ ݁𖥔 ݁˖ Here's the requested avatar~";

        embed.setImage(avatar);

        return {
            reply,
            embed,
        };
    }
}
