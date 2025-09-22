import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MembersManager from './members-manager'

interface MembersPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is owner
  const { data: botsystem } = await supabase
    .from('botsystems')
    .select('*, profiles!botsystems_owner_id_fkey(display_name, color)')
    .eq('id', id)
    .single()

  const isOwner = botsystem?.owner_id === user.id

  // Get members
  const { data: members } = await supabase
    .from('botsystem_members')
    .select(`
      *,
      profiles!botsystem_members_user_id_fkey (
        display_name,
        color
      )
    `)
    .eq('botsystem_id', id)

  return (
    <MembersManager 
      botsystem={botsystem}
      members={members || []}
      isOwner={isOwner}
    />
  )
}