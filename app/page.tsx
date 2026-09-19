import WidgetRegistry from "@/components/widgets/WidgetRegistry";
import AIConcierge from "@/components/home/AIConcierge";

export const revalidate = 300; // Shared with cache

export default async function Home() {
  return (
    <div className="bg-white min-h-screen text-left pb-20">

      {/* 🧩 Master Orchestration Hub */}
      <WidgetRegistry pageRoute="/" />

      {/* 🤖 Floating AI Support Node */}
      <AIConcierge />

    </div>
  );
}
