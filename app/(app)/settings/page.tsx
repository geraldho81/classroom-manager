'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Clock, Trash2, Plus, X, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClassStore } from '@/stores/classStore'
import { useAuth } from '@/contexts/AuthContext'
import { useClass } from '@/contexts/ClassContext'

export default function SettingsPage() {
  const confirm = useConfirm()
  const { user } = useAuth()
  const { selectedClass } = useClass()
  const {
    soundEnabled,
    volume,
    toggleSound,
    setVolume,
    timerPresets,
    addTimerPreset,
    removeTimerPreset,
    noiseThreshold,
    setNoiseThreshold,
    fetchSettings,
    initialized,
  } = useSettingsStore()

  const { students, importStudents, clearAllStudents, fetchStudents, setCurrentClass } = useClassStore()

  const [newPresetMinutes, setNewPresetMinutes] = useState('')
  const [importText, setImportText] = useState('')

  // Fetch settings and students on mount
  useEffect(() => {
    if (user && !initialized) {
      fetchSettings(user.id)
    }
  }, [user, initialized, fetchSettings])

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  const handleAddPreset = () => {
    const minutes = parseInt(newPresetMinutes)
    if (minutes > 0 && minutes <= 180) {
      addTimerPreset(minutes * 60)
      setNewPresetMinutes('')
    }
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    soundManager.setVolume(value)
  }

  const testSound = () => {
    soundManager.playSound('bell')
  }

  const handleImportStudents = async () => {
    const names = importText
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter((n) => n)
    if (names.length > 0) {
      await importStudents(names)
      setImportText('')
    }
  }

  const exportData = () => {
    const data = {
      students: students,
      settings: {
        timerPresets,
        noiseThreshold,
        soundEnabled,
        volume,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `classroom-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Classroom Manager experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Sound Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sound Settings
            </CardTitle>
            <CardDescription>
              Configure audio alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Sound Effects</span>
              <Button
                variant={soundEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={toggleSound}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Enabled
                  </>
                ) : (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" /> Disabled
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onValueChange={handleVolumeChange}
                  disabled={!soundEnabled}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testSound}
                  disabled={!soundEnabled}
                >
                  Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timer Presets
            </CardTitle>
            <CardDescription>
              Quick access timer durations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {timerPresets.map((seconds) => (
                <div
                  key={seconds}
                  className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg group"
                >
                  <span className="text-sm font-medium">
                    {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                  </span>
                  <button
                    onClick={() => removeTimerPreset(seconds)}
                    className="opacity-0 group-hover:opacity-100 ml-1 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Minutes"
                value={newPresetMinutes}
                onChange={(e) => setNewPresetMinutes(e.target.value)}
                min={1}
                max={180}
                className="w-32"
              />
              <Button onClick={handleAddPreset} disabled={!newPresetMinutes}>
                <Plus className="mr-2 h-4 w-4" />
                Add Preset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Noise Monitor Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Noise Monitor</CardTitle>
            <CardDescription>
              Configure noise level thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Alert Threshold</span>
                <span>{noiseThreshold}%</span>
              </div>
              <Slider
                min={10}
                max={90}
                step={5}
                value={noiseThreshold}
                onValueChange={setNoiseThreshold}
              />
              <p className="text-xs text-muted-foreground">
                An alert will play when noise exceeds this level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Class List Management */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>Class List - {selectedClass.name}</CardTitle>
              <CardDescription>
                Import and manage your student list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span>{students.length} students in class list</span>
                {students.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Remove All Students?',
                        message: 'This will clear your entire class list. Are you sure?',
                        confirmText: 'Yes, clear all',
                        variant: 'danger',
                        emoji: '🗑️',
                      })
                      if (ok) clearAllStudents()
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Import Students</label>
                <Textarea
                  placeholder="Paste student names (one per line or comma-separated)"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleImportStudents}
                  disabled={!importText.trim()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Students
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export and backup your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={exportData} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export Class Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your data is stored securely in Supabase. Export to keep a local backup.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About The Classroom Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>The Classroom Manager</strong> is a browser-based classroom
                management tool for teachers.
              </p>
              <p>
                Version 0.2.0 • Built with Next.js • Powered by Supabase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
