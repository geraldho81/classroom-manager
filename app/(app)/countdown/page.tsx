import { CountdownTransition } from '@/components/CountdownTransition'

export default function CountdownPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🚀</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          Countdown
        </h1>
        <p className="text-lg font-bold text-orange-500">
          Big transition countdown — project for the class. 🔢
        </p>
      </div>
      <CountdownTransition />
    </div>
  )
}
