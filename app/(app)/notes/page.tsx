import { ClassNotes } from '@/components/ClassNotes'

export default function NotesPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📝</div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
          Class Notes
        </h1>
        <p className="text-lg font-bold text-pink-400">
          Quick notes for class moments! ✏️
        </p>
      </div>
      <ClassNotes />
    </div>
  )
}
