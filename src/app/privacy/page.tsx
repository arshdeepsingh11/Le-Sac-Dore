import type { Metadata } from "next";
import { ResetConsent } from "@/components/reset-consent";

export const metadata: Metadata = { title: "Privacy policy" };

const SECTIONS: [string, string[]][] = [
  ["WHAT WE COLLECT", [
    "Account details you give us: your name, email, phone number and delivery address.",
    "Orders, Digital Passport registrations, wishlist and appointment requests.",
    "With your consent only: how you use the boutique online — pages and pieces you view, searches, items saved or added to your bag, and messages to Le Concierge. We also record your approximate country and city, device type and browser.",
    "Card details are never stored on our servers.",
  ]],
  ["WHY WE COLLECT IT", [
    "To deliver your orders, keep your account and passports, and prepare your appointments.",
    "To understand which pieces interest you so our Client Advisors can serve you better, and to improve the boutique.",
    "To send you news from the maison, only if you asked us to.",
  ]],
  ["COOKIES", [
    "Essential cookies keep you signed in and remember your bag. They are always on.",
    "Analytics cookies are used only if you choose “Accept all”. You can change your choice at any time below.",
  ]],
  ["YOUR CHOICES", [
    "You may ask to see, correct or delete your personal information at any time by writing to privacy@lesacdore.com.",
    "You can unsubscribe from our emails in your account preferences or from any email.",
  ]],
  ["RETENTION", [
    "Browsing analytics are kept for up to 24 months. Order records are kept as long as the law requires.",
  ]],
];

export default function PrivacyPage() {
  return (
    <section className="gutter mx-auto max-w-[900px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <p className="eyebrow mb-4">LE SAC DORÉ™</p>
      <h1 className="display text-[clamp(46px,5vw,80px)] leading-[1.02]">Privacy policy.</h1>
      <p className="lede mt-5 text-2xl">What we collect, stated plainly.</p>
      <div className="mt-16 flex flex-col">
        {SECTIONS.map(([h, items]) => (
          <div key={h} className="grid grid-cols-1 gap-4 border-t border-ink/12 py-8 wide:grid-cols-[220px_minmax(0,1fr)]">
            <h2 className="m-0 text-[11px] font-semibold tracking-[.24em]">{h}</h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px] leading-[1.75] text-body">
              {items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ResetConsent />
    </section>
  );
}

