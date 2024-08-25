import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";
import { SubcommandPluginIdentifiers } from "@sapphire/plugin-subcommands";

enum Identifiers {
    /* ------------------------------ PRECONDITIONS ----------------------------- */
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperUserOnly = "DeveloperUserOnly",
    ServerBlacklisted = "ServerBlacklisted",
    UserBlacklisted = "UserBlacklisted",

    /* ------------------------------ COMMAND ERROR ----------------------------- */
    InvalidArgumentProvided = "invalidArgumentProvided",
    CommandServiceError = "commandServiceError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...SubcommandPluginIdentifiers,
    ...Identifiers,
};
