'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
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
    tooltip: 'Set countdown or count-up timers for activities, tests, or transitions between lessons.',
  },
  {
    name: 'Time Loss',
    description: 'Oh no! Wasted time!',
    href: '/time-loss',
    emoji: '😱',
    gradient: 'from-red-400 to-orange-400',
    shadowColor: 'shadow-red-500/30',
    tooltip: 'Track time lost due to interruptions or off-task behavior. Great for classroom management.',
  },
  {
    name: 'Pick Me!',
    description: 'Who will be chosen?',
    href: '/picker',
    emoji: '🎯',
    gradient: 'from-purple-400 to-pink-400',
    shadowColor: 'shadow-purple-500/30',
    tooltip: 'Randomly select students to answer questions or participate in activities. Fair and fun!',
  },
  {
    name: 'Shh! Meter',
    description: 'How loud is it?',
    href: '/noise',
    emoji: '🔊',
    gradient: 'from-green-400 to-emerald-400',
    shadowColor: 'shadow-green-500/30',
    tooltip: 'Monitor classroom noise levels in real-time. Helps students self-regulate volume.',
  },
  {
    name: 'Dice & Coin',
    description: 'Roll & Flip!',
    href: '/dice',
    emoji: '🎲',
    gradient: 'from-amber-400 to-yellow-400',
    shadowColor: 'shadow-amber-500/30',
    tooltip: 'Roll dice or flip coins for games, decision-making, or random number generation.',
  },
  {
    name: 'Notes',
    description: 'Quick notes!',
    href: '/notes',
    emoji: '📝',
    gradient: 'from-pink-400 to-fuchsia-400',
    shadowColor: 'shadow-pink-500/30',
    tooltip: 'Jot down quick notes, reminders, or important points during class.',
  },
  {
    name: 'Groups',
    description: 'Make teams!',
    href: '/groups',
    emoji: '👥',
    gradient: 'from-cyan-400 to-blue-400',
    shadowColor: 'shadow-cyan-500/30',
    tooltip: 'Automatically generate random groups or teams from your class list for activities.',
  },
  {
    name: 'Class List',
    description: 'View your students!',
    href: '/class-list',
    emoji: '📋',
    gradient: 'from-teal-400 to-cyan-500',
    shadowColor: 'shadow-teal-500/30',
    tooltip: 'View and manage all students in your currently selected class.',
  },
  {
    name: 'Attendance',
    description: "Who's here today?",
    href: '/attendance',
    emoji: '✅',
    gradient: 'from-emerald-400 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    tooltip: 'Take daily attendance and review a 7-day history with CSV export.',
  },
  {
    name: 'Soundboard',
    description: 'Tap for reactions!',
    href: '/soundboard',
    emoji: '🎛️',
    gradient: 'from-amber-400 to-rose-400',
    shadowColor: 'shadow-amber-500/30',
    tooltip: 'One-tap classroom sound effects: applause, drumroll, fanfare, and more.',
  },
  {
    name: 'Voice Level',
    description: 'Set the volume!',
    href: '/voice-level',
    emoji: '🚦',
    gradient: 'from-red-400 via-amber-400 to-emerald-400',
    shadowColor: 'shadow-red-500/30',
    tooltip: 'Show the expected voice volume on the board: silent, whisper, partner, or group.',
  },
  {
    name: 'Agenda',
    description: 'Plan your lesson!',
    href: '/agenda',
    emoji: '📅',
    gradient: 'from-violet-400 to-indigo-500',
    shadowColor: 'shadow-violet-500/30',
    tooltip: 'Chain timed segments (warmup, lesson, activity, wrap-up) that auto-advance with sound.',
  },
  {
    name: 'Spinner',
    description: 'Spin the wheel!',
    href: '/spinner',
    emoji: '🎡',
    gradient: 'from-fuchsia-400 to-pink-500',
    shadowColor: 'shadow-fuchsia-500/30',
    tooltip: 'Visual spinning wheel that randomly picks a student from your class list.',
  },
  {
    name: 'Stopwatch',
    description: 'Time it!',
    href: '/stopwatch',
    emoji: '⏲️',
    gradient: 'from-indigo-400 to-purple-500',
    shadowColor: 'shadow-indigo-500/30',
    tooltip: 'Count-up stopwatch with lap splits — good for races and timed drills.',
  },
  {
    name: 'Countdown',
    description: '5, 4, 3, 2, 1...',
    href: '/countdown',
    emoji: '🚀',
    gradient: 'from-orange-400 to-pink-500',
    shadowColor: 'shadow-orange-500/30',
    tooltip: 'Oversized countdown for smooth class transitions. Plays sound per tick.',
  },
  {
    name: 'Scoreboard',
    description: 'Keep team score!',
    href: '/scoreboard',
    emoji: '🏆',
    gradient: 'from-rose-400 to-amber-400',
    shadowColor: 'shadow-rose-500/30',
    tooltip: 'Team score counter with +/- buttons, custom names, and a leader crown.',
  },
  {
    name: 'Line-Up',
    description: 'Who goes first?',
    href: '/lineup',
    emoji: '🚶',
    gradient: 'from-violet-400 to-fuchsia-500',
    shadowColor: 'shadow-violet-500/30',
    tooltip: 'Shuffle the class into a fair ordered line-up for transitions.',
  },
  {
    name: 'Clap & Echo',
    description: 'Echo the beat!',
    href: '/clap-echo',
    emoji: '👏',
    gradient: 'from-amber-400 to-rose-500',
    shadowColor: 'shadow-amber-500/30',
    tooltip: 'Play a rhythmic clap pattern for the class to echo back — classic attention reset.',
  },
  {
    name: 'Display Mode',
    description: 'Project it all!',
    href: '/display',
    emoji: '🖥️',
    gradient: 'from-indigo-400 to-purple-500',
    shadowColor: 'shadow-indigo-500/30',
    tooltip: 'Composable projector view — clock, timer, voice level, and activity label in one screen.',
  },
  {
    name: 'Behavior',
    description: 'Points & praise!',
    href: '/behavior',
    emoji: '🌟',
    gradient: 'from-emerald-400 to-amber-400',
    shadowColor: 'shadow-emerald-500/30',
    tooltip: 'Award or deduct points per student, tag reasons, and review recent events.',
  },
  {
    name: 'Hall Pass',
    description: 'Who stepped out?',
    href: '/hall-pass',
    emoji: '🚪',
    gradient: 'from-amber-400 to-yellow-500',
    shadowColor: 'shadow-amber-500/30',
    tooltip: 'Sign students out, time how long they are gone, and review a daily log.',
  },
  {
    name: 'Badges',
    description: 'Earn a sticker!',
    href: '/badges',
    emoji: '🎖️',
    gradient: 'from-amber-400 to-fuchsia-500',
    shadowColor: 'shadow-amber-500/30',
    tooltip: 'Award digital reward badges — Team Player, Bright Spark, and more.',
  },
  {
    name: 'Seating',
    description: 'Set the seats!',
    href: '/seating',
    emoji: '🪑',
    gradient: 'from-emerald-400 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    tooltip: 'Build a seating chart — place students, shuffle, and save layouts per class.',
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
              <div className="text-5xl sm:text-6xl mb-3 transition-transform group-hover:scale-125 group-hover:animate-bounce text-center">
                {tool.emoji}
              </div>

              {/* Text */}
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-lg inline-flex items-center justify-center gap-1">
                  {tool.name}
                  <div className="relative group/info">
                    <Info className="w-2.5 h-2.5 text-white/60 hover:text-white cursor-help transition-colors" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-5 w-44 p-2 bg-stone-800 text-white text-xs rounded-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-10 shadow-lg text-left font-normal">
                      {tool.tooltip}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                    </div>
                  </div>
                </h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                  {tool.description}
                </p>
              </div>

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
