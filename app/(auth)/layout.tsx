import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-black text-stone-800 tracking-tight">
            Classroom Manager
          </h1>
          <p className="text-stone-500 font-bold text-lg mt-2 font-heading">
            Learning is Fun! ✨
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
