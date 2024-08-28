import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";

export class BlacklistCheckPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 21,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId, interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId, interaction.user.id);
    }

    public override messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(message.guildId, message.author.id);
    }

    private async doBlacklistCheck(guildId: string | null, userId: string | null): Promise<Result<unknown, UserError>> {
        if (guildId === null) return this.ok();
        if (userId === null) return this.ok();

        const [isServerBlacklisted, isUserBlacklisted] = await Promise.all([
            this.container.services.blacklist.ensureServerIsBlacklisted(guildId),
            this.container.services.blacklist.ensureUserIsBlacklisted(userId),
        ]);

        if (isServerBlacklisted) {
            return this.error({
                identifier: IxveriaIdentifiers.ServerBlacklisted,
                message: "This server is blacklisted from using my services!",
            });
        }

        if (isUserBlacklisted) {
            return this.error({
                identifier: IxveriaIdentifiers.ServerBlacklisted,
                message: "This user is blacklisted from using my services!",
            });
        }

        return this.ok();
    }
}
