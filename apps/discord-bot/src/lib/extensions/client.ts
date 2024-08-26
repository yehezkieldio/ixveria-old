import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import type { ClientOptions } from "discord.js";

export interface IxveriaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

export class IxveriaClient extends SapphireClient {
    public constructor(options: IxveriaClientOptions) {
        super(options);

        container.logger.info(`IxveriaClient: Running on a ${Bun.env.NODE_ENV} environment.`);

        if (options.overrideApplicationCommandsRegistries === true) {
            container.logger.info(
                "IxveriaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override async login(token: string): Promise<string> {
        container.logger.info("IxveriaClient: Logging in...");
        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        return super.destroy();
    }
}
