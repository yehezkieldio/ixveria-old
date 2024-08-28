import { treaty } from "@elysiajs/eden";
import type { Aggregator } from "@ixveria/aggregator";
import { env } from "@ixveria/environment";

export const aggregator = treaty<Aggregator>(`${env.AGGREGATOR_HOST}:${env.AGGREGATOR_PORT}`);
