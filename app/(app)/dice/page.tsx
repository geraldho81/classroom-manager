import { DiceCoin } from '@/components/DiceCoin'

export default function DicePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎲</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Dice & Coin
        </h1>
        <p className="text-lg font-bold text-amber-400">
          Roll the dice! Flip the coin! ✨
        </p>
      </div>
      <DiceCoin />
    </div>
  )
}
