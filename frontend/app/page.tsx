import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, color')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/profile-setup')
  }

  redirect('/dashboard')
}
