import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BotsystemList from './botsystem-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's botsystems
  const { data: ownedSystems } = await supabase
    .from('botsystems')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: memberSystems } = await supabase
    .from('botsystem_members')
    .select(`
      botsystem_id,
      role,
      botsystems (
        id,
        name,
        created_at,
        owner_id,
        profiles (
          display_name,
          color
        )
      )
    `)
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Your Botsystems
          </h1>
          <p className="text-gray-600">
            Manage your penalty systems and join others!
          </p>
        </header>

        <BotsystemList 
          ownedSystems={ownedSystems || []}
          memberSystems={memberSystems || []}
        />
      </div>
    </div>
  )
}