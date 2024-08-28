import { database, equal } from "@ixveria/database";
import { blacklistEntities } from "@ixveria/database/schema";
import { Service } from "@ixveria/stores/service";
import { UserError } from "@sapphire/framework";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";

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
     * Get all blacklisted entities.
     * @returns All blacklisted entities.
     */
    public async getAll(): Promise<SelectBlacklistedEntities[]> {
        return await database.select().from(blacklistEntities);
    }

    /**
     * Get all blacklisted servers.
     * @returns All blacklisted servers.
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
     * Get all blacklisted users.
     * @returns All blacklisted users.
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
     * Get a blacklist entity by ID.
     * @param entityId The entity ID to get.
     * @returns The blacklist entity, if found.
     */
    public async getById(entityId: string): Promise<SelectBlacklistedEntities | undefined> {
        const entity: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId));

        if (!entity) return undefined;
        return entity[0];
    }

    /**
     * Ensure the user is blacklisted.
     * @param userId The user ID to check.
     * @returns Whether the user is blacklisted.
     */
    public async isUserBlacklisted(userId: string): Promise<boolean> {
        const user: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, userId));

        return !!user;
    }

    /**
     * Ensure the server is blacklisted.
     * @param guildId The guild ID to check.
     * @returns Whether the server is blacklisted.
     */
    public async isServerBlacklisted(guildId: string): Promise<boolean> {
        const server: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, guildId));

        return !!server;
    }

    /**
     * Create a new blacklist entity.
     * @param newEntity The entity to create.
     */
    public async create(newEntity: BlacklistEntities): Promise<void> {
        const entity: SelectBlacklistedEntities[] = await database.insert(blacklistEntities).values(newEntity);

        if (!entity) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ServiceError,
                message: "Failed to create a blacklist entity.",
            });
        }
    }

    /**
     * Remove a blacklist entity.
     * @param entityId The entity ID to remove.
     */
    public async remove(entityId: string): Promise<void> {
        const entity: SelectBlacklistedEntities[] = await database
            .delete(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId));

        if (!entity) {
            throw new UserError({
                identifier: IxveriaIdentifiers.ServiceError,
                message: "Failed to remove a blacklist entity.",
            });
        }
    }
}
