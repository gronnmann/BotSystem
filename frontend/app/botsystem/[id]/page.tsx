import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Leaderboard from './leaderboard'
import RulesManager from './rules-manager'
import InfractionsManager from './infractions-manager'

interface BotsystemPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BotsystemPage({ params }: BotsystemPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is owner
  const { data: botsystem } = await supabase
    .from('botsystems')
    .select('owner_id')
    .eq('id', id)
    .single()

  const isOwner = botsystem?.owner_id === user.id

  // Get all data needed for the combined dashboard
  
  // 1. Get penalties for leaderboard and infractions
  const { data: penalties } = await supabase
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
  const { data: allRules } = await supabase
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .order('created_at', { ascending: false })

  // 3. Get active rules for infractions form
  const { data: activeRules } = await supabase
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .eq('is_active', true)
    .order('title')

  // 4. Get members for user selection in infractions
  const { data: members } = await supabase
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