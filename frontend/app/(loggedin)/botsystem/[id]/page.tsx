"use client"
import { useParams } from 'next/navigation'
import Leaderboard from '@/components/botsystem/leaderboard'
import RulesManager from '@/components/botsystem/rules-manager'
import InfractionsManager from '@/components/botsystem/infractions-manager'
import { useAuth } from '@/contexts/auth-context'
import { useBotSystem } from '@/queries/queries'
import LoadingScreen from '@/components/loading-screen'

export default function BotsystemPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBotSystem(id);
  const { user } = useAuth();

  if (isLoading) {
    return <LoadingScreen text="Laster inn botsystem..." />
  }

  const isOwner = data?.owner_id === user?.id;

  return (
    <div className="space-y-8">
      {/* Leaderboard Section */}
      <section>
        <Leaderboard botsystemId={id} />
      </section>

      {/* Rules Section */}
      <section>
        <RulesManager botsystemId={id} isOwner={isOwner} />
      </section>

      {/* Infractions Section */}
      <section>
        <InfractionsManager botsystemId={id} />
      </section>
    </div>
  )
}
