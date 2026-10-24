import { NextResponse } from "next/server";

export const ok = (data: unknown = { ok: true }, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function body<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    const j = await req.json();
    return j && typeof j === "object" ? (j as T) : null;
  } catch {
    return null;
  }
}

export const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
