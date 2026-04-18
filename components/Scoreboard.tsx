'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus, RotateCcw, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type Team = {
  id: string
  name: string
  score: number
  gradient: string
}

const TEAM_GRADIENTS = [
  'from-rose-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-purple-500',
  'from-cyan-400 to-teal-500',
]

const STORAGE_KEY = 'classroom-scoreboard-v1'

const defaultTeams: Team[] = [
  { id: 't1', name: 'Red Team', score: 0, gradient: TEAM_GRADIENTS[0] },
  { id: 't2', name: 'Blue Team', score: 0, gradient: TEAM_GRADIENTS[1] },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function Scoreboard() {
  const { soundEnabled } = useSettingsStore()
  const [teams, setTeams] = useState<Team[]>(defaultTeams)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.every((t) => t.id && t.name && typeof t.score === 'number')) {
          setTeams(parsed)
        }
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
  }, [teams, hydrated])

  const adjust = (id: string, delta: number) => {
    setTeams((t) =>
      t.map((team) =>
        team.id === id ? { ...team, score: team.score + delta } : team
      )
    )
    if (soundEnabled) soundManager.playSound(delta > 0 ? 'pop' : 'click')
  }

  const rename = (id: string, name: string) => {
    setTeams((t) => t.map((team) => (team.id === id ? { ...team, name } : team)))
  }

  const addTeam = () => {
    if (teams.length >= 6) return
    setTeams((t) => [
      ...t,
      {
        id: uid(),
        name: `Team ${t.length + 1}`,
        score: 0,
        gradient: TEAM_GRADIENTS[t.length % TEAM_GRADIENTS.length],
      },
    ])
  }

  const removeTeam = (id: string) => {
    setTeams((t) => t.filter((team) => team.id !== id))
  }

  const resetAll = () => {
    setTeams((t) => t.map((team) => ({ ...team, score: 0 })))
    if (soundEnabled) soundManager.playSound('sparkle')
  }

  const max = teams.length > 0 ? Math.max(...teams.map((t) => t.score)) : 0

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'grid gap-4',
          teams.length <= 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : teams.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 lg:grid-cols-3'
        )}
      >
        {teams.map((team) => {
          const isLeader = teams.length > 1 && team.score === max && max !== 0
          return (
            <Card
              key={team.id}
              className={cn(
                'relative overflow-hidden bg-gradient-to-br text-white shadow-lg transition-transform',
                team.gradient,
                isLeader && 'ring-4 ring-yellow-300 scale-[1.02]'
              )}
            >
              {isLeader && (
                <div className="absolute top-2 right-2 text-3xl drop-shadow-md">
                  👑
                </div>
              )}
              <CardContent className="p-6 text-center">
                <Input
                  value={team.name}
                  onChange={(e) => rename(team.id, e.target.value)}
                  className="bg-white/20 border-white/30 text-white text-center font-black text-lg placeholder:text-white/60"
                />
                <div className="mt-5 text-7xl sm:text-8xl font-black tabular-nums drop-shadow-md">
                  {team.score}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <Button
                    size="icon-lg"
                    variant="outline"
                    onClick={() => adjust(team.id, -1)}
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon-lg"
                    variant="outline"
                    onClick={() => adjust(team.id, 1)}
                    className="bg-white text-stone-800 hover:bg-white/90"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon-lg"
                    variant="ghost"
                    onClick={() => adjust(team.id, 5)}
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30 text-sm font-black"
                  >
                    +5
                  </Button>
                </div>
                {teams.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeam(team.id)}
                    className="mt-4 text-white/70 hover:text-white hover:bg-white/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          onClick={addTeam}
          disabled={teams.length >= 6}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add Team
        </Button>
        <Button size="lg" variant="outline" onClick={resetAll}>
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset Scores
        </Button>
      </div>
    </div>
  )
}
