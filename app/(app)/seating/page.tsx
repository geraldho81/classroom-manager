import { SeatingChart } from '@/components/SeatingChart'

export default function SeatingPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🪑</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Seating Chart
        </h1>
        <p className="text-lg font-bold text-emerald-500">
          Pick students, tap seats — save layouts per class.
        </p>
      </div>
      <SeatingChart />
    </div>
  )
}
