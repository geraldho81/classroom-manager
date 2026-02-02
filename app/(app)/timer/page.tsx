import { Timer } from '@/components/Timer'

export default function TimerPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⏱️</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Timer
        </h1>
        <p className="text-lg font-bold text-blue-400">
          Count down or count up - you decide! 🚀
        </p>
      </div>
      <Timer />
    </div>
  )
}
