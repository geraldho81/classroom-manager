'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'
import { Card, CardContent } from '@/components/ui/card'

type Pad = {
  label: string
  emoji: string
  sound: Parameters<typeof soundManager.playSound>[0]
  gradient: string
  shadow: string
}

const pads: Pad[] = [
  { label: 'Applause', emoji: '👏', sound: 'applause', gradient: 'from-amber-400 to-orange-400', shadow: 'shadow-amber-500/30' },
  { label: 'Drumroll', emoji: '🥁', sound: 'drumroll', gradient: 'from-red-400 to-rose-400', shadow: 'shadow-red-500/30' },
  { label: 'Fanfare', emoji: '🎉', sound: 'fanfare', gradient: 'from-purple-400 to-pink-400', shadow: 'shadow-purple-500/30' },
  { label: 'Sad Trombone', emoji: '😢', sound: 'fail', gradient: 'from-slate-400 to-stone-400', shadow: 'shadow-slate-500/30' },
  { label: 'Bell', emoji: '🔔', sound: 'bell', gradient: 'from-yellow-400 to-amber-400', shadow: 'shadow-yellow-500/30' },
  { label: 'Chime', emoji: '🎵', sound: 'chime', gradient: 'from-sky-400 to-blue-400', shadow: 'shadow-sky-500/30' },
  { label: 'Sparkle', emoji: '✨', sound: 'sparkle', gradient: 'from-fuchsia-400 to-pink-400', shadow: 'shadow-fuchsia-500/30' },
  { label: 'Whoosh', emoji: '💨', sound: 'whoosh', gradient: 'from-cyan-400 to-teal-400', shadow: 'shadow-cyan-500/30' },
  { label: 'Success', emoji: '🌟', sound: 'success', gradient: 'from-emerald-400 to-green-400', shadow: 'shadow-emerald-500/30' },
  { label: 'Buzzer', emoji: '⛔', sound: 'buzzer', gradient: 'from-rose-500 to-red-500', shadow: 'shadow-rose-500/30' },
  { label: 'Air Horn', emoji: '📣', sound: 'airhorn', gradient: 'from-orange-400 to-red-400', shadow: 'shadow-orange-500/30' },
  { label: 'Crickets', emoji: '🦗', sound: 'crickets', gradient: 'from-lime-400 to-emerald-400', shadow: 'shadow-lime-500/30' },
]

export function Soundboard() {
  const { soundEnabled } = useSettingsStore()
  const [activePad, setActivePad] = useState<string | null>(null)

  const handlePlay = (pad: Pad) => {
    if (!soundEnabled) return
    soundManager.playSound(pad.sound)
    setActivePad(pad.label)
    setTimeout(() => setActivePad(null), 300)
  }

  return (
    <div className="space-y-4">
      {!soundEnabled && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="font-bold text-rose-500">
              🔇 Sound is off. Enable it in Settings to play effects.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {pads.map((pad) => (
          <button
            key={pad.label}
            onClick={() => handlePlay(pad)}
            disabled={!soundEnabled}
            className={cn(
              'relative p-6 rounded-3xl transition-all duration-200 select-none',
              'bg-gradient-to-br',
              pad.gradient,
              pad.shadow,
              'shadow-lg text-white',
              soundEnabled
                ? 'hover:scale-105 hover:-rotate-2 hover:shadow-2xl active:scale-95'
                : 'opacity-40 cursor-not-allowed',
              activePad === pad.label && 'scale-110 rotate-3 shadow-2xl ring-4 ring-white/70'
            )}
          >
            <div className="text-5xl mb-2">{pad.emoji}</div>
            <div className="font-black text-lg drop-shadow">{pad.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
