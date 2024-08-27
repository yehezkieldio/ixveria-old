DO $$ BEGIN
 CREATE TYPE "public"."blacklist_entity_type" AS ENUM('user', 'guild');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blacklist_entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityId" varchar NOT NULL,
	"entityType" "blacklist_entity_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guild_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guild_id" uuid,
	"disabled_commands" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guild" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_settings" ADD CONSTRAINT "guild_settings_guild_id_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blacklist_entity_entity_id_type_uidx" ON "blacklist_entity" USING btree ("entityId","entityType");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_settings_guild_id_uidx" ON "guild_settings" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_discord_id_uidx" ON "guild" USING btree ("discord_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_discord_id_uidx" ON "user" USING btree ("discord_id");