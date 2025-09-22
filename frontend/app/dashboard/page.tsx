'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import BotsystemList from './botsystem-list'

type BotsystemWithProfile = Tables<'botsystems'> & {
  profiles: Pick<Tables<'profiles'>, 'display_name' | 'color'>
}

type MemberSystemData = {
  botsystem_id: string
  role: string
  botsystems: BotsystemWithProfile
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [ownedSystems, setOwnedSystems] = useState<Tables<'botsystems'>[]>([])
  const [memberSystems, setMemberSystems] = useState<MemberSystemData[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        // Get user's botsystems
        const { data: owned } = await supabase
          .from('botsystems')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        const { data: member } = await supabase
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

        setOwnedSystems(owned || [])
        setMemberSystems(member || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user, loading, router])

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

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
          ownedSystems={ownedSystems}
          memberSystems={memberSystems}
        />
      </div>
    </div>
  )
}