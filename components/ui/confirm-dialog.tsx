'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  emoji?: string
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolveRef?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolveRef?.(false)
  }

  const variantStyles = {
    danger: {
      bg: 'from-red-500 to-orange-500',
      emoji: '😱',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      bg: 'from-amber-500 to-yellow-500',
      emoji: '⚠️',
      buttonVariant: 'warning' as const,
    },
    info: {
      bg: 'from-blue-500 to-cyan-500',
      emoji: '🤔',
      buttonVariant: 'default' as const,
    },
  }

  const variant = options?.variant || 'warning'
  const styles = variantStyles[variant]

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="relative animate-pop-in w-full max-w-md">
            <div className={cn(
              'rounded-3xl p-1 shadow-2xl',
              'bg-gradient-to-br',
              styles.bg
            )}>
              <div className="bg-white rounded-[1.25rem] p-6">
                {/* Emoji */}
                <div className="text-6xl text-center mb-4">
                  {options?.emoji || styles.emoji}
                </div>

                {/* Title */}
                {options?.title && (
                  <h2 className="text-2xl font-black text-center mb-2 text-gray-800">
                    {options.title}
                  </h2>
                )}

                {/* Message */}
                <p className="text-lg text-center text-gray-600 font-medium mb-6">
                  {options?.message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                    className="min-w-[120px]"
                  >
                    {options?.cancelText || 'Cancel'}
                  </Button>
                  <Button
                    variant={styles.buttonVariant}
                    size="lg"
                    onClick={handleConfirm}
                    className="min-w-[120px]"
                  >
                    {options?.confirmText || 'Yes, do it!'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
