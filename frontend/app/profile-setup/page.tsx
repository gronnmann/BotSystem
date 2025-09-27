'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Enums } from '@/lib/database.types'
import { supabaseClient} from '@/lib/supabase-client'

const COLOR_OPTIONS = [
  { value: 'blue' as const, label: 'Blue', bgColor: 'bg-blue-500', textColor: 'text-blue-500' },
  { value: 'green' as const, label: 'Green', bgColor: 'bg-green-500', textColor: 'text-green-500' },
  { value: 'red' as const, label: 'Red', bgColor: 'bg-red-500', textColor: 'text-red-500' },
  { value: 'purple' as const, label: 'Purple', bgColor: 'bg-purple-500', textColor: 'text-purple-500' },
  { value: 'orange' as const, label: 'Orange', bgColor: 'bg-orange-500', textColor: 'text-orange-500' },
  { value: 'teal' as const, label: 'Teal', bgColor: 'bg-teal-500', textColor: 'text-teal-500' },
]

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedColor, setSelectedColor] = useState<Enums<'profile_color'>>('blue')
  const router = useRouter()
  const { user, refreshProfile, profile } = useAuth()

  useEffect(() => {
    if (profile) {
      router.push('/')
    }
  }, [profile, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }

    setLoading(true)

    try {
      if (!user) {
        toast.error('No authenticated user found')
        router.push('/login')
        return
      }

      const { error } = await supabaseClient.from('profiles').upsert({
        user_id: user.id,
        email: user.email!,
        display_name: displayName.trim(),
        color: selectedColor,
      })

      if (error) {
        toast.error('Failed to save profile: ' + error.message)
      } else {
        toast.success('Profile created successfully! 🎉')
        await refreshProfile()
        router.push('/')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎭 Setup Your Profile
            </h1>
            <p className="text-gray-600">
              Choose your display name and favorite color!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your display name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Your Color
              </label>
              <div className="grid grid-cols-3 gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedColor === color.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-6 h-6 rounded-full ${color.bgColor}`} />
                      <span className={`text-sm font-medium ${selectedColor === color.value ? color.textColor : 'text-gray-600'}`}>
                        {color.label}
                      </span>
                    </div>
                    {selectedColor === color.value && (
                      <div className="absolute top-1 right-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating profile...
                </span>
              ) : (
                'Complete setup'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
