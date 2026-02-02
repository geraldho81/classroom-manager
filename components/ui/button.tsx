'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-organic text-lg font-heading transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[2px] active:shadow-none border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border-stone-800/20 hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground border-destructive-foreground/20 hover:bg-destructive/90',
        outline:
          'border-stone-800/20 bg-white hover:bg-stone-50 text-stone-700',
        secondary:
          'bg-secondary text-secondary-foreground border-stone-800/20 hover:bg-secondary/80',
        ghost: 'border-transparent shadow-none hover:bg-stone-100 hover:shadow-none hover:translate-y-0 active:translate-y-0 text-stone-600',
        link: 'text-stone-600 underline-offset-4 hover:underline border-transparent shadow-none hover:shadow-none hover:translate-y-0',
        success:
          'bg-secondary text-secondary-foreground border-stone-800/20 hover:bg-secondary/90',
        warning:
          'bg-amber-200 text-amber-900 border-stone-800/20 hover:bg-amber-300',
        fun:
          'bg-accent text-accent-foreground border-stone-800/20 hover:bg-accent/90',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 text-base',
        lg: 'h-14 px-8 text-xl',
        xl: 'h-16 px-10 text-2xl',
        icon: 'h-10 w-10 p-2',
        'icon-lg': 'h-14 w-14 p-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
