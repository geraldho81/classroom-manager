import { StudentPicker } from '@/components/StudentPicker'

export default function PickerPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Pick Me!
        </h1>
        <p className="text-lg font-bold text-purple-400">
          Who will be the lucky one? 🍀
        </p>
      </div>
      <StudentPicker />
    </div>
  )
}
