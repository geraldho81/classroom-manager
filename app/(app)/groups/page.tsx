import { GroupGenerator } from '@/components/GroupGenerator'

export default function GroupsPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👥</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          Group Maker
        </h1>
        <p className="text-lg font-bold text-cyan-400">
          Let&apos;s make some awesome teams! 🏆
        </p>
      </div>
      <GroupGenerator />
    </div>
  )
}
