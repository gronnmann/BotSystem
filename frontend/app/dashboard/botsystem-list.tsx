'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'
import { Tables } from '@/lib/database.types'
import { PlusIcon, UsersIcon, CrownIcon } from 'lucide-react'

type BotsystemWithProfile = Tables<'botsystems'> & {
  profiles: Pick<Tables<'profiles'>, 'display_name' | 'color'>
}

type MemberSystemData = {
  botsystem_id: string
  role: string
  botsystems: BotsystemWithProfile
}

interface BotsystemListProps {
  ownedSystems: Tables<'botsystems'>[]
  memberSystems: MemberSystemData[]
}

export default function BotsystemList({ ownedSystems, memberSystems }: BotsystemListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [botsystemName, setBotsystemName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function createBotsystem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!botsystemName.trim()) {
      toast.error('Please enter a botsystem name')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('No authenticated user found')
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('botsystems')
        .insert({
          name: botsystemName.trim(),
          owner_id: user.id,
        })
        .select()
        .single()

      if (error) {
        toast.error('Failed to create botsystem: ' + error.message)
      } else {
        toast.success('Botsystem created successfully! 🎉')
        setBotsystemName('')
        setShowCreateForm(false)
        router.push(`/botsystem/${data.id}`)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const allSystems = [
    ...ownedSystems.map(system => ({ ...system, role: 'owner' as const })),
    ...memberSystems.map(item => ({ 
      ...item.botsystems, 
      role: item.role as 'owner' | 'member' 
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Create New Botsystem Button */}
      {!showCreateForm && (
        <div className="text-center">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Botsystem
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Botsystem</h2>
          <form onSubmit={createBotsystem} className="space-y-4">
            <div>
              <label htmlFor="botsystemName" className="block text-sm font-medium text-gray-700 mb-2">
                Botsystem Name
              </label>
              <input
                id="botsystemName"
                type="text"
                value={botsystemName}
                onChange={(e) => setBotsystemName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Friday Night Crew, Office Squad..."
                disabled={loading}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setBotsystemName('')
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Botsystems */}
      {allSystems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allSystems.map((system) => (
            <div
              key={system.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/botsystem/${system.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {system.name}
                </h3>
                <div className="flex items-center space-x-1 text-sm">
                  {system.role === 'owner' ? (
                    <CrownIcon className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <UsersIcon className="w-4 h-4 text-blue-500" />
                  )}
                  <span className={system.role === 'owner' ? 'text-yellow-600' : 'text-blue-600'}>
                    {system.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Created {new Date(system.created_at || '').toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-500">
            You don&apos;t have any botsystems yet. Create your first one to get started!
          </p>
        </div>
      )}
    </div>
  )
}