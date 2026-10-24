import type { Metadata } from "next";
import { ServicesView } from "@/components/services-view";
import { SERVICES, type ServiceKey } from "@/lib/data";

export const metadata: Metadata = { title: "Client Services" };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initial = (tab && tab in SERVICES ? tab : "contact") as ServiceKey;
  return <ServicesView key={initial} initial={initial} />;
}
