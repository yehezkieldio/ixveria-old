import { Argument, type Result } from "@sapphire/framework";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";
import { IxveriaResolvers } from "#lib/extensions/resolvers";

export class NaturalDateArgument extends Argument<number> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "naturalDate" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<number> {
        const seconds: Result<number, string> = IxveriaResolvers.resolveNaturalDate(argument);

        if (seconds.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: "Invalid date provided.",
                identifier: IxveriaIdentifiers.CommandServiceError,
            });
        }

        if (seconds.unwrap() > 604800) {
            return this.error({
                context,
                parameter: argument,
                message: "You cannot clear messages older than 7 days.",
                identifier: IxveriaIdentifiers.CommandServiceError,
            });
        }

        return this.ok(seconds.unwrap());
    }
}
