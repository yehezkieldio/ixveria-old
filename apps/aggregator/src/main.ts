import { swagger } from "@elysiajs/swagger";
import { env } from "@ixveria/environment";
import { Elysia } from "elysia";
import mediaModule from "./random/media";

const api = new Elysia();

api.use(
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
);
api.use(mediaModule);

api.listen(env.AGGREGATOR_PORT, () => {
    console.log(`Aggregator listening on port ${env.AGGREGATOR_PORT}`);
});
