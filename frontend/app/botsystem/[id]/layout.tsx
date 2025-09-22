import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import BotsystemLayout from './botsystem-layout'

interface BotsystemPageProps {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

export default async function BotsystemPageLayout({ params, children }: BotsystemPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is owner or member of this botsystem
  const { data: botsystem } = await supabase
    .from('botsystems')
    .select('*')
    .eq('id', id)
    .single()

  if (!botsystem) {
    notFound()
  }

  const isOwner = botsystem.owner_id === user.id
  
  if (!isOwner) {
    const { data: membership } = await supabase
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