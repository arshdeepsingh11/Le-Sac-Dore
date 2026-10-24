"use client";

import { create } from "zustand";
import { useShop, useUI } from "./store";

export interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  marketing: boolean;
  address: Record<string, string> | null;
  createdAt: string;
}

export interface MeOrder {
  id: string;
  number: string;
  status: number;
  total: number;
  createdAt: string;
  items: { productId: string; name: string; color: string; qty: number; unitPrice: number }[];
  passports: string[];
}

export interface MeReservation {
  id: string;
  productId: string;
  color: string;
  boutique: string;
  date: string;
  slot: string;
  kind: string;
  status: string;
  holdUntil: string;
}

interface AuthState {
  user: Me | null;
  loaded: boolean;
  orders: MeOrder[];
  reservations: MeReservation[];
  passports: { serial: string; productId: string; color: string; orderId: string | null }[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  loaded: false,
  orders: [],
  reservations: [],
  passports: [],
  refresh: async () => {
    try {
      const r = await fetch("/api/me", { cache: "no-store" });
      const j = await r.json();
      useUI.setState({ signedIn: !!j.user });
      if (!j.user) return set({ user: null, loaded: true, orders: [], reservations: [], passports: [] });
      set({ user: j.user, orders: j.orders, reservations: j.reservations, passports: j.passports, loaded: true });
      // Server is the source of truth for a signed-in wishlist.
      useShop.setState({ wish: j.wishlist });
    } catch {
      set({ loaded: true });
    }
  },
  signOut: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, orders: [], reservations: [], passports: [] });
    useUI.setState({ signedIn: false });
    useShop.setState({ wish: [] });
  },
}));

/** After sign-in: merge this device's wishlist into the account, then load everything. */
export async function afterSignIn() {
  const ids = useShop.getState().wish;
  if (ids.length) {
    await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }).catch(() => {});
  }
  await useAuth.getState().refresh();
}

export async function postJSON<T = unknown>(url: string, data: unknown, method = "POST"): Promise<{ ok: boolean; data: T & { error?: string } }> {
  try {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, data: j };
  } catch {
    return { ok: false, data: { error: "Network error. Please try again." } as T & { error?: string } };
  }
}
