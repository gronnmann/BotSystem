'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { toast } from 'sonner'
import { Tables } from '@/lib/database.types'
import { PlusIcon, BookOpenIcon, TrashIcon, EyeOffIcon, EyeIcon } from 'lucide-react'

interface RulesManagerProps {
  rules: Tables<'rules'>[]
  botsystemId: string
  isOwner: boolean
}

export default function RulesManager({ rules, botsystemId, isOwner }: RulesManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ruleTitle, setRuleTitle] = useState('')
  const [defaultUnits, setDefaultUnits] = useState(1)
  const router = useRouter()

  async function createRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!ruleTitle.trim()) {
      toast.error('Please enter a rule title')
      return
    }

    if (defaultUnits < 1 || defaultUnits > 100) {
      toast.error('Default units must be between 1 and 100')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabaseClient
        .from('rules')
        .insert({
          botsystem_id: botsystemId,
          title: ruleTitle.trim(),
          default_units: defaultUnits,
          is_active: true,
        })

      if (error) {
        toast.error('Failed to create rule: ' + error.message)
      } else {
        toast.success('Rule created successfully! 📋')
        setRuleTitle('')
        setDefaultUnits(1)
        setShowCreateForm(false)
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function toggleRuleActive(ruleId: string, isActive: boolean) {
    try {
      const { error } = await supabaseClient
        .from('rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId)

      if (error) {
        toast.error('Failed to update rule: ' + error.message)
      } else {
        toast.success(isActive ? 'Rule deactivated' : 'Rule activated')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm('Are you sure you want to delete this rule? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabaseClient
        .from('rules')
        .delete()
        .eq('id', ruleId)

      if (error) {
        toast.error('Failed to delete rule: ' + error.message)
      } else {
        toast.success('Rule deleted')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Regler
          </h2>
        </div>

        {isOwner && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Rule
          </button>
        )}
      </div>

      {/* Create Form */}
      {isOwner && showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ny Regel</h3>
          <form onSubmit={createRule} className="space-y-4">
            <div>
              <label htmlFor="ruleTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Regel
              </label>
              <input
                id="ruleTitle"
                type="text"
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="f. eks. For sein til møte"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="defaultUnits" className="block text-sm font-medium text-gray-700 mb-2">
                Antall Kryss
              </label>
              <input
                id="defaultUnits"
                type="number"
                min="1"
                max="100"
                value={defaultUnits}
                onChange={(e) => setDefaultUnits(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Oppretter regel...' : 'Opprett Regel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setRuleTitle('')
                  setDefaultUnits(1)
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules List */}
      {rules.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-6 ${!rule.is_active ? 'bg-gray-50 opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${rule.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                        {rule.title}
                      </h3>
                      {!rule.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                          Inakriv
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        <strong>{rule.default_units}</strong> {rule.default_units === 1 ? 'enhet' : 'enheter'}
                      </span>
                      <span>
                        Laga {new Date(rule.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRuleActive(rule.id, rule.is_active || false)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.is_active
                            ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                      >
                        {rule.is_active ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete rule"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ingen regler enda!</h3>
          </div>
        </div>
      )}
    </div>
  )
}
