'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      redirect('/login')
      return
    }

    if (!profile) {
      redirect('/profile-setup')
      return
    }

    redirect('/dashboard')
  }, [user, profile, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
