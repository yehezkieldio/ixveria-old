import { relations, sql } from "drizzle-orm";
import { type PgTableFn, pgEnum, pgTable, pgTableCreator, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const createTable: PgTableFn = pgTableCreator((name: string): string => `Ixveria_${name}`);

/* ---------------------------------- USER ---------------------------------- */

export const users = pgTable(
    "user",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        discordId: varchar("discord_id").notNull(),
    },
    (user) => ({
        discordIdUidx: uniqueIndex("user_discord_id_uidx").on(user.discordId),
    }),
);

/* ---------------------------------- GUILD --------------------------------- */

export const guilds = pgTable(
    "guild",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        discordId: varchar("discord_id").notNull(),
    },
    (guild) => ({
        discordIdUidx: uniqueIndex("guild_discord_id_uidx").on(guild.discordId),
    }),
);

export const guildsRelations = relations(guilds, ({ one }) => ({
    settings: one(guildSettings),
}));

export const guildSettings = pgTable(
    "guild_settings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        guildId: uuid("guild_id").references(() => guilds.id),
        disabledCommands: text("disabled_commands").array().notNull().default(sql`'{}'::text[]`),
    },
    (guildSettings) => ({
        guildIdUidx: uniqueIndex("guild_settings_guild_id_uidx").on(guildSettings.guildId),
    }),
);

export const guildSettingsRelations = relations(guildSettings, ({ one }) => ({
    guild: one(guilds, { fields: [guildSettings.guildId], references: [guilds.id] }),
}));

/* -------------------------------------------------------------------------- */

export const blacklistType = pgEnum("blacklist_entity_type", ["user", "guild"]);

export const blacklistEntity = pgTable(
    "blacklist_entity",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        entityId: varchar("entityId").notNull(),
        entityType: blacklistType("entityType").notNull(),
    },
    (blacklistEntity) => ({
        entityIdTypeUidx: uniqueIndex("blacklist_entity_entity_id_type_uidx").on(
            blacklistEntity.entityId,
            blacklistEntity.entityType,
        ),
    }),
);
