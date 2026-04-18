import { LineUp } from '@/components/LineUp'

export default function LineUpPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🚶</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          Line-Up
        </h1>
        <p className="text-lg font-bold text-violet-500">
          Shuffle your class into a fair ordered line.
        </p>
      </div>
      <LineUp />
    </div>
  )
}
