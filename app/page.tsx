import WidgetRegistry from "@/components/widgets/WidgetRegistry";
import AIConcierge from "@/components/home/AIConcierge";
import { getCachedHomeData } from "@/lib/cachedData";
import { type StoreSettings } from "@/lib/useSettings";

export const revalidate = 300; // Shared with cache

export default async function Home() {
  // 1. Fetch settings to pass to some legacy components if needed
  const [, , settingsRes] = await getCachedHomeData();

  // Process Settings
  const settingsData = settingsRes.data || [];
  const settings = {} as StoreSettings;
  settingsData.forEach(item => {
      (settings as unknown as Record<string, unknown>)[item.key] = item.value;
  });

  return (
    <div className="bg-white min-h-screen text-left pb-20">

      {/* 🧩 Master Orchestration Hub */}
      <WidgetRegistry pageRoute="/" />

      {/* 🤖 Floating AI Support Node */}
      <AIConcierge />

    </div>
  );
}
