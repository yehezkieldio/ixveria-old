import { database, equal } from "@ixveria/database";
import { blacklistEntities } from "@ixveria/database/schema";
import { Service } from "@ixveria/stores/service";

type SelectBlacklistedEntities = typeof blacklistEntities.$inferSelect;

export class BlacklistService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    public async getServers(): Promise<SelectBlacklistedEntities[]> {
        const servers: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "guild"));

        if (!servers) return [];
        return servers;
    }

    public async getUsers(): Promise<SelectBlacklistedEntities[]> {
        const users: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "user"));

        if (!users) return [];
        return users;
    }

    public async ensureUserIsBlacklisted(userId: string): Promise<boolean> {
        const user: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, userId));

        return !!user;
    }

    public async ensureServerIsBlacklisted(guildId: string): Promise<boolean> {
        const server: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, guildId));

        return !!server;
    }

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

    public async removeBlacklist(entityId: string): Promise<boolean> {
        const entity = await database
            .delete(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId))
            .returning();

        if (!entity) return false;
        return true;
    }
}
