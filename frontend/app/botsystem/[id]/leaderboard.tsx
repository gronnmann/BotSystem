'use client'

import { TrophyIcon, MedalIcon } from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  display_name: string
  color: string
  total_units: number
}

interface LeaderboardProps {
  data: LeaderboardEntry[]
}

const COLOR_CLASSES = {
  blue: 'bg-blue-500 text-blue-500',
  green: 'bg-green-500 text-green-500',
  red: 'bg-red-500 text-red-500',
  purple: 'bg-purple-500 text-purple-500',
  orange: 'bg-orange-500 text-orange-500',
  teal: 'bg-teal-500 text-teal-500',
}

function getRankEmoji(position: number) {
  switch (position) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return '🏅'
  }
}

function getRankColor(position: number) {
  switch (position) {
    case 1: return 'text-yellow-600 bg-yellow-50'
    case 2: return 'text-gray-600 bg-gray-50'
    case 3: return 'text-amber-600 bg-amber-50'
    default: return 'text-gray-500 bg-white'
  }
}

export default function Leaderboard({ data }: LeaderboardProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No penalties yet!</h2>
          <p className="text-gray-500">
            The leaderboard will appear once some penalties are added. 
            Who will be the first to earn their place? 🎯
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Penalty Leaderboard
        </h2>
        <p className="text-gray-600">
          Who&apos;s collected the most penalty units? 🍻
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {data.map((entry, index) => {
            const position = index + 1
            const colorClass = COLOR_CLASSES[entry.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.blue
            const [bgColor, textColor] = colorClass.split(' ')

            return (
              <div
                key={entry.user_id}
                className={`p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${
                  position <= 3 ? 'bg-gradient-to-r from-transparent to-gray-50' : ''
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankColor(position)}`}>
                  <span className="text-2xl">
                    {getRankEmoji(position)}
                  </span>
                </div>

                {/* Position Number */}
                <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                  #{position}
                </div>

                {/* User Info */}
                <div className="flex-1 flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${bgColor}`} />
                  <span className="font-medium text-gray-900 text-lg">
                    {entry.display_name}
                  </span>
                </div>

                {/* Units */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {entry.total_units}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.total_units === 1 ? 'unit' : 'units'}
                  </div>
                </div>

                {/* Trophy for winner */}
                {position === 1 && (
                  <div className="text-yellow-500">
                    <TrophyIcon className="w-6 h-6" />
                  </div>
                )}
                {position === 2 && (
                  <div className="text-gray-400">
                    <MedalIcon className="w-6 h-6" />
                  </div>
                )}
                {position === 3 && (
                  <div className="text-amber-600">
                    <MedalIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Fun Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.reduce((sum, entry) => sum + entry.total_units, 0)}
          </div>
          <div className="text-gray-500">Total Units</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.length}
          </div>
          <div className="text-gray-500">Active Members</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.length > 0 ? Math.round(data.reduce((sum, entry) => sum + entry.total_units, 0) / data.length) : 0}
          </div>
          <div className="text-gray-500">Average Units</div>
        </div>
      </div>
    </div>
  )
}