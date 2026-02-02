import { TimeLoss } from '@/components/TimeLoss'

export default function TimeLossPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">😱</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Time Loss Tracker
        </h1>
        <p className="text-lg font-bold text-red-400">
          Oh no! Let&apos;s see how much time we&apos;re losing! ⏰
        </p>
      </div>
      <TimeLoss />
    </div>
  )
}
