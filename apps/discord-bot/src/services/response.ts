import { Service } from "@ixveria/stores/service";
import type { UserError } from "@sapphire/framework";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";

export class ResponseService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "response",
        });
    }

    /**
     * Parses through the error and generates a response based on the error identifier.
     * @param error The error to generate a response for.
     * @returns The generated response.
     */
    public generateDeniedResponse(error: UserError): string {
        const { getChannelType, getMissingPermissions } = this.container.utilities.bot;

        /* -------------------------- GLOBAL PRECONDITIONS -------------------------- */

        if (error.identifier === IxveriaIdentifiers.UserBlacklisted) {
            return error.message;
        }

        if (error.identifier === IxveriaIdentifiers.ServerBlacklisted) {
            return error.message;
        }

        /* -------------------------- GENERAL PRECONDITIONS -------------------------- */

        if (error.identifier === IxveriaIdentifiers.InvalidArgumentProvided) {
            return error.message;
        }

        if (error.identifier === IxveriaIdentifiers.CommandDisabled) {
            return "This command is globally disabled! Please try again later...";
        }

        if (error.identifier === IxveriaIdentifiers.PreconditionCooldown) {
            return "This command is on cooldown! Please wait for the cooldown to expire...";
        }

        if (error.identifier === IxveriaIdentifiers.PreconditionRunIn) {
            return `This command is not available in this context! Please use this command in a ${getChannelType(error)}`;
        }

        /* ------------------------ PERMISSION PRECONDITIONS ------------------------ */

        if (
            error.identifier === IxveriaIdentifiers.PreconditionClientPermissions ||
            error.identifier === IxveriaIdentifiers.PreconditionClientPermissionsNoPermissions
        ) {
            return `I am missing required permissions to execute this command!\nRequired permission(s): ${getMissingPermissions(error)}`;
        }

        if (
            error.identifier === IxveriaIdentifiers.PreconditionUserPermissions ||
            error.identifier === IxveriaIdentifiers.PreconditionUserPermissionsNoPermissions
        ) {
            return `You are missing required permissions to execute this command!\nRequired permission(s): ${getMissingPermissions(error)}`;
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return "Unhandled error occurred while executing this command! Please contact a developer...";
    }
}
