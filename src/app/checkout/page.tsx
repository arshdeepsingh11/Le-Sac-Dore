import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout-flow";

export const metadata: Metadata = { title: "Secure checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ pay?: string }> }) {
  const { pay } = await searchParams;
  const initialPay = pay === "apple" || pay === "google" || pay === "shop" ? pay : "card";
  return <CheckoutFlow initialPay={initialPay} />;
}
