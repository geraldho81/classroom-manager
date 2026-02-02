import { NoiseMeter } from '@/components/NoiseMeter'

export default function NoisePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔊</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Shh! Meter
        </h1>
        <p className="text-lg font-bold text-green-400">
          How quiet can we be? Let&apos;s find out! 🤫
        </p>
      </div>
      <NoiseMeter />
    </div>
  )
}
