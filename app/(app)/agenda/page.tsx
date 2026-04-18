import { LessonAgenda } from '@/components/LessonAgenda'

export default function AgendaPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📅</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
          Lesson Agenda
        </h1>
        <p className="text-lg font-bold text-violet-500">
          Chain timed segments — auto-advance with sound. 🔔
        </p>
      </div>
      <LessonAgenda />
    </div>
  )
}
