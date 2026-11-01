import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { HelpCircle, ArrowLeft } from "lucide-react"
import TryoutResultClient from "./TryoutResultClient"

export const dynamic = 'force-dynamic'

export default async function TryoutResultPage({
  params
}: {
  params: Promise<{ tryoutId: string }>
}) {
  const { tryoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch tryout details
  const { data: tryout } = await supabase
    .from('tryouts')
    .select('id, title, program_type, duration_minutes')
    .eq('id', tryoutId)
    .single()

  if (!tryout) return notFound()

  // 2. Fetch latest completed attempt
  const { data: attempt } = await supabase
    .from('tryout_attempts')
    .select('*')
    .eq('tryout_id', tryoutId)
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!attempt) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-4 shadow-sm">
        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-brand-dark">Belum Ada Hasil Ujian</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Anda belum menyelesaikan atau men-submit paket tryout ini.
        </p>
        <Link
          href={`/student/tryouts/${tryoutId}`}
          className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition"
        >
          Mulai Mengerjakan
        </Link>
      </div>
    )
  }

  // 3. Fetch questions, options & answers with explanation
  const { data: answersData = [] } = await supabase
    .from('tryout_answers')
    .select(`
      question_id,
      selected_option_id,
      is_correct,
      is_flagged,
      questions(
        id,
        question_text,
        question_image_url,
        explanation,
        difficulty,
        question_categories(name),
        question_options(
          id,
          label,
          option_text,
          is_correct
        )
      )
    `)
    .eq('attempt_id', attempt.id)

  const answersList = (answersData || []) as any[]

  return (
    <TryoutResultClient
      tryout={tryout}
      attempt={attempt}
      answers={answersList}
    />
  )
}
