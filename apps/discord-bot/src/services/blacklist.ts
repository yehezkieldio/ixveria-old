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
        const servers = await database
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
}
