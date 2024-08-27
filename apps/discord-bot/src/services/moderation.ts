import { Service } from "@ixveria/stores/service";
import { UserError } from "@sapphire/framework";
import type { Collection, Guild, GuildBan, GuildMember } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ChatMessageContext } from "#lib/typings/message-type";

interface ActionContext {
    executor: GuildMember;
    targetUser: GuildMember;
    reason: string;
}

export class ModerationService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "moderation",
        });
    }

    /**
     * Gets the bans in a guild.
     * @param guild The guild to fetch the bans from.
     * @returns The bans in the guild.
     */
    private async fetchBans(guild: ChatMessageContext["guild"]): Promise<Collection<string, GuildBan>> {
        if (!guild) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }
        return await guild.bans.fetch();
    }

    /**
     * Ensures the user is not banned.
     * @param guild The guild where the action is being performed.
     * @param targetUser The user to check.
     * @returns Whether the user is not banned.
     */
    private async ensureUserIsNotBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (bans.has(targetUser.id)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This user is already banned.",
            });
        }
    }

    /**
     * Ensures the user is banned.
     * @param guild The guild where the action is being performed.
     * @param targetUser The user to check.
     * @returns Whether the user is banned.
     */
    private async ensureUserIsBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (!bans.has(targetUser.id)) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: "This user is not banned.",
            });
        }
    }

    /**
     * Ensures the action to be performed is valid, by checking common conditions.
     * @param guild The guild where the action is being performed.
     * @param executor The user performing the action.
     * @param targetUser The user the action is being performed on.
     * @param action The action to be performed, either "kick", "ban" or "unban".
     * @throws UserError
     * @returns void
     */
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

    /**
     * Validates the action to be performed.
     * @param guild The guild where the action is being performed.
     * @param executor The user performing the action.
     * @param targetUser The user the action is being performed on.
     * @param action The action to be performed, either "kick", "ban" or "unban".
     * @returns Whether the action is valid.
     */
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

    /**
     * Performs a kick action on a user.
     * @param guild The guild where the action is being performed.
     * @param executor The user performing the action.
     * @param targetUser The user to kick.
     * @param reason The reason for the kick.
     * @returns Whether the kick was successful.
     */
    public async kick(guild: ChatMessageContext["guild"], context: ActionContext): Promise<boolean> {
        await this.validateAction(guild, context.executor, context.targetUser, "kick");

        const kick = await context.targetUser.kick(context.reason);
        if (kick) return true;

        return false;
    }

    /**
     * Performs a ban action on a user.
     * @param guild The guild where the action is being performed.
     * @param context The context of the action, containing the executor, target user and reason.
     * @returns Whether the ban was successful.
     */
    public async ban(guild: ChatMessageContext["guild"], context: ActionContext): Promise<boolean> {
        await this.validateAction(guild, context.executor, context.targetUser, "ban");

        const ban = await context.targetUser.ban({ reason: context.reason });
        if (ban) return true;

        return false;
    }

    /**
     * Performs an unban action on a user.
     * @param guild The guild where the action is being performed.
     * @param context The context of the action, containing the executor, target user and reason.
     * @returns Whether the unban was successful.
     */
    public async unban(guild: Guild, context: ActionContext): Promise<boolean> {
        await this.validateAction(guild, context.executor, context.targetUser, "unban");

        const unban = await guild.bans.remove(context.targetUser.id, context.reason);
        if (unban) return true;

        return false;
    }
}
