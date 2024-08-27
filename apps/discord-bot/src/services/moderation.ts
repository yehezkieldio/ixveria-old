import { Service } from "@ixveria/stores/service";
import { UserError } from "@sapphire/framework";
import type { Collection, Guild, GuildBan, GuildMember } from "discord.js";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ChatMessageContext } from "#lib/typings/message-type";
import type { MakeOptional } from "#lib/typings/utility-type";

type Action = "kick" | "ban" | "unban";

export interface ModerationActionContext {
    executor: GuildMember;
    targetUser: GuildMember;
    targetUserId: string;
    reason: string;
    silent?: boolean;
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
     * Ensures the user is valid for the action, i.e. not the bot or the server owner.
     * @param guild The guild where the action is being performed.
     * @param userId The user id to check.
     * @param action The action being performed.
     * @returns Whether the user is valid.
     */
    private async ensureUserIsValid(guild: Guild, userId: string, action: Action): Promise<void> {
        if (userId === this.container.client.id) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `I cannot ${action} myself.`,
            });
        }

        if (userId === guild.ownerId) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} the server owner.`,
            });
        }
    }

    /**
     * Ensure if the executor has a higher role than the target user.
     * @param executor The user performing the action.
     * @param targetUser The user to perform the action on.
     * @param action The action being performed.
     * @returns Whether the executor has a higher role than the target user.
     */
    private async ensureRoleHierarchy(executor: GuildMember, targetUser: GuildMember, action: Omit<Action, "unban">) {
        if (targetUser.roles.highest.position >= executor.roles.highest.position) {
            throw new UserError({
                identifier: IxveriaIdentifiers.CommandServiceError,
                message: `You cannot ${action} a user with an equal or higher role than yours.`,
            });
        }
    }

    /**
     * Ensure if the action is valid, i.e. the user is kickable or bannable, or the user is not banned.
     * @param targetUser The user to perform the action on.
     * @param action The action being performed.
     * @returns Whether the action is valid.
     */
    private async ensureActionIsValid(targetUser: GuildMember, action: Action): Promise<void> {
        if (action === "kick") {
            if (!targetUser.kickable) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.CommandServiceError,
                    message: `I cannot ${action} this user.`,
                });
            }
            return;
        }

        if (action === "ban") {
            await this.ensureUserIsNotBanned(targetUser.guild, targetUser);
            if (!targetUser.bannable) {
                throw new UserError({
                    identifier: IxveriaIdentifiers.CommandServiceError,
                    message: "I cannot ban this user.",
                });
            }
            return;
        }

        if (action === "unban") {
            await this.ensureUserIsBanned(targetUser.guild, targetUser);
        }
    }

    /**
     * Perform a preflight check before performing an action.
     * @param guild The guild where the action is being performed.
     * @param context The context of the action, containing the executor, target user and reason.
     * @param action The action being performed.
     * @returns Whether the preflight check was successful.
     */
    private async preflightAction(
        guild: Guild,
        context: MakeOptional<ModerationActionContext, "targetUserId" | "targetUser">,
        action: Action,
    ): Promise<void> {
        if (context.targetUserId && action === "unban") {
            await this.ensureUserIsValid(guild, context.targetUserId, "unban");
        }

        if (context.targetUser) {
            await this.ensureUserIsValid(guild, context.targetUser.id, action);
            await this.ensureRoleHierarchy(context.executor, context.targetUser, action);
            await this.ensureActionIsValid(context.executor, action);
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
    public async kick(guild: Guild, context: Omit<ModerationActionContext, "targetUserId">): Promise<boolean> {
        await this.preflightAction(guild, context, "kick");

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
    public async ban(guild: Guild, context: Omit<ModerationActionContext, "targetUserId">): Promise<boolean> {
        await this.preflightAction(guild, context, "ban");

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
    public async unban(guild: Guild, context: Omit<ModerationActionContext, "targetUser">): Promise<boolean> {
        await this.preflightAction(guild, context, "unban");

        const unban = await guild.bans.remove(context.targetUserId, context.reason);
        if (unban) return true;

        return false;
    }
}
