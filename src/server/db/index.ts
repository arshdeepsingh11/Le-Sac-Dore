import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { seedBaseline } from "./seed";

export type DB = ReturnType<typeof drizzlePg<typeof schema>>;

interface DBState {
  db: DB;
  ready: Promise<void>;
  mode: "postgres" | "local";
}

const g = globalThis as unknown as { __lsdDb?: DBState };

/**
 * Database connection.
 * - DATABASE_URL set → any Postgres (Neon, Supabase, RDS…). Use this in production.
 * - Not set → embedded Postgres (PGlite) stored in ./.data — zero-setup local development.
 */
function create(): DBState {
  const url = process.env.DATABASE_URL;
  if (url) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const postgres = require("postgres") as typeof import("postgres");
    const client = postgres(url, { max: 5, prepare: false, ssl: url.includes("localhost") ? false : "require" });
    const db = drizzlePg(client, { schema });
    const ready = (async () => {
      await client.unsafe(schema.SCHEMA_SQL).simple();
      await seedBaseline(db, "postgres");
    })();
    return { db, ready, mode: "postgres" };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleLite } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
  const dir = process.env.LOCAL_DB_DIR || "./.data/pglite";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("node:fs").mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzleLite(client, { schema }) as unknown as DB;
  const ready = (async () => {
    await client.exec(schema.SCHEMA_SQL);
    await seedBaseline(db, "local");
  })();
  return { db, ready, mode: "local" };
}

function state() {
  if (!g.__lsdDb) g.__lsdDb = create();
  return g.__lsdDb;
}

/** Returns the ready-to-use database (schema bootstrapped, baseline seeded). */
export async function getDb(): Promise<DB> {
  const s = state();
  try {
    await s.ready;
  } catch (e) {
    g.__lsdDb = undefined; // let the next request retry the connection
    throw e;
  }
  return s.db;
}

export const dbMode = () => state().mode;
export { schema };
