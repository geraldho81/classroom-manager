import { VoiceLevel } from '@/components/VoiceLevel'

export default function VoiceLevelPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🚦</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
          Voice Level
        </h1>
        <p className="text-lg font-bold text-stone-500">
          Set the expected volume — project it for the class.
        </p>
      </div>
      <VoiceLevel />
    </div>
  )
}
