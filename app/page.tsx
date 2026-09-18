import WidgetRegistry from "@/components/widgets/WidgetRegistry";
import AIConcierge from "@/components/home/AIConcierge";
import { getCachedHomeData } from "@/lib/cachedData";
import { type StoreSettings } from "@/lib/useSettings";

export const revalidate = 300; // Shared with cache

export default async function Home() {
  // 1. Fetch settings (Streaming/Non-blocking)
  const settingsPromise = getCachedHomeData().then(([, , res]) => res.data || []);

  return (
    <div className="bg-white min-h-screen text-left pb-20">

      {/* 🧩 Master Orchestration Hub */}
      <WidgetRegistry pageRoute="/" />

      {/* 🤖 Floating AI Support Node */}
      <AIConcierge />

    </div>
  );
}
