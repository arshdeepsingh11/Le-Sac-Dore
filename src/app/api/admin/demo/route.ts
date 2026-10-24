import { getDb } from "@/server/db";
import { adminOrNull } from "@/server/auth";
import { clearDemo, seedDemo } from "@/server/db/seed";
import { body, fail, ok } from "@/server/http";

/** Load or clear clearly-marked demo data (is_demo = true). Real data is never touched. */
export async function POST(req: Request) {
  if (!(await adminOrNull())) return fail("Forbidden", 403);
  const action = (await body(req))?.action;
  const db = await getDb();
  if (action === "load") await seedDemo(db);
  else if (action === "clear") await clearDemo(db);
  else return fail("Unknown action.");
  return ok();
}
