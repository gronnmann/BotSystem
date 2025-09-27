"use client"
import { redirect, useParams } from 'next/navigation'
import Leaderboard from './leaderboard'
import RulesManager from './rules-manager'
import InfractionsManager from './infractions-manager'
import {supabaseClient} from '@/lib/supabase-client'
import { useAuth } from '@/contexts/auth-context'
import { useBotSystem } from '@/queries/queries'
import LoadingScreen from '@/components/loading-screen'

interface BotsystemPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BotsystemPage({ params }: BotsystemPageProps) {
  const { id } = useParams<{ id: string }>()
  
  const { data, isLoading, isError } = useBotSystem(id);
  const { user } = useAuth()

  const isOwner = data?.owner_id === user!.id

  if (isLoading) {
    return <LoadingScreen text="Laster inn botsystem..." />
  }

  // Get all data needed for the combined dashboard

  // 1. Get penalties for leaderboard and infractions
  const { data: penalties } = await supabaseClient
    .from('penalties')
    .select(`
      *,
      profiles!penalties_user_id_fkey (
        display_name,
        color
      ),
      created_by_profile:profiles!penalties_created_by_fkey (
        display_name,
        color
      ),
      rules (
        title,
        default_units
      )
    `)
    .eq('botsystem_id', id)
    .order('created_at', { ascending: false })

  // 2. Get all rules for this botsystem
  const { data: allRules } = await supabaseClient
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .order('created_at', { ascending: false })

  // 3. Get active rules for infractions form
  const { data: activeRules } = await supabaseClient
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .eq('is_active', true)
    .order('title')

  // 4. Get members for user selection in infractions
  const { data: members } = await supabaseClient
    .from('botsystem_members')
    .select(`
      user_id,
      profiles!botsystem_members_user_id_fkey (
        display_name,
        color
      )
    `)
    .eq('botsystem_id', id)
    .throwOnError()

  // Calculate leaderboard data
  const leaderboardData = penalties?.reduce((acc, penalty) => {
    const userId = penalty.user_id
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        display_name: penalty.profiles?.display_name || 'Unknown',
        color: penalty.profiles?.color || 'blue',
        total_units: 0,
      }
    }
    acc[userId].total_units += penalty.units
    return acc
  }, {} as Record<string, {
    user_id: string
    display_name: string
    color: string
    total_units: number
  }>)

  const sortedLeaderboard = Object.values(leaderboardData || {})
    .sort((a, b) => b.total_units - a.total_units)

  return (
    <div className="space-y-8">
      {/* Leaderboard Section */}
      <section>
        <Leaderboard data={sortedLeaderboard} />
      </section>

      {/* Rules Section */}
      <section>
        <RulesManager rules={allRules || []} botsystemId={id} isOwner={isOwner} />
      </section>

      {/* Infractions Section */}
      <section>
        <InfractionsManager
          penalties={penalties || []}
          rules={activeRules || []}
          users={members}
          botsystemId={id}
        />
      </section>
    </div>
  )
}
