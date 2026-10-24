"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { byId, fmt, type ColorName } from "./data";

/* ───────────────────────── Types ───────────────────────── */

export interface CartLine {
  key: string;
  pid: string;
  color: ColorName;
  qty: number;
}

export interface OrderItem {
  name: string;
  color: string;
  qty: number;
  lineF?: string;
}

export interface Order {
  number: string;
  date: string;
  status: number; // 0 received … 3 delivered
  total: number;
  email?: string;
  eta?: string;
  shipTo?: string;
  items: OrderItem[];
}

export type FormState = Record<string, string>;
export type Prefs = { news: boolean; arrivals: boolean; appts: boolean; sms: boolean };

interface ShopState {
  cart: CartLine[];
  wish: string[];
  orders: Order[];
  lastOrder: Order | null;
  form: FormState;
  prefs: Prefs;
  add: (pid: string, color: ColorName, qty?: number) => void;
  setQty: (key: string, delta: number) => void;
  remove: (key: string) => void;
  clearCart: () => void;
  toggleWish: (pid: string) => boolean; // returns new "saved" state
  setForm: (k: string, v: string) => void;
  togglePref: (k: keyof Prefs) => void;
  placeOrder: (order: Order) => void;
}

/* ───────────────────────── Shop (persisted) ───────────────────────── */

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wish: ["la-luna", "le-noir"],
      orders: [],
      lastOrder: null,
      form: { country: "Canada", province: "Ontario" },
      prefs: { news: true, arrivals: true, appts: false, sms: false },

      add: (pid, color, qty = 1) =>
        set((s) => {
          const key = `${pid}|${color}`;
          const cart = [...s.cart];
          const i = cart.findIndex((c) => c.key === key);
          if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(9, cart[i].qty + qty) };
          else cart.push({ key, pid, color, qty });
          return { cart };
        }),
      setQty: (key, d) =>
        set((s) => ({
          cart: s.cart.map((c) => (c.key === key ? { ...c, qty: Math.min(9, c.qty + d) } : c)).filter((c) => c.qty > 0),
        })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),
      clearCart: () => set({ cart: [] }),
      toggleWish: (pid) => {
        const on = get().wish.includes(pid);
        set((s) => ({ wish: on ? s.wish.filter((x) => x !== pid) : [...s.wish, pid] }));
        return !on;
      },
      setForm: (k, v) => set((s) => ({ form: { ...s.form, [k]: v } })),
      togglePref: (k) => set((s) => ({ prefs: { ...s.prefs, [k]: !s.prefs[k] } })),
      placeOrder: (order) => set((s) => ({ lastOrder: order, orders: [order, ...s.orders], cart: [] })),
    }),
    {
      name: "lsd_v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ cart: s.cart, wish: s.wish, orders: s.orders, lastOrder: s.lastOrder, form: s.form, prefs: s.prefs }),
    },
  ),
);

/* ───────────────────────── UI (ephemeral) ───────────────────────── */

interface UIState {
  drawer: boolean;
  search: boolean;
  menu: boolean;
  concierge: boolean;
  toast: string;
  toastOn: boolean;
  hydrated: boolean;
  cardColor: Record<string, ColorName>;
  set: (p: Partial<Omit<UIState, "set" | "flash" | "closeAll" | "setCardColor">>) => void;
  closeAll: () => void;
  flash: (msg: string) => void;
  setCardColor: (pid: string, c: ColorName) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useUI = create<UIState>()((set) => ({
  drawer: false,
  search: false,
  menu: false,
  concierge: false,
  toast: "",
  toastOn: false,
  hydrated: false,
  cardColor: {},
  set: (p) => set(p),
  closeAll: () => set({ drawer: false, search: false, menu: false }),
  flash: (msg) => {
    set({ toast: msg, toastOn: true });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toastOn: false }), 2400);
  },
  setCardColor: (pid, c) => set((s) => ({ cardColor: { ...s.cardColor, [pid]: c } })),
}));

/* ───────────────────────── Derived selectors / actions ───────────────────────── */

export const useBagCount = () => useShop((s) => s.cart.reduce((a, c) => a + c.qty, 0));
export const useSubtotal = () => useShop((s) => s.cart.reduce((a, c) => a + byId(c.pid).price * c.qty, 0));

/** Add to bag — opens the drawer (like the artifact), or toasts when `open` is false. */
export function addToBag(pid: string, color: ColorName, qty = 1, open = true) {
  useShop.getState().add(pid, color, qty);
  if (open) useUI.getState().set({ drawer: true, menu: false, search: false });
  else useUI.getState().flash(`${byId(pid).name} ADDED TO YOUR BAG`);
}

export function toggleWishlist(pid: string) {
  const saved = useShop.getState().toggleWish(pid);
  useUI.getState().flash(saved ? "SAVED TO WISHLIST" : "REMOVED FROM WISHLIST");
}

export function cartRows(cart: CartLine[]) {
  return cart.map((c) => {
    const p = byId(c.pid);
    return { ...c, name: p.name, material: p.material, line: p.price * c.qty, lineF: fmt(p.price * c.qty) };
  });
}
