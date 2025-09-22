'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'
import { Tables } from '@/lib/database.types'
import { PlusIcon, UsersIcon, CrownIcon, SearchIcon, TrashIcon } from 'lucide-react'

type BotsystemWithOwner = Tables<'botsystems'> & {
  profiles: {
    display_name: string
    color: string
  } | null
}

type MemberWithProfile = Tables<'botsystem_members'> & {
  profiles: {
    display_name: string
    color: string
  } | null
}

interface MembersManagerProps {
  botsystem: BotsystemWithOwner | null
  members: MemberWithProfile[]
  isOwner: boolean
}

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
}

export default function MembersManager({ botsystem, members, isOwner }: MembersManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Tables<'profiles'>[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setSearchLoading(true)
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(10)

        // Filter out users who are already members or the owner
        const existingUserIds = new Set([
          botsystem?.owner_id,
          ...members.map(m => m.user_id)
        ])

        const filteredResults = (data || []).filter(
          profile => !existingUserIds.has(profile.user_id)
        )

        setSearchResults(filteredResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    const debounceTimeout = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimeout)
  }, [searchQuery, botsystem?.owner_id, members, supabase])

  async function addMember(userId: string) {
    if (!botsystem) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('botsystem_members')
        .insert({
          botsystem_id: botsystem.id,
          user_id: userId,
          role: 'member',
        })

      if (error) {
        toast.error('Failed to add member: ' + error.message)
      } else {
        toast.success('Member added successfully! 👥')
        setSearchQuery('')
        setSearchResults([])
        setShowAddForm(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function removeMember(userId: string) {
    if (!botsystem) return
    
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('botsystem_members')
        .delete()
        .eq('botsystem_id', botsystem.id)
        .eq('user_id', userId)

      if (error) {
        toast.error('Failed to remove member: ' + error.message)
      } else {
        toast.success('Member removed')
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  if (!botsystem) {
    return <div>Botsystem not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Members
          </h2>
          <p className="text-gray-600">
            Manage who can participate in this botsystem
          </p>
        </div>
        
        {isOwner && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Member
          </button>
        )}
      </div>

      {/* Add Member Form */}
      {isOwner && showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Member</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name or email..."
                  disabled={loading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((profile) => {
                  const userColor = profile.color as keyof typeof COLOR_CLASSES || 'blue'
                  
                  return (
                    <button
                      key={profile.user_id}
                      onClick={() => addMember(profile.user_id)}
                      disabled={loading}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 disabled:opacity-50"
                    >
                      <div className={`w-3 h-3 rounded-full ${COLOR_CLASSES[userColor]}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {profile.display_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.email}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No users found matching your search.
              </p>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {/* Owner */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${COLOR_CLASSES[botsystem.profiles?.color as keyof typeof COLOR_CLASSES || 'blue']}`} />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {botsystem.profiles?.display_name || 'Unknown User'}
                    </h3>
                    <CrownIcon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-yellow-600 text-sm font-medium">Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          {members.map((member) => {
            const userColor = member.profiles?.color as keyof typeof COLOR_CLASSES || 'blue'
            
            return (
              <div key={member.user_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${COLOR_CLASSES[userColor]}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.profiles?.display_name || 'Unknown User'}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">Member</p>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <button
                      onClick={() => removeMember(member.user_id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Added {new Date(member.added_at || '').toLocaleDateString()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className="p-8 text-center border-t border-gray-200">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {isOwner 
                ? "No members added yet. Add some to get started!" 
                : "No other members in this botsystem."
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {members.length + 1}
            </div>
            <div className="text-gray-500">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Date(botsystem.created_at || '').toLocaleDateString()}
            </div>
            <div className="text-gray-500">Created</div>
          </div>
        </div>
      </div>
    </div>
  )
}