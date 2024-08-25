import { sql } from "drizzle-orm";
import { type PgTableFn, pgTable, pgTableCreator, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const createTable: PgTableFn = pgTableCreator((name: string): string => `imperia_${name}`);

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
        commandsDisabled: text("commands_disabled").array().notNull().default(sql`'{}'::text[]`),
    },
    (guild) => ({
        discordIdUidx: uniqueIndex("guild_discord_id_uidx").on(guild.discordId),
    }),
);
