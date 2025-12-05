// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { join } from "path";

export default {
  schema: "./lib/data/spells.schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: join(process.cwd(), "data", "spells.db"),
  },
} satisfies Config;

