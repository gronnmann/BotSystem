import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Leaderboard from './leaderboard'

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

  // Get penalty data for leaderboard
  const { data: penalties } = await supabase
    .from('penalties')
    .select(`
      units,
      user_id,
      profiles!penalties_user_id_fkey (
        display_name,
        color
      )
    `)
    .eq('botsystem_id', id)

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

  return <Leaderboard data={sortedLeaderboard} />
}