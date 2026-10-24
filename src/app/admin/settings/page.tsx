import { DemoControls } from "@/components/admin/client";
import { ExportLink, PageHead, Panel } from "@/components/admin/ui";
import { dbMode } from "@/server/db";

export default function SettingsPage() {
  const mode = dbMode();
  return (
    <>
      <PageHead title="Settings" sub="Data, exports and environment." />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel title="DATABASE">
          <p className="m-0 text-[14px]">{mode === "local" ? "Local embedded Postgres (PGlite) in ./.data" : "Postgres via DATABASE_URL"}</p>
          <p className="mt-2 mb-0 text-[13px] leading-relaxed text-taupe">
            {mode === "local" ? "Great for development. Before launch, create a free Postgres on Neon or Supabase and set DATABASE_URL — tables are created automatically on first start." : "Connected. Tables are created and kept up to date automatically."}
          </p>
        </Panel>
        <Panel title="DEMO DATA">
          <p className="mt-0 mb-4 text-[13px] leading-relaxed text-taupe">Load realistic sample customers, visits, orders and appointments to explore the dashboard. Demo records are flagged and can be removed in one click — real data is never touched.</p>
          <DemoControls />
        </Panel>
        <Panel title="EXPORTS (CSV)">
          <div className="flex flex-wrap gap-2">
            {["customers", "orders", "reservations", "subscribers", "interest", "events"].map((t) => (
              <ExportLink key={t} type={t} label={t.toUpperCase()} />
            ))}
          </div>
        </Panel>
        <Panel title="PRIVACY">
          <p className="m-0 text-[13px] leading-relaxed text-taupe">Browsing is recorded only for visitors who choose “Accept all” in the cookie banner. Admin browsing is never recorded. Card numbers are never stored.</p>
        </Panel>
      </div>
    </>
  );
}
