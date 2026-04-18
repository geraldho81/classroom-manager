import { BehaviorPoints } from '@/components/BehaviorPoints'

export default function BehaviorPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌟</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
          Behavior Points
        </h1>
        <p className="text-lg font-bold text-emerald-500">
          Award and deduct points — track recent events with reasons.
        </p>
      </div>
      <BehaviorPoints />
    </div>
  )
}
