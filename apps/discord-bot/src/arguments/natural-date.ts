import { Argument } from "@sapphire/framework";
import * as chrono from "chrono-node";
import dayjs from "dayjs";
import { IxveriaIdentifiers } from "#lib/extensions/constants/identifiers";

export class NaturalDateArgument extends Argument<number> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "naturalDate" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<number> {
        const parsed = chrono.parseDate(argument);
        const time = dayjs(parsed);
        const seconds = time.second();

        if (seconds > 604800) {
            return this.error({
                context,
                parameter: argument,
                message: "You cannot clear messages older than 7 days.",
                identifier: IxveriaIdentifiers.CommandServiceError,
            });
        }

        return this.ok(seconds);
    }
}
