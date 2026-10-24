import { adminOrNull } from "@/server/auth";
import { rawExport } from "@/server/admin-queries";

const cell = (v: unknown) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!(await adminOrNull())) return new Response("Forbidden", { status: 403 });
  const type = new URL(req.url).searchParams.get("type") ?? "";
  const rows = (await rawExport(type)) as Record<string, unknown>[] | null;
  if (!rows) return new Response("Unknown export", { status: 400 });
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="lesacdore-${type}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
