'use client'

import {Trophy, Medal} from 'lucide-react'
import {useBotSystemPenalties, useBotsystemMembers} from '@/queries/queries'
import {Card, CardContent} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'

interface LeaderboardProps {
    botsystemId: string
}

interface LeaderboardEntry {
    user_id: string
    display_name: string
    color: string
    total_units: number
}

const COLOR_CLASSES = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-gray-500',
}

function getRankEmoji(position: number) {
    switch (position) {
        case 1:
            return '🥇'
        case 2:
            return '🥈'
        case 3:
            return '🥉'
        default:
            return '🏅'
    }
}

function getRankBadgeVariant(position: number): "default" | "secondary" | "destructive" | "outline" {
    switch (position) {
        case 1:
            return 'default'
        case 2:
            return 'secondary'
        case 3:
            return 'outline'
        default:
            return 'secondary'
    }
}

function getRankIcon(position: number) {
    switch (position) {
        case 1:
            return <Trophy className="w-5 h-5 text-yellow-500"/>
        case 2:
            return <Medal className="w-5 h-5 text-gray-400"/>
        case 3:
            return <Medal className="w-5 h-5 text-amber-600"/>
        default:
            return null
    }
}

export default function Leaderboard({botsystemId}: LeaderboardProps) {
    const {data: penalties = [], isLoading: penaltiesLoading} = useBotSystemPenalties(botsystemId)
    const {data: members = [], isLoading: membersLoading} = useBotsystemMembers(botsystemId)

    // Build leaderboard data by combining members (ensuring zeroes show) with penalties totals
    const totalsByUser = new Map<string, number>()
    for (const p of penalties) {
        const current = totalsByUser.get(p.user_id) || 0
        totalsByUser.set(p.user_id, current + (p.units || 0))
    }

    const data: LeaderboardEntry[] = members.map(m => ({
        user_id: m.user_id,
        display_name: m.profiles?.display_name || 'Ukjent',
        color: m.profiles?.color || 'blue',
        total_units: totalsByUser.get(m.user_id) || 0,
    }))

    // If there are penalties for non-members (e.g., owner not in members), include them too
    for (const [userId, total] of totalsByUser.entries()) {
        if (!data.find(d => d.user_id === userId)) {
            // Try to derive name/color from penalties profile relation
            const first = penalties.find(p => p.user_id === userId)
            data.push({
                user_id: userId,
                display_name: first?.profiles?.display_name || 'Ukjent',
                color: first?.profiles?.color || 'blue',
                total_units: total,
            })
        }
    }
    data.sort((a, b) => b.total_units - a.total_units)

    if (penaltiesLoading || membersLoading) {
        return null
    }

    if (data.length === 0) {
        return null
    }

    const totalUnits = data.reduce((sum, entry) => sum + entry.total_units, 0)
    const averageUnits = data.length > 0 ? Math.round(totalUnits / data.length) : 0

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">
                    🏆 Toppliste
                </h2>
                <p className="text-muted-foreground">
                    Hvem har flest kryss? 🍻
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    {data.map((entry, index) => {
                        const position = index + 1
                        const colorClass = COLOR_CLASSES[entry.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.blue
                        const isTopThree = position <= 3

                        return (
                            <div key={entry.user_id}>
                                <div className={`p-4 flex items-center space-x-4 hover:bg-muted/50 transition-colors ${
                                    isTopThree ? 'bg-gradient-to-r from-muted/30 to-transparent' : ''
                                }`}>
                                    {/* Rank Badge */}
                                    <Badge
                                        variant={getRankBadgeVariant(position)}
                                        className="flex items-center justify-center w-12 h-12 text-lg rounded-full"
                                    >
                                        {getRankEmoji(position)}
                                    </Badge>

                                    {/* Position Number */}
                                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                                        #{position}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${colorClass}`}/>
                                        <span className="font-medium text-lg">{entry.display_name}</span>
                                    </div>

                                    {/* Units */}
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {entry.total_units}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {entry.total_units === 1 ? 'enhet' : 'enheter'}
                                        </div>
                                    </div>

                                    {/* Trophy/Medal Icons */}
                                    {getRankIcon(position)}
                                </div>
                                {index < data.length - 1 && <Separator/>}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Fun Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {totalUnits}
                        </div>
                        <div className="text-muted-foreground text-sm">Kryss Totalt</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.length}
                        </div>
                        <div className="text-muted-foreground text-sm">Aktive Medlemmer</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {averageUnits}
                        </div>
                        <div className="text-muted-foreground text-sm">Gjennomsnittlige kryss</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
