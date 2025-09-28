"use client"

import React from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useBotSystem, useBotsystemMembers } from "@/queries/queries"
import LoadingScreen from "@/components/loading-screen"
import { ArrowLeft, Crown, Trophy, Users } from "lucide-react"
import LogoutButton from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BotsystemPageProps {
    children: React.ReactNode
}

export default function BotsystemPageLayout({ children }: BotsystemPageProps) {
    const router = useRouter()
    const { user } = useAuth()
    const pathname = usePathname()

    const { id } = useParams<{ id: string }>()

    const { data: botsystem, isLoading: bsLoading } = useBotSystem(id)
    const {isLoading: membersLoading } = useBotsystemMembers(id)

    const isOwner = botsystem?.owner_id === user?.id

    if (bsLoading || membersLoading) {
        return <LoadingScreen text="Laster inn botsystem..." />
    }

    if (!botsystem) {
        router.push("/")
        return null
    }

    const baseUrl = `/botsystem/${id}`

    const tabs = [
        {
            id: 'dashboard',
            label: 'Fremside',
            icon: Trophy,
            href: baseUrl,
            isActive: pathname === baseUrl
        },
        {
            id: 'members',
            label: 'Medlemmer',
            icon: Users,
            href: `${baseUrl}/members`,
            isActive: pathname === `${baseUrl}/members`
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-background shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>

                            <Separator orientation="vertical" className="h-6" />

                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-bold">
                                    {botsystem.name}
                                </h1>

                                {isOwner ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Owner
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        <Users className="w-3 h-3 mr-1" />
                                        Member
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <LogoutButton />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-background shadow-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => router.push(tab.href)}
                                className={`flex items-center space-x-2 py-4 px-1 h-auto rounded-none border-b-2 font-medium text-sm transition-colors ${
                                    tab.isActive
                                        ? 'border-b-purple-500 text-purple-600 hover:text-purple-600 hover:bg-transparent'
                                        : 'border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-muted'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </Button>
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
