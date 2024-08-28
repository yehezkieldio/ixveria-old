import swagger from "@elysiajs/swagger";

import { env } from "@ixveria/environment";
import { getVersion } from "@ixveria/utils/package-json";

import Elysia from "elysia";
import type { OpenAPIV3 } from "openapi-types";
import mediaModule from "#random/media";
import { logger } from "./logger";

const documentation: Partial<OpenAPIV3.Document> = {
    info: {
        title: "Ixveria Aggregator",
        version: await getVersion(),
        description: "An aggregator service that aggregates various APIs into a unified endpoints.",
    },
    tags: [
        {
            name: "Media",
            description: "Endpoints that aggregate random media, such as random cat images.",
        },
    ],
};

/* -------------------------------------------------------------------------- */

const aggregator = new Elysia()
    .use(
        swagger({
            documentation,
        }),
    )
    .use(mediaModule);

/* -------------------------------------------------------------------------- */

logger.info("AggregatorMain: Starting the Aggregator service...");

aggregator.listen({
    development: env.NODE_ENV === "development",
    port: env.AGGREGATOR_PORT,
    hostname: env.AGGREGATOR_HOST,
});

logger.info(
    `AggregatorMain: The Aggregator service has started on ${aggregator.server!.hostname}:${aggregator.server!.port}`,
);

export type Aggregator = typeof aggregator;
