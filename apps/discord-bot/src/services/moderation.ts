import { Service } from "@ixveria/stores/service";
import { UserError } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ChatMessageContext } from "#lib/typings/message-type";

export class ModerationService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "moderation",
        });
    }

    public async validateAction(
        guild: ChatMessageContext["guild"],
        executor: GuildMember,
        targetUser: GuildMember,
        action: "kick" | "ban",
    ): Promise<boolean> {
        if (!guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        /* -------------------------------------------------------------------------- */

        if (targetUser.id === executor.id) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} yourself.`,
            });
        }

        if (targetUser.id === this.container.client.id) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `I cannot ${action} myself.`,
            });
        }

        if (targetUser.id === guild.ownerId) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} the server owner.`,
            });
        }

        /* -------------------------------------------------------------------------- */

        if (targetUser.roles.highest.position >= executor.roles.highest.position) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} a user with an equal or higher role than yours.`,
            });
        }

        /* -------------------------------------------------------------------------- */

        if (action === "kick" && !targetUser.kickable) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `I cannot ${action} this user.`,
            });
        }

        if (action === "ban" && !targetUser.bannable) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `I cannot ${action} this user.`,
            });
        }

        return true;
    }

    /* -------------------------------------------------------------------------- */

    public async kick(
        guild: ChatMessageContext["guild"],
        executor: GuildMember,
        targetUser: GuildMember,
        reason: string,
    ): Promise<boolean> {
        await this.validateAction(guild, executor, targetUser, "kick");

        const kick = await targetUser.kick(reason);

        if (kick) return true;
        return false;
    }
}
