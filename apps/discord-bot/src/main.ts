import { env } from "@ixveria/environment";

import { configuration } from "#lib/configuration";
import { ImperiaClient } from "#lib/extensions/client";

// Load plugin(s) and register them.
import "@sapphire/plugin-logger/register";
import "@ixveria/stores/register";

/**
 * The main entrypoint for the bot.
 */
export async function main(): Promise<void> {
    const client = new ImperiaClient(configuration);
    await client.login(env.DISCORD_TOKEN);

    process.on("SIGINT", async (): Promise<void> => {
        await client.destroy().then((): never => {
            process.exit();
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
