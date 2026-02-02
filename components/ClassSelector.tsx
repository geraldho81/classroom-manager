'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { useClass } from '@/contexts/ClassContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function ClassSelector() {
  const { classes, selectedClass, selectClass, createClass, loading } = useClass()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newClassName.trim()) return
    setCreating(true)
    await createClass(newClassName.trim())
    setNewClassName('')
    setShowCreate(false)
    setIsOpen(false)
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-3 bg-white/50 rounded-xl animate-pulse border-2 border-stone-200">
        <div className="h-5 bg-stone-200 rounded w-24" />
      </div>
    )
  }

  return (
    <div className="relative font-heading">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-all text-stone-700 font-bold",
          "bg-white border-2 border-stone-200 rounded-organic shadow-sm hover:shadow-md hover:-translate-y-0.5"
        )}
      >
        <span className="truncate text-lg">
          {selectedClass ? (
            <>📚 {selectedClass.name}</>
          ) : (
            <>📚 No class selected</>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 transition-transform text-stone-400',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setShowCreate(false)
            }}
          />
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-organic overflow-hidden z-50 border-2 border-stone-200 shadow-[4px_4px_0px_#E6E2D6] p-2">
            <div className="max-h-60 overflow-y-auto pr-1">
              {classes.length === 0 ? (
                <div className="p-4 text-center text-stone-500 text-sm">
                  No classes yet. Create one below!
                </div>
              ) : (
                classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      selectClass(cls.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors text-left font-bold text-stone-600',
                      selectedClass?.id === cls.id
                        ? 'bg-primary/20 text-stone-800'
                        : 'hover:bg-stone-50'
                    )}
                  >
                    <span className="text-xl">📚</span>
                    <span className="flex-1 truncate">
                      {cls.name}
                    </span>
                    {selectedClass?.id === cls.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t-2 border-dashed border-stone-200 pt-2 mt-2">
              {showCreate ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Class name..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating || !newClassName.trim()}
                    className="h-9 px-3"
                  >
                    {creating ? '...' : 'Add'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-stone-500 font-bold hover:text-stone-800 hover:bg-stone-50"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Class
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
