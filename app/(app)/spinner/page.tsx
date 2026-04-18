import { SpinnerWheel } from '@/components/SpinnerWheel'

export default function SpinnerPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎡</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          Spinner Wheel
        </h1>
        <p className="text-lg font-bold text-fuchsia-500">
          Give it a spin — who gets picked? 🎯
        </p>
      </div>
      <SpinnerWheel />
    </div>
  )
}
