"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { byId, COLORS, COUNTRIES, fmt, groundFor, PROVINCES, type ColorName } from "@/lib/data";
import { postJSON, useAuth } from "@/lib/auth-store";
import { useShop, useUI, type Prefs } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

export type AccountTab = "orders" | "bags" | "appointments" | "wish" | "info" | "prefs";
const TABS: [AccountTab, string][] = [
  ["orders", "ORDERS"],
  ["bags", "MY BAGS"],
  ["appointments", "APPOINTMENTS"],
  ["wish", "WISHLIST"],
  ["info", "PERSONAL DETAILS"],
  ["prefs", "PREFERENCES"],
];
const TRACK = ["RECEIVED", "PREPARED", "SHIPPED", "DELIVERED"];
const PREFS: [keyof Prefs, string, string][] = [
  ["arrivals", "New arrivals", "Be told when a new piece is released."],
  ["appts", "Private appointment invitations", "Previews at your nearest boutique."],
  ["sms", "SMS order updates", "Delivery notifications by text message."],
];

export function SideNav<T extends string>({ tabs, active, onSelect, id, children }: { tabs: [T, string][]; active: T; onSelect: (k: T) => void; id: string; children?: ReactNode }) {
  return (
    <LayoutGroup id={id}>
      <nav aria-label={id} className="no-scrollbar -mx-[clamp(20px,4vw,56px)] flex flex-row gap-x-6 overflow-x-auto px-[clamp(20px,4vw,56px)] wide:mx-0 wide:flex-col wide:gap-y-1 wide:overflow-visible wide:px-0">
        {tabs.map(([k, label]) => {
          const on = k === active;
          return (
            <button key={k} onClick={() => onSelect(k)} aria-current={on ? "page" : undefined} className="relative shrink-0 py-2.5 text-left text-[11px] font-medium tracking-[.22em] whitespace-nowrap transition-colors duration-300" style={{ color: on ? "#111111" : "#857B70" }}>
              {on && <motion.span layoutId={`${id}-dot`} className="absolute top-1/2 -left-4 hidden size-1 -translate-y-1/2 rounded-full bg-gold wide:block" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              {on && <motion.span layoutId={`${id}-rule`} className="absolute inset-x-0 bottom-0 h-px bg-ink wide:hidden" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              {label}
            </button>
          );
        })}
        {children}
      </nav>
    </LayoutGroup>
  );
}

function Empty({ text, cta, href }: { text: string; cta?: string; href?: string }) {
  return (
    <div className="bg-ivory p-8">
      <p className="m-0 font-serif text-2xl text-espresso">{text}</p>
      {cta && href && (
        <Link href={href} className="link-rule mt-6">
          {cta}
        </Link>
      )}
    </div>
  );
}

function Thumb({ pid, color }: { pid: string; color: string }) {
  const c = (byId(pid).colors.includes(color as ColorName) ? color : byId(pid).colors[0]) as ColorName;
  return (
    <span className="relative block aspect-[4/5] w-16 shrink-0 overflow-hidden bg-parch">
      <BagShot tone={COLORS[c]} ground={groundFor(c)} size={62} />
    </span>
  );
}

function SignedOut() {
  return (
    <section className="gutter mx-auto max-w-[1100px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <p className="eyebrow mb-4">YOUR ACCOUNT</p>
      <h1 className="display text-[clamp(46px,5vw,80px)] leading-[1.02]">Your private client area.</h1>
      <p className="mt-6 max-w-[520px] text-[15px] leading-[1.8] text-body">Track your orders, register your bags to their Digital Passports, keep your wishlist on every device and book private appointments.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/login?next=/account" className="btn-ink">SIGN IN</Link>
        <Link href="/signup?next=/account" className="btn-line">CREATE AN ACCOUNT</Link>
      </div>
    </section>
  );
}

export function AccountView({ initial }: { initial: AccountTab }) {
  const router = useRouter();
  const { user, loaded, orders, reservations, passports, refresh, signOut } = useAuth();
  const [tab, setTabState] = useState<AccountTab>(initial);
  const flash = useUI((s) => s.flash);
  const wish = useShop((s) => s.wish);
  const prefs = useShop((s) => s.prefs);
  const togglePref = useShop((s) => s.togglePref);
  const setTab = (k: AccountTab) => {
    setTabState(k);
    window.history.replaceState(null, "", `/account?tab=${k}`);
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!loaded) return <section className="min-h-screen" />;
  if (!user) return <SignedOut />;

  return (
    <section className="gutter mx-auto max-w-[1400px] pt-[clamp(120px,18vh,180px)] pb-[120px]">
      <p className="eyebrow mb-4">YOUR ACCOUNT</p>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4 wide:mb-16">
        <h1 className="display text-[clamp(42px,5vw,80px)] leading-none">Bonjour, {user.name.split(" ")[0]}.</h1>
        {user.role === "admin" && (
          <Link href="/admin" className="btn-line !px-6 !py-3.5 !text-[10px]">
            OPEN ADMIN DASHBOARD →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 items-start gap-[clamp(28px,6vw,96px)] wide:grid-cols-[220px_minmax(0,1fr)]">
        <SideNav id="Account" tabs={TABS} active={tab} onSelect={setTab}>
          <button
            onClick={async () => {
              await signOut();
              flash("YOU HAVE BEEN SIGNED OUT");
              router.push("/");
            }}
            className="shrink-0 py-2.5 text-left text-[11px] tracking-[.22em] whitespace-nowrap text-taupe wide:mt-2"
          >
            SIGN OUT
          </button>
        </SideNav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: EASE_LUX }}>
            {tab === "orders" && (
              <div className="flex flex-col gap-5">
                {!orders.length && <Empty text="No orders yet." cta="DISCOVER LA COLLECTION →" href="/collection" />}
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-col gap-6 bg-ivory p-6 wide:p-8">
                    <div className="flex flex-wrap justify-between gap-3 text-[13px]">
                      <span>
                        <span className="font-serif text-2xl tracking-[.04em]">{o.number}</span>
                        <span className="ml-3.5 text-taupe">{new Date(o.createdAt).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </span>
                      <span>{fmt(o.total)}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {o.items.map((i, k) => (
                        <div key={k} className="flex items-center gap-4 text-[13px]">
                          <Thumb pid={i.productId} color={i.color} />
                          <span className="flex-1">
                            <span className="block font-serif text-lg tracking-[.06em]">{i.name}</span>
                            <span className="text-taupe">
                              {i.color} × {i.qty}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-x-0 top-[5px] h-px bg-ink/15" />
                      <motion.div className="absolute top-[5px] left-0 h-px bg-gold" initial={{ width: 0 }} animate={{ width: `${(o.status / 3) * 100}%` }} transition={{ duration: 1.2, delay: 0.2, ease: EASE_LUX }} />
                      <div className="relative grid grid-cols-4">
                        {TRACK.map((l, i) => (
                          <div key={l} className="flex flex-col gap-3">
                            <span className="box-border size-[11px] rounded-full border" style={{ background: i <= o.status ? "#C6A66A" : "#FCFBF8", borderColor: i <= o.status ? "#C6A66A" : "rgba(17,17,17,.25)" }} />
                            <span className="text-[9px] tracking-[.14em] wide:text-[10px] wide:tracking-[.18em]" style={{ color: i === o.status ? "#111111" : "#857B70" }}>
                              {l}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {o.passports.length > 0 && (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-4 text-[10px] tracking-[.2em]">
                        {o.passports.map((sn) => (
                          <Link key={sn} href={`/passport/${sn}`} className="border-b border-ink pb-0.5">
                            PASSPORT {sn} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "bags" && <MyBags passports={passports} onDone={refresh} />}

            {tab === "appointments" && (
              <div className="flex flex-col gap-4">
                {!reservations.length && <Empty text="No appointments yet." cta="RESERVE A PIECE →" href="/collection" />}
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center gap-5 bg-ivory p-5 wide:p-6">
                    <Thumb pid={r.productId} color={r.color} />
                    <div className="flex flex-1 flex-col gap-1 text-[13px]">
                      <span className="font-serif text-xl tracking-[.06em]">{byId(r.productId).name}</span>
                      <span className="text-body">
                        {r.kind === "video" ? "Video appointment" : r.boutique} · {new Date(r.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" })} · {r.slot}
                      </span>
                      <span className="text-xs text-taupe">Held for you until {new Date(r.holdUntil).toLocaleString("en-CA", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <span className="text-[10px] tracking-[.2em] uppercase" style={{ color: r.status === "confirmed" ? "#424A38" : r.status === "cancelled" ? "#541F27" : "#857B70" }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "wish" && (
              <>
                <p className="mb-6 font-serif text-[26px]">
                  {wish.length} {wish.length === 1 ? "piece saved." : "pieces saved."}
                </p>
                <Link href="/wishlist" className="btn-ink">
                  VIEW WISHLIST
                </Link>
              </>
            )}

            {tab === "info" && <Details />}

            {tab === "prefs" && (
              <div className="flex flex-col">
                <Toggle
                  label="Le Sac Doré newsletter"
                  sub="Collections and stories from the maison, monthly."
                  on={user.marketing}
                  onChange={async () => {
                    await postJSON("/api/me", { marketing: !user.marketing }, "PATCH");
                    refresh();
                  }}
                />
                {PREFS.map(([k, label, sub]) => (
                  <Toggle key={k} label={label} sub={sub} on={!!prefs[k]} onChange={() => togglePref(k)} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Toggle({ label, sub, on, onChange }: { label: string; sub: string; on: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 border-t border-ink/12 py-[22px] text-sm">
      <span>
        {label}
        <span className="mt-1 block text-xs text-taupe">{sub}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" checked={on} onChange={onChange} className="peer sr-only" />
        <span className="h-[26px] w-[44px] rounded-full bg-ink/15 transition-colors duration-300 peer-checked:bg-espresso peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
        <span className="absolute top-[3px] left-[3px] size-5 rounded-full bg-ivory shadow-[0_2px_6px_rgba(0,0,0,.2)] transition-transform duration-300 ease-lux peer-checked:translate-x-[18px]" />
      </span>
    </label>
  );
}

function MyBags({ passports, onDone }: { passports: { serial: string; productId: string; color: string }[]; onDone: () => void }) {
  const [serial, setSerial] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const register = async (e: FormEvent) => {
    e.preventDefault();
    const { ok, data } = await postJSON<{ serial?: string }>("/api/passports/register", { serial });
    setMsg(ok ? { ok: true, text: `${data.serial} is now registered to you. Your two-year warranty is active.` } : { ok: false, text: data.error ?? "Could not register." });
    if (ok) {
      setSerial("");
      onDone();
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
        {!passports.length && <Empty text="No bags registered yet." />}
        {passports.map((p) => {
          const c = p.color as ColorName;
          return (
            <Link key={p.serial} href={`/passport/${p.serial}`} className="group flex items-center gap-4 bg-ivory p-4 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgba(17,12,9,.35)]">
              <span className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden bg-parch">
                <BagShot tone={COLORS[c] ?? "#3B2519"} ground={groundFor(c)} size={62} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-serif text-xl tracking-[.06em]">{byId(p.productId).name}</span>
                <span className="text-xs text-taupe">{p.color}</span>
                <span className="mt-2 text-[10px] tracking-[.2em]">{p.serial} →</span>
              </span>
            </Link>
          );
        })}
      </div>
      <form onSubmit={register} className="bg-ivory p-6 wide:p-8">
        <p className="m-0 mb-1 text-[11px] font-semibold tracking-[.24em]">REGISTER A BAG</p>
        <p className="m-0 mb-5 text-[13px] text-body">Enter the serial printed on your authentication card to link the bag&apos;s Digital Passport to your account.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} placeholder="LSD-SIG-123456" className="field font-mono tracking-wider" aria-label="Serial number" />
          <button type="submit" className="btn-ink shrink-0 !px-6 !py-3.5 !text-[10px]">REGISTER</button>
        </div>
        {msg && <p className="mt-4 mb-0 text-[13px]" style={{ color: msg.ok ? "#424A38" : "#541F27" }}>{msg.text}</p>}
      </form>
    </div>
  );
}

function Details() {
  const { user, refresh } = useAuth();
  const flash = useUI((s) => s.flash);
  const [f, setF] = useState(() => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address?.address ?? "",
    city: user?.address?.city ?? "",
    province: user?.address?.province ?? "Ontario",
    postal: user?.address?.postal ?? "",
    country: user?.address?.country ?? "Canada",
  }));
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { ok, data } = await postJSON("/api/me", { name: f.name, phone: f.phone, address: { address: f.address, city: f.city, province: f.province, postal: f.postal, country: f.country } }, "PATCH");
    setBusy(false);
    flash(ok ? "DETAILS SAVED" : (data.error ?? "COULD NOT SAVE").toUpperCase());
    if (ok) refresh();
  };
  const field = (k: keyof typeof f, label: string, half = true, extra: Record<string, string> = {}) => (
    <div className={half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
      <label htmlFor={`d-${k}`} className="label">{label}</label>
      <input id={`d-${k}`} value={f[k]} onChange={set(k)} className="field" {...extra} />
    </div>
  );
  return (
    <form onSubmit={save} className="grid grid-cols-2 gap-x-6 gap-y-6">
      {field("name", "FULL NAME", true, { autoComplete: "name" })}
      <div className="col-span-2 sm:col-span-1">
        <span className="label">EMAIL</span>
        <p className="m-0 border-b border-ink/10 py-3 text-[15px] text-taupe">{user?.email}</p>
      </div>
      {field("phone", "PHONE", true, { autoComplete: "tel", inputMode: "tel" })}
      <div className="col-span-2 sm:col-span-1">
        <span className="label">CLIENT SINCE</span>
        <p className="m-0 border-b border-ink/10 py-3 text-[15px] text-taupe">{user ? new Date(user.createdAt).toLocaleDateString("en-CA", { month: "long", year: "numeric" }) : ""}</p>
      </div>
      {field("address", "ADDRESS", false, { autoComplete: "address-line1" })}
      {field("city", "CITY", true, { autoComplete: "address-level2" })}
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="d-prov" className="label">PROVINCE</label>
        <select id="d-prov" value={f.province} onChange={set("province")} className="field">
          {PROVINCES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      {field("postal", "POSTAL CODE", true, { autoComplete: "postal-code" })}
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="d-country" className="label">COUNTRY</label>
        <select id="d-country" value={f.country} onChange={set("country")} className="field">
          {COUNTRIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="col-span-2 mt-2">
        <button type="submit" disabled={busy} className="btn-ink">{busy ? "SAVING…" : "SAVE DETAILS"}</button>
      </div>
    </form>
  );
}
