"use client";
import LoadingScreen from "@/components/loading-screen";
import BotsystemList from "./botsystem-list";
import { useBotSystems } from "@/queries/queries";

export default function DashboardPage() {
  const { data, isLoading, isError } = useBotSystems();

  if (isLoading) {
    return <LoadingScreen text="Laster inn botsystemer..." />;
  }

  if (isError || !data) {
    return <div>Kunne ikke laste inn botsystemer...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Dine Botlister
          </h1>
          <p className="text-gray-600">
            Manage your penalty systems and join others!
          </p>
        </header>

        <BotsystemList systems={data} />
      </div>
    </div>
  );
}
