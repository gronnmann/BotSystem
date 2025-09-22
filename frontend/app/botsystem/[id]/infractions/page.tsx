import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import InfractionsManager from './infractions-manager'

interface InfractionsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function InfractionsPage({ params }: InfractionsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get penalties/infractions for this botsystem
  const { data: penalties } = await supabase
    .from('penalties')
    .select(`
      *,
      profiles!penalties_user_id_fkey (
        display_name,
        color
      ),
      created_by_profile:profiles!penalties_created_by_fkey (
        display_name,
        color
      ),
      rules (
        title,
        default_units
      )
    `)
    .eq('botsystem_id', id)
    .order('created_at', { ascending: false })

  // Get active rules for this botsystem
  const { data: rules } = await supabase
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .eq('is_active', true)
    .order('title')

  // Get members for user selection
  const { data: members } = await supabase
    .from('botsystem_members')
    .select(`
      user_id,
      profiles!botsystem_members_user_id_fkey (
        display_name,
        color
      )
    `)
    .eq('botsystem_id', id)

  // Also get the owner
  const { data: owner } = await supabase
    .from('botsystems')
    .select(`
      owner_id,
      profiles!botsystems_owner_id_fkey (
        display_name,
        color
      )
    `)
    .eq('id', id)
    .single()

  const allUsers = [
    ...(members || []),
    ...(owner ? [{
      user_id: owner.owner_id,
      profiles: owner.profiles
    }] : [])
  ]

  return (
    <InfractionsManager 
      penalties={penalties || []}
      rules={rules || []}
      users={allUsers}
      botsystemId={id}
    />
  )
}