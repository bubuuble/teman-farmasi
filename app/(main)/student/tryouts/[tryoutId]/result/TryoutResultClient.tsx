'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Target,
  Trophy
} from 'lucide-react'

type OptionData = {
  id: string
  label: string
  option_text: string
  is_correct: boolean
}

type QuestionData = {
  id: string
  question_text: string
  question_image_url: string | null
  explanation: string | null
  question_categories?: { name: string } | null
  question_options: OptionData[]
}

type AnswerItem = {
  question_id: string
  selected_option_id: string | null
  is_correct: boolean | null
  is_flagged: boolean
  questions: QuestionData
}

type AttemptInfo = {
  id: string
  score: number | null
  total_correct: number | null
  total_answered: number | null
  started_at: string
  finished_at: string | null
  attempt_number: number
}

type AttemptWithAnswers = {
  attempt: AttemptInfo
  answers: AnswerItem[]
}

type TryoutInfo = {
  id: string
  title: string
  program_type: string
  duration_minutes: number | null
}

export default function TryoutResultClient({
  tryout,
  attemptsWithAnswers
}: {
  tryout: TryoutInfo
  attemptsWithAnswers: AttemptWithAnswers[]
}) {
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(attemptsWithAnswers.length - 1)
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { attempt, answers } = attemptsWithAnswers[selectedAttemptIdx]

  const totalQuestions = answers.length
  const totalCorrect = attempt.total_correct ?? answers.filter(a => a.is_correct === true).length
  const totalAnswered = attempt.total_answered ?? answers.filter(a => a.selected_option_id !== null).length
  const totalUnanswered = totalQuestions - totalAnswered
  const totalWrong = totalAnswered - totalCorrect
  const finalScore = Number(attempt.score || 0)

  // Duration
  let durationStr = '-'
  if (attempt.started_at && attempt.finished_at) {
    const diffMs = new Date(attempt.finished_at).getTime() - new Date(attempt.started_at).getTime()
    const diffSec = Math.max(0, Math.floor(diffMs / 1000))
    const mins = Math.floor(diffSec / 60)
    const secs = diffSec % 60
    durationStr = `${mins}m ${secs}s`
  }

  // Categories
  const categoriesMap = new Map<string, { total: number; correct: number }>()
  answers.forEach(a => {
    const catName = a.questions?.question_categories?.name || 'Umum'
    const curr = categoriesMap.get(catName) || { total: 0, correct: 0 }
    curr.total += 1
    if (a.is_correct) curr.correct += 1
    categoriesMap.set(catName, curr)
  })
  const categoryList = Array.from(categoriesMap.entries()).map(([name, stat]) => ({
    name, ...stat, pct: Math.round((stat.correct / stat.total) * 100)
  }))

  // Filter
  const filteredAnswers = answers.filter(a => {
    if (filter === 'correct' && !a.is_correct) return false
    if (filter === 'wrong' && (a.is_correct || a.selected_option_id === null)) return false
    if (filter === 'unanswered' && a.selected_option_id !== null) return false
    if (selectedCategory !== 'all') {
      const catName = a.questions?.question_categories?.name || 'Umum'
      if (catName !== selectedCategory) return false
    }
    return true
  })

  const isPassed = finalScore >= 68
  const scoreColor = finalScore >= 80 ? 'text-emerald-600' : finalScore >= 68 ? 'text-brand-dark' : 'text-rose-600'
  const scoreBg = finalScore >= 80 ? 'from-emerald-500/10 via-emerald-500/5 to-transparent' : finalScore >= 68 ? 'from-brand-blue/10 via-brand-yellow/10 to-transparent' : 'from-rose-500/10 via-rose-500/5 to-transparent'

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* TOP NAV */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/tryouts"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark/70 hover:text-brand-pink transition px-3 py-1.5 rounded-xl hover:bg-white/60"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Portal Tryout
        </Link>
        <Link
          href={`/student/tryouts/${tryout.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark bg-white border border-brand-dark/10 hover:border-brand-pink px-4 py-2 rounded-xl transition shadow-sm hover:shadow"
        >
          <RotateCcw className="w-3.5 h-3.5 text-brand-pink" /> Info & Pengerjaan Ulang
        </Link>
      </div>

      {/* ATTEMPT TABS */}
      {attemptsWithAnswers.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-brand-pink" /> Riwayat Percobaan
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {attemptsWithAnswers.map((aw, idx) => {
              const sc = Number(aw.attempt.score || 0)
              const isSelected = idx === selectedAttemptIdx
              return (
                <button
                  key={aw.attempt.id}
                  onClick={() => {
                    setSelectedAttemptIdx(idx)
                    setFilter('all')
                    setSelectedCategory('all')
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Percobaan {aw.attempt.attempt_number}
                  <span className={`font-extrabold ${isSelected ? 'text-brand-yellow' : sc >= 68 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {sc.toFixed(0)}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* SCORECARD */}
      <div className={`relative overflow-hidden bg-white rounded-[2.5rem] border border-brand-dark/10 p-7 sm:p-10 shadow-sm bg-gradient-to-br ${scoreBg}`}>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-brand-yellow/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-pink/15 text-brand-dark">
                {tryout.program_type === 'ukmppai' ? 'UKAI Series • Kelas UKMPPAI' : 'UKAI Series • Masuk Apoteker'}
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Percobaan #{attempt.attempt_number} dari {attemptsWithAnswers.length}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-dark tracking-tight leading-snug">
              {tryout.title}
            </h1>

            <p className="text-xs text-brand-dark/70 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Selesai: {attempt.finished_at ? new Date(attempt.finished_at).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) : '-'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
                <Clock className="w-3.5 h-3.5 text-brand-pink" /> Waktu: {durationStr}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-brand-dark/10 shadow-sm shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-0.5">Nilai Akhir</span>
              <div className={`text-4xl sm:text-5xl font-extrabold font-heading tracking-tight ${scoreColor}`}>
                {finalScore.toFixed(1)}
                <span className="text-xl sm:text-2xl font-bold opacity-70 ml-0.5">%</span>
              </div>
              <span className={`inline-block mt-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isPassed ? 'Lulus Tryout' : 'Belum Lulus'}
              </span>
            </div>

            <div className="w-px h-16 bg-gray-200" />

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{totalCorrect} Benar</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{totalWrong} Salah</span>
              </div>
              {totalUnanswered > 0 && (
                <div className="flex items-center gap-2 font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-xl">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{totalUnanswered} Kosong</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      {categoryList.length > 1 && (
        <div className="bg-white rounded-3xl p-6 border border-brand-dark/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-brand-pink" /> Evaluasi Kompetensi Per Topik
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold">{categoryList.length} Topik Diuji</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryList.map(cat => {
              const isGood = cat.pct >= 70
              return (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    selectedCategory === cat.name
                      ? 'border-brand-pink bg-brand-pink/5 shadow-sm'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-dark line-clamp-1">{cat.name}</span>
                    <span className={`text-xs font-extrabold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {cat.pct}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>{cat.correct} dari {cat.total} benar</span>
                      {selectedCategory === cat.name && <span className="text-brand-pink font-bold">Filter aktif</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          {(['all', 'correct', 'wrong', 'unanswered'] as const).map(f => {
            const labels: Record<string, string> = {
              all: `Semua Soal (${totalQuestions})`,
              correct: `Benar (${totalCorrect})`,
              wrong: `Salah (${totalWrong})`,
              unanswered: `Kosong (${totalUnanswered})`
            }
            const colors: Record<string, string> = {
              all: 'bg-brand-dark text-white',
              correct: 'bg-emerald-600 text-white',
              wrong: 'bg-rose-600 text-white',
              unanswered: 'bg-gray-700 text-white'
            }
            if (f === 'unanswered' && totalUnanswered === 0) return null
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  filter === f ? colors[f] : 'text-gray-500 hover:text-brand-dark'
                }`}
              >
                {f === 'correct' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {f === 'wrong' && <XCircle className="w-3.5 h-3.5" />}
                {labels[f]}
              </button>
            )
          })}
        </div>

        {selectedCategory !== 'all' && (
          <div className="flex items-center gap-2 bg-brand-pink/10 text-brand-dark px-3 py-1.5 rounded-xl text-xs font-bold self-start">
            <span>Filter Kategori: {selectedCategory}</span>
            <button onClick={() => setSelectedCategory('all')} className="text-gray-400 hover:text-brand-dark">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* QUESTION LIST */}
      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-gray-400 text-xs shadow-sm">
            Tidak ada butir soal untuk filter yang dipilih.
          </div>
        ) : (
          filteredAnswers.map(item => {
            const q = item.questions
            const actualNumber = answers.findIndex(a => a.question_id === item.question_id) + 1
            const options = [...(q?.question_options || [])].sort((a, b) => a.label.localeCompare(b.label))
            const isCorrect = item.is_correct === true
            const isUnanswered = item.selected_option_id === null

            return (
              <div
                key={item.question_id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-dark/10 shadow-sm space-y-5 transition-all hover:border-brand-dark/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-brand-dark text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      #{actualNumber}
                    </span>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Jawaban Benar
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                        <HelpCircle className="w-3.5 h-3.5" /> Tidak Dijawab
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                        <X className="w-3.5 h-3.5" /> Jawaban Salah
                      </span>
                    )}

                    {q?.question_categories?.name && (
                      <span className="text-[10px] font-bold text-brand-dark/70 bg-brand-cream border border-brand-dark/10 px-2.5 py-1 rounded-lg">
                        {q.question_categories.name}
                      </span>
                    )}
                  </div>

                  {item.is_flagged && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                      Sempat Ditandai Ragu
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-brand-dark font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {q?.question_text}
                  </p>

                  {q?.question_image_url && (
                    <div className="max-w-lg rounded-2xl overflow-hidden border border-gray-200 my-3">
                      <img src={q.question_image_url} alt="Lampiran Soal" className="w-full h-auto object-cover max-h-80" />
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-1">
                  {options.map(opt => {
                    const isStudentChoice = item.selected_option_id === opt.id
                    const isAnswerKey = opt.is_correct

                    let containerStyle = 'border-gray-100 bg-gray-50/50 text-brand-dark/80'
                    let badgeStyle = 'bg-gray-100 text-gray-500 border-gray-200'

                    if (isAnswerKey) {
                      containerStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-sm'
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600'
                    } else if (isStudentChoice && !isAnswerKey) {
                      containerStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium'
                      badgeStyle = 'bg-rose-500 text-white border-rose-500'
                    }

                    return (
                      <div key={opt.id} className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all text-xs sm:text-sm leading-relaxed ${containerStyle}`}>
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border ${badgeStyle}`}>
                          {opt.label}
                        </span>
                        <span className="flex-1 mt-0.5">{opt.option_text}</span>
                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          {isAnswerKey && (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-600 text-white">
                              Kunci Jawaban
                            </span>
                          )}
                          {isStudentChoice && !isAnswerKey && (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-rose-600 text-white">
                              Jawaban Anda
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {q?.explanation ? (
                  <div className="p-5 bg-brand-cream/80 rounded-2xl border border-brand-yellow/50 text-xs sm:text-sm text-brand-dark mt-4 space-y-1.5">
                    <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-brand-dark flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-pink" />
                      Pembahasan & Analisis Klinis:
                    </p>
                    <p className="leading-relaxed opacity-95 whitespace-pre-line text-xs sm:text-sm font-sans pt-1 text-brand-dark">
                      {q.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-400 italic">
                    Belum ada catatan pembahasan khusus untuk soal ini.
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
