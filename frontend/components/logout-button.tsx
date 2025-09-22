'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOutIcon } from 'lucide-react'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Logout"
    >
      <LogOutIcon className="w-4 h-4" />
      <span className="text-sm">Logout</span>
    </button>
  )
}