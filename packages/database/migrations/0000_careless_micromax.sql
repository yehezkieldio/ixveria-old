CREATE TABLE IF NOT EXISTS "guild" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL,
	"commands_disabled" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_discord_id_uidx" ON "guild" USING btree ("discord_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_discord_id_uidx" ON "user" USING btree ("discord_id");