import { RewardBadges } from '@/components/RewardBadges'

export default function BadgesPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎖️</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-500 to-fuchsia-500 bg-clip-text text-transparent">
          Reward Badges
        </h1>
        <p className="text-lg font-bold text-amber-500">
          Award digital badges — they stick to the student.
        </p>
      </div>
      <RewardBadges />
    </div>
  )
}
