import { env } from "@ixveria/environment";
import { Elysia } from "elysia";

const api = new Elysia();

api.get("/", (): string => "Hello Elysia");

api.listen(env.AGGREGATOR_PORT, () => {
    console.log(`Aggregator listening on port ${env.AGGREGATOR_PORT}`);
});
