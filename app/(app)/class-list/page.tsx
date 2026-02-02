import { ClassList } from '@/components/ClassList'

export default function ClassListPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📋</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Class List
        </h1>
        <p className="text-lg font-bold text-purple-400">
          Build your roster and take attendance. ✅
        </p>
      </div>
      <ClassList />
    </div>
  )
}
