import { Scoreboard } from '@/components/Scoreboard'

export default function ScoreboardPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
          Scoreboard
        </h1>
        <p className="text-lg font-bold text-rose-500">
          Keep score for team games and challenges.
        </p>
      </div>
      <Scoreboard />
    </div>
  )
}
