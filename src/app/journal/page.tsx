import type { Metadata } from "next";
import { JournalIndex } from "@/components/journal-index";

export const metadata: Metadata = { title: "The Journal", description: "Stories of craft, material and the lives our pieces lead." };

export default function JournalPage() {
  return <JournalIndex />;
}
