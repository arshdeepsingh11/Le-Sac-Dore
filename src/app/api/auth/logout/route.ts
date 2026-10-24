import { destroySession } from "@/server/auth";
import { ok } from "@/server/http";

export async function POST() {
  await destroySession();
  return ok();
}
