import { HallPassTracker } from '@/components/HallPassTracker'

export default function HallPassPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🚪</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Hall Pass
        </h1>
        <p className="text-lg font-bold text-amber-500">
          Sign students out, watch the timer, close the loop.
        </p>
      </div>
      <HallPassTracker />
    </div>
  )
}
