"use client"
import MembersManager from './members-manager'
import { useParams } from 'next/navigation'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">Innstillinger</h1>
          <p className="text-muted-foreground mt-1">
            Innstillinger for botsystem
          </p>
        </div>
      </div>

      {/* Settings Cards - Add more cards here as needed */}
      <div className="space-y-6">
        <MembersManager botsystemId={id} />
        {/* Add more setting cards here, e.g.: */}
        {/* <GeneralSettingsCard botsystemId={id} /> */}
        {/* <NotificationsCard botsystemId={id} /> */}
      </div>
    </div>
  )
}