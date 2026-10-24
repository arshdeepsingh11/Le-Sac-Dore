"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";
import { BagShot } from "./bag-shot";
import { productHref } from "./product-card";
import { MorphingText } from "./ui/morphing-text";
import { COLORS, fmt, findProduct, groundFor } from "@/lib/data";
import { addToBag, cartRows, useShop, useUI } from "@/lib/store";
import { cn, EASE_LUX } from "@/lib/utils";

/* ───────────────────────── Conversation state (survives navigation) ───────────────────────── */

interface Msg {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Msg[];
  streaming: boolean;
  set: (fn: (s: ChatState) => Partial<ChatState>) => void;
}

const useChat = create<ChatState>()((set) => ({ messages: [], streaming: false, set: (fn) => set(fn) }));
let nextId = 1;

const PROMPTS = ["Which bag fits a 13\" laptop?", "Something for evening", "A gift under $800", "How do I care for suede?", "What's new this season?"];
const MORPH = ["Le Signature", "La Luna", "Le Noir", "Le Voyage", "La Dune", "L'Éclat"];

/* ───────────────────────── Message rendering ───────────────────────── */

const TOKEN = /\[\[([a-z0-9-]+)\]\]/g;

function ProductChip({ id }: { id: string }) {
  const p = findProduct(id);
  const set = useUI((s) => s.set);
  if (!p) return null;
  const c = p.colors[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_LUX }}
      className="my-2 grid grid-cols-[64px_minmax(0,1fr)] gap-3.5 border border-ink/10 bg-ivory p-2.5 not-prose"
    >
      <Link href={productHref(p.id, c)} onClick={() => set({ concierge: false })} className="relative aspect-[4/5] overflow-hidden bg-parch">
        <BagShot tone={COLORS[c]} ground={groundFor(c)} texture={p.texture ?? "grain"} size={62} />
      </Link>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <span className="truncate font-serif text-[17px] tracking-[.06em]">{p.name}</span>
        <span className="text-[11px] text-taupe">
          {p.material} · {fmt(p.price)}
        </span>
        <div className="mt-1 flex gap-4 text-[10px] font-medium tracking-[.2em]">
          <Link href={productHref(p.id, c)} onClick={() => set({ concierge: false })} className="border-b border-ink pb-0.5">
            VIEW
          </Link>
          <button onClick={() => addToBag(p.id, c, 1, false)} className="border-b border-ink/30 pb-0.5 transition-colors hover:border-ink">
            ADD TO BAG
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AssistantText({ text }: { text: string }) {
  // Hide a token that is still streaming in (e.g. "[[le-sig").
  const safe = text.replace(/\[\[[a-z0-9-]*\]?$/, "");
  const parts: (string | { id: string })[] = [];
  let last = 0;
  for (const m of safe.matchAll(TOKEN)) {
    if (m.index! > last) parts.push(safe.slice(last, m.index));
    parts.push({ id: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < safe.length) parts.push(safe.slice(last));
  return (
    <div className="text-[14px] leading-[1.7] text-body">
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>
            {p
              .split(/\n{2,}/)
              .map((para, j) => para.trim() && <p key={j} className="my-1.5 whitespace-pre-line">{para.replace(/\*\*(.+?)\*\*/g, "$1").trim()}</p>)}
          </Fragment>
        ) : (
          <ProductChip key={i} id={p.id} />
        ),
      )}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-1.5 py-2" aria-label="Le Concierge is writing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-gold"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── Floating AI button ───────────────────────── */

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2.5c.4 4.6 2.4 7.5 7.6 8.3l1.9.2-1.9.3c-5.2.8-7.2 3.7-7.6 8.2-.4-4.5-2.4-7.4-7.6-8.2L2.5 11l1.9-.2c5.2-.8 7.2-3.7 7.6-8.3Z" />
      <path d="M19 2c.2 1.6.8 2.4 2.4 2.7-1.6.3-2.2 1.1-2.4 2.7-.2-1.6-.8-2.4-2.4-2.7C18.2 4.4 18.8 3.6 19 2Z" opacity=".7" />
    </svg>
  );
}

/* ───────────────────────── Panel ───────────────────────── */

export function Concierge() {
  const open = useUI((s) => s.concierge);
  const hidden = useUI((s) => s.drawer || s.search || s.menu);
  const setUI = useUI((s) => s.set);
  const { messages, streaming, set } = useChat();
  const cart = useShop((s) => s.cart);
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => field.current?.focus(), 350);
    else abort.current?.abort();
  }, [open]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (pathname.startsWith("/checkout")) return null;

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    const user: Msg = { id: nextId++, role: "user", content };
    const reply: Msg = { id: nextId++, role: "assistant", content: "" };
    const history = [...useChat.getState().messages, user];
    set(() => ({ messages: [...history, reply], streaming: true }));

    const viewing = pathname.startsWith("/product/") ? findProduct(pathname.split("/")[2])?.name : undefined;
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          context: { path: pathname, viewing, bag: cartRows(cart).map((c) => ({ name: c.name, color: c.color, qty: c.qty })) },
        }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        set((s) => ({ messages: s.messages.map((m) => (m.id === reply.id ? { ...m, content: m.content + chunk } : m)) }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === reply.id ? { ...m, content: m.content || "I am sorry — I could not reach the maison just now. Please try again, or call Client Services on +1 416 555 0100." } : m,
          ),
        }));
      }
    } finally {
      set(() => ({ streaming: false }));
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const empty = messages.length === 0;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && !hidden && (
          <motion.button
            key="launcher"
            onClick={() => setUI({ concierge: true })}
            aria-label="Ask Le Concierge, our AI client advisor"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group fixed right-5 bottom-5 z-[45] flex h-14 items-center gap-0 overflow-hidden rounded-full bg-ink pr-[18px] pl-[18px] text-cream shadow-[0_18px_40px_-12px_rgba(17,12,9,.55),0_0_0_1px_rgba(198,166,106,.35)] wide:right-8 wide:bottom-6"
          >
            <span className="pointer-events-none absolute -inset-px rounded-full opacity-70 [background:conic-gradient(from_0deg,transparent_0deg,rgba(198,166,106,.55)_60deg,transparent_120deg)] animate-shimmer [mask:radial-gradient(farthest-side,transparent_calc(100%-1.5px),#000_calc(100%-1px))]" />
            <Sparkle className="relative size-[20px] shrink-0 text-gold" />
            <span className="relative max-w-0 overflow-hidden text-[10px] font-medium tracking-[.24em] whitespace-nowrap transition-[max-width,margin] duration-700 ease-lux group-hover:ml-3 group-hover:max-w-[160px] wide:ml-3 wide:max-w-[160px]">
              ASK THE MAISON
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUI({ concierge: false })}
              className="fixed inset-0 z-[64] bg-[rgba(17,12,9,.18)] wide:bg-transparent"
            />
            <motion.section
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Le Concierge"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
              style={{ transformOrigin: "bottom right" }}
              className="fixed inset-x-0 bottom-0 z-[65] flex h-[min(88dvh,720px)] flex-col overflow-hidden border border-ink/10 bg-cream/95 shadow-[0_40px_80px_-24px_rgba(17,12,9,.45)] backdrop-blur-2xl backdrop-saturate-150 wide:inset-x-auto wide:right-8 wide:bottom-8 wide:h-[min(720px,calc(100dvh-120px))] wide:w-[420px]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 pt-5 pb-4">
                <div>
                  <p className="m-0 flex items-center gap-2 text-[10px] font-medium tracking-[.3em] text-gold">
                    <Sparkle className="size-3" /> LE CONCIERGE
                  </p>
                  <p className="m-0 mt-1.5 font-serif text-[22px] font-light leading-tight">At your service.</p>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  {!empty && (
                    <button onClick={() => set(() => ({ messages: [] }))} className="text-[10px] tracking-[.2em] text-taupe transition-colors hover:text-ink" disabled={streaming}>
                      NEW
                    </button>
                  )}
                  <button onClick={() => setUI({ concierge: false })} className="text-[11px] tracking-[.2em]">
                    CLOSE ×
                  </button>
                </div>
              </div>

              {/* Conversation */}
              <div ref={scroller} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                {empty ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex h-full flex-col">
                    <p className="m-0 text-[11px] tracking-[.24em] text-taupe">TELL US ABOUT</p>
                    <MorphingText texts={MORPH} className="mt-2 h-[46px] font-serif text-[40px] leading-none font-light tracking-[.02em] text-ink" />
                    <p className="mt-5 max-w-[300px] text-[13px] leading-relaxed text-body">
                      Ask about a piece, a material, a gift or a fit. Our advisor answers with the pieces that suit you.
                    </p>
                    <div className="mt-auto flex flex-col gap-2 pt-8">
                      {PROMPTS.map((p, i) => (
                        <motion.button
                          key={p}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: EASE_LUX }}
                          onClick={() => send(p)}
                          className="flex items-center justify-between border border-ink/10 bg-ivory/70 px-4 py-3 text-left text-[13px] transition-colors duration-300 hover:border-ink/40"
                        >
                          {p}
                          <span className="text-taupe">→</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {messages.map((m) =>
                      m.role === "user" ? (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: EASE_LUX }}
                          className="max-w-[85%] self-end bg-ink px-4 py-3 text-[13px] leading-relaxed text-cream"
                        >
                          {m.content}
                        </motion.div>
                      ) : (
                        <div key={m.id} className="max-w-[95%]">
                          <p className="m-0 mb-1 text-[9px] tracking-[.28em] text-gold">LE CONCIERGE</p>
                          {m.content ? <AssistantText text={m.content} /> : <Typing />}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={onSubmit} className="border-t border-ink/10 bg-ivory/60 px-4 py-3">
                <div className="flex items-end gap-2">
                  <label htmlFor="concierge-input" className="sr-only">
                    Message Le Concierge
                  </label>
                  <textarea
                    id="concierge-input"
                    ref={field}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={onKey}
                    placeholder="Ask the maison…"
                    className="max-h-[120px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-[14px] leading-snug outline-none placeholder:text-taupe"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || streaming}
                    aria-label="Send"
                    className={cn(
                      "mb-1 flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-lux",
                      input.trim() && !streaming ? "bg-ink text-cream" : "bg-ink/10 text-taupe",
                    )}
                  >
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <p className="m-0 px-2 pt-1 text-[10px] tracking-[.06em] text-taupe">AI advisor · answers may be imperfect. For orders, call +1 416 555 0100.</p>
              </form>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
