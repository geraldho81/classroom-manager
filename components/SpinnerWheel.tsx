'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Play, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useClassStore, type Student } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'

const PALETTE = [
  '#FCA5A5', '#FDBA74', '#FCD34D', '#86EFAC',
  '#67E8F9', '#93C5FD', '#C4B5FD', '#F0ABFC',
  '#F9A8D4', '#FDE68A', '#A7F3D0', '#BAE6FD',
]

const SIZE = 360
const CENTER = SIZE / 2
const RADIUS = CENTER - 8

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function slicePath(startDeg: number, endDeg: number) {
  const start = polarToXY(startDeg, RADIUS)
  const end = polarToXY(endDeg, RADIUS)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export function SpinnerWheel() {
  const {
    students,
    fetchStudents,
    setCurrentClass,
  } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<Student | null>(null)
  const [history, setHistory] = useState<Student[]>([])

  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  const wheelStudents = useMemo(
    () => students.filter((s) => !s.excluded),
    [students]
  )

  const sliceDeg = wheelStudents.length > 0 ? 360 / wheelStudents.length : 0

  const spin = useCallback(() => {
    if (isSpinning || wheelStudents.length === 0) return
    setWinner(null)
    setIsSpinning(true)
    if (soundEnabledRef.current) soundManager.playSound('whoosh')

    const winnerIndex = Math.floor(Math.random() * wheelStudents.length)
    const jitter = (Math.random() - 0.5) * (sliceDeg * 0.7)
    const targetCenter = winnerIndex * sliceDeg + sliceDeg / 2
    const fullSpins = 6
    const finalRotation =
      rotation + 360 * fullSpins + (360 - targetCenter) + jitter

    setRotation(finalRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setWinner(wheelStudents[winnerIndex])
      setHistory((h) => [wheelStudents[winnerIndex], ...h].slice(0, 5))
      if (soundEnabledRef.current) soundManager.playSound('fanfare')
    }, 4100)
  }, [isSpinning, wheelStudents, rotation, sliceDeg])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ') {
        e.preventDefault()
        spin()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spin])

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to use the spinner.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                  : 'none',
              }}
            >
              {wheelStudents.length === 0 ? (
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#E5E7EB" />
              ) : (
                wheelStudents.map((s, i) => {
                  const start = i * sliceDeg
                  const end = start + sliceDeg
                  const textAngle = start + sliceDeg / 2
                  const textPos = polarToXY(textAngle, RADIUS * 0.62)
                  return (
                    <g key={s.id}>
                      <path
                        d={slicePath(start, end)}
                        fill={PALETTE[i % PALETTE.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        transform={`rotate(${textAngle} ${textPos.x} ${textPos.y})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={wheelStudents.length > 20 ? 10 : wheelStudents.length > 12 ? 13 : 16}
                        fontWeight="900"
                        fill="#1F2937"
                      >
                        {s.name.length > 14 ? s.name.slice(0, 13) + '…' : s.name}
                      </text>
                    </g>
                  )
                })
              )}
              <circle cx={CENTER} cy={CENTER} r={22} fill="white" stroke="#1F2937" strokeWidth={3} />
            </svg>
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0"
              style={{
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '24px solid #1F2937',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
              }}
            />
          </div>

          <Button
            variant="fun"
            size="xl"
            onClick={spin}
            disabled={isSpinning || wheelStudents.length === 0}
            className="mt-8 min-w-[200px] text-xl"
          >
            <Play className={cn('mr-2 h-5 w-5', isSpinning && 'animate-spin')} />
            {isSpinning ? 'Spinning…' : 'Spin!'}
          </Button>
          <p className="mt-4 text-sm font-bold text-stone-400">
            Press <kbd className="px-2 py-0.5 bg-stone-100 rounded border">Space</kbd> to spin
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-stone-500 mb-2">
              Winner
            </p>
            {winner ? (
              <p className="text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                {winner.name}
              </p>
            ) : (
              <p className="text-3xl font-black text-stone-300">
                {wheelStudents.length > 0 ? 'Give it a spin!' : 'Add students first'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-black text-stone-700 mb-3">Recent winners</h3>
            {history.length === 0 ? (
              <p className="text-sm text-stone-400">No spins yet.</p>
            ) : (
              <ol className="space-y-2">
                {history.map((s, i) => (
                  <li
                    key={`${s.id}-${i}`}
                    className="flex items-center gap-2 text-stone-700"
                  >
                    <span className="text-lg font-bold text-purple-500">
                      #{i + 1}
                    </span>
                    <span className="font-bold">{s.name}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-stone-500 font-bold">
              Wheel includes {wheelStudents.length} student
              {wheelStudents.length === 1 ? '' : 's'}. Excluded students are
              hidden — toggle exclusion from the Class List.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
