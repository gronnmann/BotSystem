'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { Tables } from '@/lib/database.types'
import { ArrowLeftIcon, CrownIcon, UsersIcon, TrophyIcon } from 'lucide-react'
import LogoutButton from '@/components/logout-button'

interface BotsystemLayoutProps {
  botsystem: Tables<'botsystems'>
  isOwner: boolean
  children: React.ReactNode
}

export default function BotsystemLayout({ botsystem, isOwner, children }: BotsystemLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  
  const baseUrl = `/botsystem/${params.id}`
  
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: TrophyIcon,
      href: baseUrl,
      isActive: pathname === baseUrl
    },
    {
      id: 'members',
      label: 'Members',
      icon: UsersIcon,
      href: `${baseUrl}/members`,
      isActive: pathname === `${baseUrl}/members`
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {botsystem.name}
                </h1>
                <div className="flex items-center space-x-1 text-sm">
                  {isOwner ? (
                    <>
                      <CrownIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600">Owner</span>
                    </>
                  ) : (
                    <>
                      <UsersIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600">Member</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tab.isActive
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}