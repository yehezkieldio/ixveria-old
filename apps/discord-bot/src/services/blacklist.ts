import { database, equal } from "@ixveria/database";
import { blacklistEntities } from "@ixveria/database/schema";
import { Service } from "@ixveria/stores/service";

type SelectBlacklistedEntities = typeof blacklistEntities.$inferSelect;

export type BlacklistEntities = Omit<SelectBlacklistedEntities, "id">;

export class BlacklistService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    /**
     * Gets all the blacklisted servers.
     * @returns The blacklisted servers.
     */
    public async getServers(): Promise<SelectBlacklistedEntities[]> {
        const servers: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "guild"));

        if (!servers) return [];
        return servers;
    }

    /**
     * Gets all the blacklisted users.
     * @returns The blacklisted users.
     */
    public async getUsers(): Promise<SelectBlacklistedEntities[]> {
        const users: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "user"));

        if (!users) return [];
        return users;
    }

    /**
     * Ensures the user is blacklisted.
     * @param userId The user to check.
     * @returns Whether the user is blacklisted.
     */
    public async ensureUserIsBlacklisted(userId: string): Promise<boolean> {
        const user: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, userId));

        return !!user;
    }

    /**
     * Ensures the server is blacklisted.
     * @param guildId The server to check.
     * @returns Whether the server is blacklisted.
     */
    public async ensureServerIsBlacklisted(guildId: string): Promise<boolean> {
        const server: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, guildId));

        return !!server;
    }

    /**
     * Creates a blacklist entity.
     * @param entityId The entity to blacklist.
     * @param entityType The type of entity to blacklist, either "user" or "guild".
     * @returns Whether the entity was blacklisted.
     */
    public async createBlacklist(entityId: string, entityType: "user" | "guild"): Promise<boolean> {
        const entity = await database
            .insert(blacklistEntities)
            .values({
                entityId,
                entityType,
            })
            .returning();

        if (!entity) return false;
        return true;
    }

    /**
     * Deletes a blacklist entity.
     * @param entityId The entity to remove from the blacklist.
     * @returns Whether the entity was removed from the blacklist.
     */
    public async removeBlacklist(entityId: string): Promise<boolean> {
        const entity = await database
            .delete(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId))
            .returning();

        if (!entity) return false;
        return true;
    }
}
