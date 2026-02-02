'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useClass } from '@/contexts/ClassContext'

const tools = [
  {
    name: 'Timer',
    description: 'Count down or up!',
    href: '/timer',
    emoji: '⏱️',
    gradient: 'from-blue-400 to-cyan-400',
    shadowColor: 'shadow-blue-500/30',
  },
  {
    name: 'Time Loss',
    description: 'Oh no! Wasted time!',
    href: '/time-loss',
    emoji: '😱',
    gradient: 'from-red-400 to-orange-400',
    shadowColor: 'shadow-red-500/30',
  },
  {
    name: 'Pick Me!',
    description: 'Who will be chosen?',
    href: '/picker',
    emoji: '🎯',
    gradient: 'from-purple-400 to-pink-400',
    shadowColor: 'shadow-purple-500/30',
  },
  {
    name: 'Shh! Meter',
    description: 'How loud is it?',
    href: '/noise',
    emoji: '🔊',
    gradient: 'from-green-400 to-emerald-400',
    shadowColor: 'shadow-green-500/30',
  },
  {
    name: 'Dice & Coin',
    description: 'Roll & Flip!',
    href: '/dice',
    emoji: '🎲',
    gradient: 'from-amber-400 to-yellow-400',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    name: 'Notes',
    description: 'Quick notes!',
    href: '/notes',
    emoji: '📝',
    gradient: 'from-pink-400 to-fuchsia-400',
    shadowColor: 'shadow-pink-500/30',
  },
  {
    name: 'Groups',
    description: 'Make teams!',
    href: '/groups',
    emoji: '👥',
    gradient: 'from-cyan-400 to-blue-400',
    shadowColor: 'shadow-cyan-500/30',
  },
  {
    name: 'Class List',
    description: 'View your students!',
    href: '/class-list',
    emoji: '📋',
    gradient: 'from-teal-400 to-cyan-500',
    shadowColor: 'shadow-teal-500/30',
  },
]

export default function Dashboard() {
  const { selectedClass } = useClass()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Fun Header */}
      <div className="text-center mb-10">
        <div className="inline-block animate-float">
          <span className="text-6xl">🎓</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mt-4 mb-3 text-stone-800">
          What should we do today?
        </h1>
        {selectedClass ? (
          <p className="text-xl text-purple-600 font-bold">
            {selectedClass.name} - Pick a tool and let&apos;s learn! ✨
          </p>
        ) : (
          <p className="text-xl text-purple-600 font-bold">
            Create or select a class to get started! ✨
          </p>
        )}
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tools.map((tool, index) => (
          <Link key={tool.name} href={tool.href}>
            <div
              className={cn(
                'group relative p-6 rounded-3xl cursor-pointer transition-all duration-300',
                'bg-gradient-to-br',
                tool.gradient,
                'hover:scale-110 hover:-rotate-2 hover:shadow-2xl',
                tool.shadowColor,
                'shadow-lg'
              )}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Emoji */}
              <div className="text-5xl sm:text-6xl mb-3 transition-transform group-hover:scale-125 group-hover:animate-bounce">
                {tool.emoji}
              </div>

              {/* Text */}
              <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-lg">
                {tool.name}
              </h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                {tool.description}
              </p>

              {/* Sparkle effect on hover */}
              <div className="absolute top-2 right-2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                ✨
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Fun Footer Message */}
      <div className="mt-8 text-center">
        <p className="text-lg font-bold text-purple-500 animate-pulse">
          🎉 Let&apos;s make learning awesome today! 🎉
        </p>
      </div>
    </div>
  )
}
