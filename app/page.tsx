'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const tools = [
    {
        name: 'Timer',
        description: 'Keep track of time',
        href: '/timer',
        emoji: '⏱️',
        color: 'bg-blue-100 border-blue-200 text-blue-700',
        shadow: 'shadow-[4px_4px_0px_#93c5fd]',
    },
    {
        name: 'Time Loss',
        description: 'Wasted moments',
        href: '/time-loss',
        emoji: '😱',
        color: 'bg-rose-100 border-rose-200 text-rose-700',
        shadow: 'shadow-[4px_4px_0px_#fda4af]',
    },
    {
        name: 'Pick Me!',
        description: 'Choose a student',
        href: '/picker',
        emoji: '🎯',
        color: 'bg-purple-100 border-purple-200 text-purple-700',
        shadow: 'shadow-[4px_4px_0px_#d8b4fe]',
    },
    {
        name: 'Shh! Meter',
        description: 'Volume monitor',
        href: '/noise',
        emoji: '🔊',
        color: 'bg-cyan-100 border-cyan-200 text-cyan-700',
        shadow: 'shadow-[4px_4px_0px_#67e8f9]',
    },
    {
        name: 'Dice & Coin',
        description: 'Roll & Flip',
        href: '/dice',
        emoji: '🎲',
        color: 'bg-orange-100 border-orange-200 text-orange-700',
        shadow: 'shadow-[4px_4px_0px_#fdba74]',
    },
    {
        name: 'Notes',
        description: 'Quick scribbles',
        href: '/notes',
        emoji: '📝',
        color: 'bg-pink-100 border-pink-200 text-pink-700',
        shadow: 'shadow-[4px_4px_0px_#f9a8d4]',
    },
    {
        name: 'Groups',
        description: 'Team builder',
        href: '/groups',
        emoji: '👥',
        color: 'bg-indigo-100 border-indigo-200 text-indigo-700',
        shadow: 'shadow-[4px_4px_0px_#a5b4fc]',
    },
    {
        name: 'My Classes',
        description: 'Manage Classes',
        href: '/classes',
        emoji: '📚',
        color: 'bg-stone-100 border-stone-200 text-stone-700',
        shadow: 'shadow-[4px_4px_0px_#d6d3c9]',
    }
]

export default function Dashboard() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Storybook Header */}
            <div className="text-center mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-30 -z-10" />
                <h1 className="text-6xl font-heading mb-4 text-stone-800 animate-float-gentle">
                    What shall we do today?
                </h1>
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {tools.map((tool, index) => (
                    <Link key={tool.name} href={tool.href}>
                        <div
                            className={cn(
                                'group relative p-6 h-full flex flex-col items-center text-center cursor-pointer transition-all duration-300',
                                'bg-white border-2 rounded-organic',
                                tool.color,
                                tool.shadow,
                                'hover:-translate-y-2 hover:rotate-1'
                            )}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                            }}
                        >
                            {/* Pin/Tape Effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-300 rounded-full shadow-sm border border-stone-400 opacity-80" />

                            {/* Emoji */}
                            <div className="text-5xl mb-4 transition-transform group-hover:scale-125 group-hover:rotate-12">
                                {tool.emoji}
                            </div>

                            {/* Text */}
                            <h3 className="text-2xl font-heading font-bold mb-1">
                                {tool.name}
                            </h3>
                            <p className="text-base text-stone-500 font-medium">
                                {tool.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer Message */}
            <div className="mt-16 text-center">
                <p className="text-xl font-heading text-stone-400 italic">
                    ~ Every day is a new adventure ~
                </p>
            </div>
        </div>
    )
}
