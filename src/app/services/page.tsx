import type { Metadata } from "next";
import { ServicesView } from "@/components/services-view";
import { SERVICES, type ServiceKey } from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, faqLd, pageMeta, SERVICE_FAQ, storesLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Client Services, Boutiques & FAQ", description: "Shipping, returns, care, repairs and warranty for Le Sac Doré handbags — plus boutiques and private appointments in Toronto, Montréal, Vancouver, Paris, New York and London.", path: "/services" });

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initial = (tab && tab in SERVICES ? tab : "contact") as ServiceKey;
  return (
    <>
      <JsonLd data={[faqLd(SERVICE_FAQ), ...storesLd(), breadcrumbLd([["Home", "/"], ["Client Services", "/services"]])]} />
      <ServicesView key={initial} initial={initial} />
    </>
  );
}
