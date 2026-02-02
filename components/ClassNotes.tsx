'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, Download, Search, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useClassStore } from '@/stores/classStore'
import { useClass } from '@/contexts/ClassContext'

export function ClassNotes() {
  const { notes, addNote, removeNote, clearNotes, fetchNotes, setCurrentClass } = useClassStore()
  const { selectedClass } = useClass()
  const confirm = useConfirm()
  const [newNote, setNewNote] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Sync current class with store
  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchNotes(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchNotes])

  const handleAddNote = useCallback(async () => {
    if (newNote.trim()) {
      await addNote(newNote.trim())
      setNewNote('')
    }
  }, [newNote, addNote])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  const exportNotes = useCallback(() => {
    const content = notes
      .map((note) => `[${note.date} ${note.created_at}] ${note.text}`)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `class-notes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [notes])

  const filteredNotes = searchQuery
    ? notes.filter((note) =>
      note.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : notes

  // Group notes by date
  const notesByDate = filteredNotes.reduce(
    (acc, note) => {
      const dateKey = note.date
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(note)
      return acc
    },
    {} as Record<string, typeof notes>
  )

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to view notes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Input Section */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Quick Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Type a quick note... (Press Enter to save)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                className="resize-none"
              />
              <Button onClick={handleAddNote} className="w-full" disabled={!newNote.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Notes are auto-timestamped when saved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{notes.length}</div>
                <div className="text-xs text-muted-foreground">Total Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Object.keys(notesByDate).length}
                </div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Notes History</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full sm:w-[200px]"
                  />
                </div>
                {notes.length > 0 && (
                  <>
                    <Button variant="outline" size="icon" onClick={exportNotes}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Delete All Notes?',
                          message: 'This will remove all your notes forever!',
                          confirmText: 'Yes, delete all',
                          variant: 'danger',
                          emoji: '📝',
                        })
                        if (ok) clearNotes()
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notes yet. Add your first note!</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notes match your search.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {Object.entries(notesByDate).map(([date, dateNotes]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-card py-2 mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {date === new Date().toISOString().split('T')[0]
                          ? 'Today'
                          : new Date(date).toLocaleDateString()}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {dateNotes.map((note) => (
                        <div
                          key={note.id}
                          className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(note.created_at).toLocaleDateString()} • {formatTime(note.created_at)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
