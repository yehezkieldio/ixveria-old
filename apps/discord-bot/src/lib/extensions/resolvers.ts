import { Resolvers as SapphireResolvers } from "@sapphire/framework";
import { resolveNaturalDate as IresolveNaturalDate } from "#lib/resolvers/natural-date";

export namespace Resolvers {
    export const resolveNaturalDate = IresolveNaturalDate;
}

type CombinedResolvers = typeof SapphireResolvers & typeof Resolvers;

export const IxveriaResolvers: CombinedResolvers = {
    ...SapphireResolvers,
    ...Resolvers,
};
