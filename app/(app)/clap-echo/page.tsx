import { ClapEcho } from '@/components/ClapEcho'

export default function ClapEchoPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👏</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
          Clap &amp; Echo
        </h1>
        <p className="text-lg font-bold text-amber-500">
          Play a rhythm — class echoes it back.
        </p>
      </div>
      <ClapEcho />
    </div>
  )
}
