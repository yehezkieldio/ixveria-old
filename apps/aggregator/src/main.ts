import swagger from "@elysiajs/swagger";
import { env } from "@ixveria/environment";
import Elysia from "elysia";
import mediaModule from "#random/media";

const aggregator = new Elysia()
    .use(
        swagger({
            documentation: {
                info: {
                    title: "Ixveria Aggregator",
                    version: "0.0.0",
                    description: "An aggregator for various APIs by providing a unified endpoint.",
                },
                tags: [
                    {
                        name: "Media",
                        description: "Endpoints that aggregate random media, such as random cat images.",
                    },
                ],
            },
        }),
    )
    .use(mediaModule)
    .listen({
        development: env.NODE_ENV === "development",
        port: env.AGGREGATOR_PORT,
        hostname: env.AGGREGATOR_HOST,
    });

export type Aggregator = typeof aggregator;
