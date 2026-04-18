import { Stopwatch } from '@/components/Stopwatch'

export default function StopwatchPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⏲️</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Stopwatch
        </h1>
        <p className="text-lg font-bold text-indigo-500">
          Time activities and capture lap splits. 🏁
        </p>
      </div>
      <Stopwatch />
    </div>
  )
}
