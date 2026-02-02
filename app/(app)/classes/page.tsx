'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, BookOpen, Sparkles } from 'lucide-react'
import { useClass } from '@/contexts/ClassContext'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function ClassesPage() {
  const {
    classes,
    selectedClass,
    selectClass,
    createClass,
    updateClass,
    deleteClass,
    loading,
  } = useClass()
  const confirm = useConfirm()

  const [newClassName, setNewClassName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = async () => {
    if (!newClassName.trim()) return
    setCreating(true)
    await createClass(newClassName.trim())
    setNewClassName('')
    setCreating(false)
  }

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) return
    await updateClass(editingId, editingName.trim())
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = async (classId: string, className: string) => {
    const ok = await confirm({
      title: 'Close this book?',
      message: `Are you sure you want to delete "${className}"? All the stories (students and records) within it will be lost forever!`,
      confirmText: 'Yes, delete it',
      variant: 'danger',
      emoji: '🗑️',
    })

    if (ok) {
      await deleteClass(classId)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-stone-200 rounded-lg w-1/3 mx-auto" />
          <div className="h-64 bg-stone-100 rounded-organic border-2 border-stone-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="inline-block animate-float-gentle text-6xl mb-4">
          📚
        </div>
        <h1 className="text-5xl font-heading mb-2 text-stone-800">
          My Classes
        </h1>
        <p className="text-xl font-heading text-stone-500">
          Manage your library of classrooms
        </p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b-2 border-dashed border-stone-100">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Class Collection ({classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Create new class form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreate()
            }}
            className="flex gap-3 mb-8 p-4 bg-stone-50 rounded-organic border-2 border-stone-100"
          >
            <Input
              placeholder="Name of your new class..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="text-lg bg-white border-stone-200"
            />
            <Button
              type="submit"
              disabled={creating || !newClassName.trim()}
              variant="secondary"
              className="shrink-0"
            >
              <Plus className="h-5 w-5 mr-1" />
              {creating ? 'Creating...' : 'Create Class'}
            </Button>
          </form>

          {/* Class list */}
          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-center py-16 opacity-60">
                <p className="text-6xl mb-4 grayscale">📖</p>
                <p className="text-2xl font-heading text-stone-400">The library is empty...</p>
                <p className="text-stone-400">
                  Create your first class to begin the journey!
                </p>
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group relative',
                    'border-2',
                    selectedClass?.id === cls.id
                      ? 'bg-amber-50 border-amber-200 shadow-sm'
                      : 'bg-white border-stone-100 hover:border-primary/30 hover:shadow-md hover:-translate-y-1'
                  )}
                >
                  {editingId === cls.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 font-heading text-xl"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate()
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditingName('')
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpdate}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(null)
                          setEditingName('')
                        }}
                        className="text-stone-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => selectClass(cls.id)}
                        className="flex-1 flex items-center gap-4 text-left"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-transform group-hover:scale-110",
                          selectedClass?.id === cls.id ? "bg-amber-100 border-amber-200" : "bg-stone-50 border-stone-100"
                        )}>
                          📚
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-heading font-bold text-xl text-stone-800">
                              {cls.name}
                            </p>
                            {selectedClass?.id === cls.id && (
                              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-stone-400 font-bold uppercase tracking-wide">
                            Started {new Date(cls.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedClass?.id === cls.id && (
                          <span className="ml-auto px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                            Currently Reading
                          </span>
                        )}
                      </button>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(cls.id)
                            setEditingName(cls.name)
                          }}
                          className="text-stone-400 hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cls.id, cls.name)}
                          className="text-stone-400 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
