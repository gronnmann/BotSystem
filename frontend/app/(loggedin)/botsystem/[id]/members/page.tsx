"use client"
import MembersManager from './members-manager'
import { useParams } from 'next/navigation'

export default function MembersPage() {
  const { id } = useParams<{ id: string }>()
  return <MembersManager botsystemId={id} />
}