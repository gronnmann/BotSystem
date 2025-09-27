import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import BotsystemLayout from './botsystem-layout'
import supabaseClient from '@/lib/supabase-client'

interface BotsystemPageProps {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

export default async function BotsystemPageLayout({ params, children }: BotsystemPageProps) {
  const { id } = await params
  const { data: { user } } = await supabaseClient.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is owner or member of this botsystem
  const { data: botsystem } = await supabaseClient
    .from('botsystems')
    .select('*')
    .eq('id', id)
    .single()

  if (!botsystem) {
    notFound()
  }

  const isOwner = botsystem.owner_id === user.id
  
  if (!isOwner) {
    const { data: membership } = await supabaseClient
      .from('botsystem_members')
      .select('*')
      .eq('botsystem_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      notFound()
    }
  }

  return (
    <BotsystemLayout botsystem={botsystem} isOwner={isOwner}>
      {children}
    </BotsystemLayout>
  )
}