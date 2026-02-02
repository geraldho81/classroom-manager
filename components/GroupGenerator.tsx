'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Users, Shuffle, RotateCcw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, shuffleArray } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useClassStore, type AttendanceStatus } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'

interface Group {
  id: number
  members: string[]
}

export function GroupGenerator() {
  const { students, attendance, fetchStudents, fetchAttendance, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [groupCount, setGroupCount] = useState(2)
  const [groupBy, setGroupBy] = useState<'count' | 'size'>('count')
  const [groupSize, setGroupSize] = useState(4)
  const [groups, setGroups] = useState<Group[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedGroupId, setCopiedGroupId] = useState<number | null>(null)

  const attendanceDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Sync current class with store
  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
      fetchAttendance(selectedClass.id, attendanceDate)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents, fetchAttendance, attendanceDate])

  // Build attendance map from array
  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {}
    attendance
      .filter((a) => a.date === attendanceDate)
      .forEach((a) => {
        map[a.student_id] = a.status
      })
    return map
  }, [attendance, attendanceDate])

  const hasAttendance = Object.keys(attendanceMap).length > 0
  const availableStudents = students.filter(
    (s) =>
      !s.excluded &&
      (!hasAttendance ||
        attendanceMap[s.id] === 'present' ||
        attendanceMap[s.id] === 'late')
  )

  const generateGroups = useCallback(() => {
    if (availableStudents.length === 0) return

    setIsGenerating(true)
    if (soundEnabled) {
      soundManager.playSound('whoosh')
    }

    // Shuffle students
    const shuffled = shuffleArray(availableStudents.map((s) => s.name))

    setTimeout(() => {
      let newGroups: Group[] = []

      if (groupBy === 'count') {
        // Divide into specified number of groups
        const baseSize = Math.floor(shuffled.length / groupCount)
        const extras = shuffled.length % groupCount

        let index = 0
        for (let i = 0; i < groupCount; i++) {
          const size = baseSize + (i < extras ? 1 : 0)
          newGroups.push({
            id: i + 1,
            members: shuffled.slice(index, index + size),
          })
          index += size
        }
      } else {
        // Divide into groups of specified size
        const numGroups = Math.ceil(shuffled.length / groupSize)
        for (let i = 0; i < numGroups; i++) {
          newGroups.push({
            id: i + 1,
            members: shuffled.slice(i * groupSize, (i + 1) * groupSize),
          })
        }
      }

      // Filter out empty groups
      newGroups = newGroups.filter((g) => g.members.length > 0)

      setGroups(newGroups)
      setIsGenerating(false)

      if (soundEnabled) {
        soundManager.playSound('success')
      }
    }, 300)
  }, [availableStudents, groupCount, groupBy, groupSize, soundEnabled])

  const copyGroup = useCallback((group: Group) => {
    const text = `Group ${group.id}: ${group.members.join(', ')}`
    navigator.clipboard.writeText(text)
    setCopiedGroupId(group.id)
    if (soundEnabled) {
      soundManager.playSound('click')
    }
    setTimeout(() => setCopiedGroupId(null), 2000)
  }, [soundEnabled])

  const copyAllGroups = useCallback(() => {
    const text = groups
      .map((g) => `Group ${g.id}: ${g.members.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    if (soundEnabled) {
      soundManager.playSound('chime')
    }
  }, [groups, soundEnabled])

  const clearGroups = () => {
    setGroups([])
    if (soundEnabled) {
      soundManager.playSound('click')
    }
  }

  const groupColors = [
    'bg-blue-500/10 border-blue-500/30',
    'bg-purple-500/10 border-purple-500/30',
    'bg-green-500/10 border-green-500/30',
    'bg-amber-500/10 border-amber-500/30',
    'bg-pink-500/10 border-pink-500/30',
    'bg-cyan-500/10 border-cyan-500/30',
    'bg-red-500/10 border-red-500/30',
    'bg-indigo-500/10 border-indigo-500/30',
  ]

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to generate groups.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (availableStudents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Students Available</h3>
          <p className="text-muted-foreground">
            {hasAttendance
              ? 'Mark students present in Class List to generate groups.'
              : 'Add students in the Random Picker first to generate groups.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Group By Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Group By</label>
              <div className="flex gap-2">
                <Button
                  variant={groupBy === 'count' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('count')}
                >
                  Number of Groups
                </Button>
                <Button
                  variant={groupBy === 'size' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('size')}
                >
                  Group Size
                </Button>
              </div>
            </div>

            {/* Group Count/Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {groupBy === 'count' ? 'Number of Groups' : 'Students per Group'}
              </label>
              <div className="flex gap-2">
                {(groupBy === 'count'
                  ? [2, 3, 4, 5, 6]
                  : [2, 3, 4, 5]
                ).map((num) => (
                  <Button
                    key={num}
                    variant={
                      (groupBy === 'count' ? groupCount : groupSize) === num
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      groupBy === 'count'
                        ? setGroupCount(num)
                        : setGroupSize(num)
                    }
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              size="lg"
              onClick={generateGroups}
              disabled={isGenerating}
              className="flex-1"
            >
              <Shuffle
                className={cn('mr-2 h-5 w-5', isGenerating && 'animate-spin')}
              />
              {isGenerating ? 'Generating...' : 'Generate Groups'}
            </Button>
            {groups.length > 0 && (
              <>
                <Button variant="outline" onClick={copyAllGroups}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
                <Button variant="ghost" onClick={clearGroups}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            {availableStudents.length} students available for grouping
            {hasAttendance && ' (attendance filter)'}
          </p>
        </CardContent>
      </Card>

      {/* Generated Groups */}
      {groups.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, index) => (
            <Card
              key={group.id}
              className={cn(
                'border-2',
                groupColors[index % groupColors.length]
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Group {group.id}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyGroup(group)}
                  >
                    {copiedGroupId === group.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {group.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-2 bg-background/50 rounded text-sm"
                    >
                      {member}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {group.members.length} member{group.members.length !== 1 && 's'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
