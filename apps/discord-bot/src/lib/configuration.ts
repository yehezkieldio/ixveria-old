import { env } from "@ixveria/environment";
import { LogLevel } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import type { IxveriaClientOptions } from "#lib/extensions/client";

export const DEVELOPERS: string[] = ["327849142774923266"];
export const DEVELOPMENT_SERVERS: string[] = ["1209737959587450980"];

export const configuration: IxveriaClientOptions = {
    allowedMentions: {
        parse: [],
        users: [],
        roles: [],
        repliedUser: true,
    },
    defaultCooldown: {
        delay: Time.Second * 2,
        filteredUsers: DEVELOPERS,
    },
    defaultPrefix: "ixy ",
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    loadApplicationCommandRegistriesStatusListeners: env.NODE_ENV === "development",
    loadDefaultErrorListeners: env.NODE_ENV === "development",
    loadMessageCommandListeners: true,
    logger: {
        level: env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
    },
    overrideApplicationCommandsRegistries: env.NODE_ENV === "development",
    partials: [Partials.Message, Partials.User, Partials.GuildMember],
    presence: {
        activities: [
            {
                type: ActivityType.Listening,
                name: "reality, the manifested. ✨",
            },
        ],
        status: "dnd",
    },
    typing: true,
};
