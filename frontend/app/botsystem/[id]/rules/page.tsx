import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RulesManager from './rules-manager'

interface RulesPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is owner
  const { data: botsystem } = await supabase
    .from('botsystems')
    .select('owner_id')
    .eq('id', id)
    .single()

  const isOwner = botsystem?.owner_id === user.id

  // Get all rules for this botsystem
  const { data: rules } = await supabase
    .from('rules')
    .select('*')
    .eq('botsystem_id', id)
    .order('created_at', { ascending: false })

  return <RulesManager rules={rules || []} botsystemId={id} isOwner={isOwner} />
}