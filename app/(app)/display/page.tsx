import { ClassroomDisplay } from '@/components/ClassroomDisplay'

export default function DisplayPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🖥️</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Display Mode
        </h1>
        <p className="text-lg font-bold text-indigo-500">
          Project this on the board — clock, timer, voice level, activity.
        </p>
      </div>
      <ClassroomDisplay />
    </div>
  )
}
