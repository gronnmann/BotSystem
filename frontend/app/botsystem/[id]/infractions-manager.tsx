'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Tables } from '@/lib/database.types'
import { PlusIcon, AlertTriangleIcon, UserIcon, CalendarIcon } from 'lucide-react'

type PenaltyWithDetails = Tables<'penalties'> & {
  profiles: {
    display_name: string
    color: string
  } | null
  created_by_profile: {
    display_name: string
    color: string
  } | null
  rules: {
    title: string
    default_units: number
  } | null
}

type UserWithProfile = {
  user_id: string
  profiles: {
    display_name: string
    color: string
  } | null
}

interface InfractionsManagerProps {
  penalties: PenaltyWithDetails[]
  rules: Tables<'rules'>[]
  users: UserWithProfile[]
  botsystemId: string
}

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
}

export default function InfractionsManager({ penalties, rules, users, botsystemId }: InfractionsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState('')
  const [customUnits, setCustomUnits] = useState('')
  const [note, setNote] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  async function createPenalty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }

    if (!selectedRuleId) {
      toast.error('Please select a rule')
      return
    }

    const selectedRule = rules.find(r => r.id === selectedRuleId)
    const units = customUnits ? parseInt(customUnits) : selectedRule?.default_units || 1

    if (units < 1 || units > 100) {
      toast.error('Units must be between 1 and 100')
      return
    }

    setLoading(true)

    try {
      if (!user) {
        toast.error('No authenticated user found')
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('penalties')
        .insert({
          botsystem_id: botsystemId,
          user_id: selectedUserId,
          rule_id: selectedRuleId,
          units: units,
          note: note.trim() || null,
          created_by: user.id,
        })

      if (error) {
        toast.error('Failed to create penalty: ' + error.message)
      } else {
        toast.success('Penalty added successfully! ⚠️')
        setSelectedUserId('')
        setSelectedRuleId('')
        setCustomUnits('')
        setNote('')
        setShowCreateForm(false)
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedRule = rules.find(r => r.id === selectedRuleId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ⚠️ Infractions
          </h2>
          <p className="text-gray-600">
            Track penalty infractions and their details
          </p>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Penalty
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Penalty</h3>
          <form onSubmit={createPenalty} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  User
                </label>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.profiles?.display_name || 'Unknown User'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ruleId" className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Broken
                </label>
                <select
                  id="ruleId"
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a rule...</option>
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.title} ({rule.default_units} units)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="customUnits" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Units (optional)
                {selectedRule && (
                  <span className="text-gray-500 ml-2">
                    Default: {selectedRule.default_units} units
                  </span>
                )}
              </label>
              <input
                id="customUnits"
                type="number"
                min="1"
                max="100"
                value={customUnits}
                onChange={(e) => setCustomUnits(e.target.value)}
                placeholder={selectedRule ? selectedRule.default_units.toString() : '1'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Note (optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Any additional details about this penalty..."
                disabled={loading}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Adding...' : 'Add Penalty'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedUserId('')
                  setSelectedRuleId('')
                  setCustomUnits('')
                  setNote('')
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

      {/* Penalties List */}
      {penalties.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {penalties.map((penalty) => {
              const userColor = penalty.profiles?.color as keyof typeof COLOR_CLASSES || 'blue'

              return (
                <div key={penalty.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${COLOR_CLASSES[userColor]}`} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {penalty.profiles?.display_name || 'Unknown User'}
                        </h3>
                        <p className="text-gray-600">
                          {penalty.rules?.title || 'Unknown Rule'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {penalty.units}
                      </div>
                      <div className="text-sm text-gray-500">
                        {penalty.units === 1 ? 'unit' : 'units'}
                      </div>
                    </div>
                  </div>
                  
                  {penalty.note && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 text-sm">{penalty.note}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(penalty.created_at || '').toLocaleDateString()} at{' '}
                        {new Date(penalty.created_at || '').toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>
                        Added by {penalty.created_by_profile?.display_name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No infractions yet!</h3>
            <p className="text-gray-500 mb-4">
              No penalties have been recorded yet. Add the first one to get started!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}