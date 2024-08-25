import { env } from "@ixveria/environment";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    tablesFilter: ["imperia_*"],
    out: "./migrations",
} satisfies Config;
