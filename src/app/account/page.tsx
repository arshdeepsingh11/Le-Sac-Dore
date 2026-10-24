import type { Metadata } from "next";
import { AccountView, type AccountTab } from "@/components/account-view";

export const metadata: Metadata = { title: "Your account" };
const VALID: AccountTab[] = ["orders", "bags", "appointments", "wish", "info", "prefs"];

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initial = (VALID.includes(tab as AccountTab) ? tab : "orders") as AccountTab;
  return <AccountView key={initial} initial={initial} />;
}
