import { Service } from "@ixveria/stores/service";
import { UserError } from "@sapphire/framework";
import type { Collection, Guild, GuildBan, GuildMember } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ChatMessageContext } from "#lib/typings/message-type";

export class ModerationService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "moderation",
        });
    }

    private async fetchBans(guild: ChatMessageContext["guild"]): Promise<Collection<string, GuildBan>> {
        if (!guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }
        return await guild.bans.fetch();
    }

    private async ensureUserIsNotBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (bans.has(targetUser.id)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This user is already banned.",
            });
        }
    }

    private async ensureUserIsBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (!bans.has(targetUser.id)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This user is not banned.",
            });
        }
    }

    private ensureActionIsValid(
        guild: Guild,
        executor: GuildMember,
        targetUser: GuildMember,
        action: "kick" | "ban" | "unban",
    ): void {
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

        if (targetUser.roles.highest.position >= executor.roles.highest.position) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} a user with an equal or higher role than yours.`,
            });
        }

        if (action === "kick" && !targetUser.kickable) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `I cannot ${action} this user.`,
            });
        }

        if (action === "ban" && !targetUser.bannable) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "I cannot ban this user.",
            });
        }
    }

    private async validateAction(
        guild: ChatMessageContext["guild"],
        executor: GuildMember,
        targetUser: GuildMember,
        action: "kick" | "ban" | "unban",
    ): Promise<void> {
        this.ensureActionIsValid(guild as Guild, executor, targetUser, action);

        if (action === "ban") {
            await this.ensureUserIsNotBanned(guild, targetUser);
        }

        if (action === "unban") {
            await this.ensureUserIsBanned(guild, targetUser);
        }
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

    public async ban(
        guild: ChatMessageContext["guild"],
        executor: GuildMember,
        targetUser: GuildMember,
        reason: string,
    ): Promise<boolean> {
        await this.validateAction(guild, executor, targetUser, "ban");

        const ban = await targetUser.ban({ reason });
        if (ban) return true;

        return false;
    }

    public async unban(guild: Guild, executor: GuildMember, targetUser: GuildMember, reason: string): Promise<boolean> {
        await this.validateAction(guild, executor, targetUser, "unban");

        const unban = await guild.bans.remove(targetUser.id, reason);
        if (unban) return true;

        return false;
    }
}
