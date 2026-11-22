'use client'
import { notify } from '@/app/components/Feedback'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Clock, 
  ChevronRight, 
  Flag, 
  AlertTriangle, 
  X,
  Maximize2,
  Minimize2,
  Layers,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react'
import { saveStudentAnswer, submitTryoutAttempt } from '@/app/(main)/student/tryouts/actions'
import QuestionImage from '@/app/components/QuestionImage'

type Option = {
  id: string
  label: string
  option_text: string
  isCorrect: boolean
}

type Question = {
  id: string
  question_text: string
  question_image_url: string | null
  options: Option[]
}

type AnswerState = {
  selectedOptionId: string | null
  isFlagged: boolean
}

export default function CBTExamClient({
  attemptId,
  tryout,
  questions,
  initialAnswers,
  initialTimeRemaining
}: {
  attemptId: string
  tryout: {
    id: string
    title: string
    duration_minutes: number | null
  }
  questions: Question[]
  initialAnswers: Record<string, AnswerState>
  initialTimeRemaining: number | null // in seconds
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(initialAnswers)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTimeRemaining)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // --- NEW STATE for CBT locking ---
  // Set of question IDs that have been locked (answered + Next pressed)
  // Restored from saved answers: answered & not flagged = already locked (e.g. after reload)
  const [lockedQuestions, setLockedQuestions] = useState<Set<string>>(() => new Set(
    questions.filter(q => initialAnswers[q.id]?.selectedOptionId && !initialAnswers[q.id]?.isFlagged).map(q => q.id)
  ))
  // Per-question result: 'correct' | 'wrong' — determined at Next press
  const [questionResults, setQuestionResults] = useState<Record<string, 'correct' | 'wrong'>>(() => {
    const res: Record<string, 'correct' | 'wrong'> = {}
    for (const q of questions) {
      const a = initialAnswers[q.id]
      if (a?.selectedOptionId && !a.isFlagged) {
        res[q.id] = q.options.find(o => o.isCorrect)?.id === a.selectedOptionId ? 'correct' : 'wrong'
      }
    }
    return res
  })
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = questions.findIndex(q => !(initialAnswers[q.id]?.selectedOptionId && !initialAnswers[q.id]?.isFlagged))
    return idx === -1 ? 0 : idx
  })
  // Furthest question reached — the only non-ragu question reachable from the grid
  const [maxReached, setMaxReached] = useState(currentIndex)

  const currentQ = questions[currentIndex]
  const currentAnswer = currentQ ? (answers[currentQ.id] || { selectedOptionId: null, isFlagged: false }) : { selectedOptionId: null, isFlagged: false }

  const isCurrentLocked = currentQ ? lockedQuestions.has(currentQ.id) : false

  // Next target: first unlocked question after current, else wrap to an earlier unlocked (ragu) one
  const findNextIndex = (locked: Set<string>) => {
    for (let i = currentIndex + 1; i < questions.length; i++) if (!locked.has(questions[i].id)) return i
    for (let i = 0; i < currentIndex; i++) if (!locked.has(questions[i].id)) return i
    return -1
  }

  // Sinkronkan state fullscreen dengan browser (termasuk saat keluar via tombol Esc)
  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement)
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  // 1. COUNTDOWN TIMER
  useEffect(() => {
    if (timeRemaining === null) return

    if (timeRemaining <= 0) {
      handleFinalSubmit(true)
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 2. SELECT OPTION (only if not locked)
  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return
    if (isCurrentLocked) return // Can't change answer after locking

    const isDeselect = currentAnswer.selectedOptionId === optionId
    const newSelected = isDeselect ? null : optionId

    const updated = {
      ...currentAnswer,
      selectedOptionId: newSelected
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: updated
    }))

    // Save in background
    saveStudentAnswer({
      attemptId,
      questionId: currentQ.id,
      selectedOptionId: newSelected,
      isFlagged: updated.isFlagged
    })
  }

  // 3. TOGGLE FLAGGED (only if not locked)
  const handleToggleFlag = () => {
    if (!currentQ) return
    if (isCurrentLocked) return // Can't change flag after locking

    const updated = {
      ...currentAnswer,
      isFlagged: !currentAnswer.isFlagged
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: updated
    }))

    saveStudentAnswer({
      attemptId,
      questionId: currentQ.id,
      selectedOptionId: updated.selectedOptionId,
      isFlagged: updated.isFlagged
    })
  }

  // 4. NEXT BUTTON — locks & grades current question, unless it's flagged ragu
  const canNext = !!currentQ && !isCurrentLocked && (currentAnswer.isFlagged || !!currentAnswer.selectedOptionId)
  const handleNext = () => {
    if (!currentQ || !canNext) return

    let locked = lockedQuestions
    if (!currentAnswer.isFlagged) {
      // Find the correct option for this question
      const correctOption = currentQ.options.find(o => o.isCorrect)
      const isCorrect = correctOption ? currentAnswer.selectedOptionId === correctOption.id : false

      // Lock this question
      locked = new Set([...lockedQuestions, currentQ.id])
      setLockedQuestions(locked)
      setQuestionResults(prev => ({ ...prev, [currentQ.id]: isCorrect ? 'correct' : 'wrong' }))
    }

    const next = findNextIndex(locked)
    if (next === -1) {
      setIsSubmitModalOpen(true)
    } else {
      setCurrentIndex(next)
      setMaxReached(prev => Math.max(prev, next))
    }
  }

  // 5. SUBMIT ATTEMPT
  const handleFinalSubmit = async (isTimeout = false) => {
    setIsSubmitting(true)
    try {
      await submitTryoutAttempt(attemptId)
      // Keluar dari layar penuh hanya jika sedang layar penuh
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
      router.push(`/student/tryouts/${tryout.id}/result`)
    } catch (e: any) {
      notify.error(e.message || "Gagal submit tryout")
      setIsSubmitting(false)
    }
  }

  // 6. STATISTIK
  const totalQuestions = questions.length
  const answeredCount = Object.values(answers).filter(a => a.selectedOptionId !== null).length
  const flaggedCount = Object.values(answers).filter(a => a.isFlagged).length
  const unansweredCount = totalQuestions - answeredCount
  const correctCount = Object.values(questionResults).filter(r => r === 'correct').length
  const wrongCount = Object.values(questionResults).filter(r => r === 'wrong').length

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Grid navigation only to ragu-flagged questions, or back to the furthest question reached
  const isNavigable = (idx: number) => {
    const q = questions[idx]
    if (!q || lockedQuestions.has(q.id)) return false
    return !!answers[q.id]?.isFlagged || idx === maxReached
  }
  const handleNavToQuestion = (idx: number) => {
    if (idx === currentIndex || isNavigable(idx)) {
      setCurrentIndex(idx)
      setIsNavDrawerOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col font-sans select-none overflow-hidden">
      {/* ── TOPBAR CBT ── */}
      <header className="h-16 bg-gradient-to-r from-brand-cream via-white to-white border-b-[3px] border-brand-pink px-3 sm:px-8 flex items-center justify-between gap-2 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Image
            src="/images/logos/logo_5.png"
            alt="Teman Farmasi"
            width={120}
            height={40}
            priority
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
          <span className="hidden sm:block w-px h-8 bg-brand-dark/15" />
          <div className="hidden sm:block min-w-0">
            <h1 className="font-extrabold text-brand-dark text-sm sm:text-base line-clamp-1 max-w-xs sm:max-w-md">
              {tryout.title}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Computer Based Test (CBT) Portal
            </p>
          </div>
        </div>

        {/* TIMER & CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {timeRemaining !== null && (
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-extrabold tracking-wider transition ${
              timeRemaining < 300
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-brand-dark text-white'
            }`}>
              <Clock className="w-4 h-4 text-brand-yellow" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition hidden sm:block ${
              isFullscreen
                ? 'text-gray-500 hover:text-brand-dark hover:bg-gray-100'
                : 'bg-brand-pink text-white shadow-md shadow-brand-pink/30 ring-4 ring-brand-pink/20 animate-pulse hover:bg-brand-dark'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            className="lg:hidden px-2.5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
          >
            <Layers className="w-4 h-4" /> Daftar Soal
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: QUESTION AREA */}
        <main className="tf-scroll cbt-zoom flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
          {/* QUESTION HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 shrink-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Soal Nomor
              </span>
              <span className="w-9 h-9 rounded-xl bg-brand-dark text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                {currentIndex + 1}
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                dari {totalQuestions} Soal
              </span>
              {isCurrentLocked && (
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  questionResults[currentQ?.id] === 'correct'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {questionResults[currentQ?.id] === 'correct' ? '✓ Benar' : '✗ Salah'}
                </span>
              )}
            </div>

          </div>

          {/* QUESTION CONTENT */}
          {currentQ ? (
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
                <p className="text-brand-dark font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {currentQ.question_text}
                </p>

                {currentQ.question_image_url && (
                  <QuestionImage
                    src={currentQ.question_image_url}
                    alt="Gambar Lampiran"
                    className="max-w-2xl"
                  />
                )}
              </div>

              {/* OPTIONS A-E */}
              <div className="space-y-3">
                {currentQ.options.map(opt => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id
                  const result = questionResults[currentQ.id]

                  let optStyle = ''
                  let badgeStyle = ''

                  if (isCurrentLocked) {
                    // After locking: show correct/wrong coloring
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 shadow-sm'
                      badgeStyle = 'bg-emerald-600 text-white'
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50'
                      badgeStyle = 'bg-rose-500 text-white'
                    } else {
                      optStyle = 'border-gray-100 bg-white opacity-60'
                      badgeStyle = 'bg-gray-100 text-gray-500'
                    }
                  } else {
                    // Normal selection state
                    if (isSelected) {
                      optStyle = 'border-brand-pink bg-brand-pink/5 shadow-md shadow-brand-pink/5'
                      badgeStyle = 'bg-brand-pink text-white shadow-md'
                    } else {
                      optStyle = 'border-white bg-white hover:border-gray-200 shadow-sm'
                      badgeStyle = 'bg-gray-100 text-gray-600'
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                        isCurrentLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${optStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-all ${badgeStyle}`}>
                        {opt.label}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm text-brand-dark font-medium leading-relaxed mt-1">
                        {opt.option_text}
                      </span>
                      {isCurrentLocked && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">Memuat soal...</div>
          )}

          {/* BOTTOM CONTROLS — 3-column layout */}
          <div className="pt-8 mt-auto shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 sm:gap-4">
              {/* LEFT: progress info (di HP tampil di atas tombol) */}
              <div className="col-span-2 sm:col-span-1 flex justify-center sm:justify-start">
                <span className="text-xs text-gray-400 font-semibold">
                  {answeredCount}/{totalQuestions} terjawab
                </span>
              </div>

              {/* CENTER: Ragu-ragu */}
              <div className="flex justify-start sm:justify-center">
                {!isCurrentLocked && (
                  <button
                    onClick={handleToggleFlag}
                    className={`inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl text-xs font-extrabold transition active:scale-95 ${
                      currentAnswer.isFlagged
                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${currentAnswer.isFlagged ? 'fill-current' : ''}`} />
                    <span className="sm:hidden">{currentAnswer.isFlagged ? 'Ragu' : 'Tandai Ragu'}</span>
                    <span className="hidden sm:inline">{currentAnswer.isFlagged ? 'Ditandai Ragu-ragu' : 'Tandai Ragu'}</span>
                  </button>
                )}
              </div>

              {/* RIGHT: Next */}
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!canNext}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs font-extrabold transition shadow-sm active:scale-95 whitespace-nowrap ${
                    !canNext
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-brand-dark text-white hover:bg-brand-pink shadow-brand-dark/20'
                  }`}
                >
                  {isCurrentLocked ? 'Sudah Dikunci' : 'Selanjutnya'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT: QUESTION NUMBER GRID */}
        <aside className={`w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 lg:relative fixed inset-y-0 right-0 z-40 transition-transform duration-300 ${
          isNavDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-extrabold text-brand-dark text-sm">
              Navigasi Nomor Soal
            </h3>
            <button
              onClick={() => setIsNavDrawerOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* LEGEND */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>{correctCount} Benar</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span>{wrongCount} Salah</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>{flaggedCount} Ragu</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-gray-200" />
              <span>{unansweredCount} Belum</span>
            </div>
          </div>

          {/* NUMBER BUTTONS GRID */}
          <div className="tf-scroll flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const ans = answers[q.id]
                const isCurrent = idx === currentIndex
                const isFlagged = ans?.isFlagged
                const isLocked = lockedQuestions.has(q.id)
                const result = questionResults[q.id]

                // Clickability: only current, ragu-flagged, or furthest reached
                const isClickable = isCurrent || isNavigable(idx)

                let badgeStyle = 'bg-white border-gray-200 text-gray-600 hover:border-brand-pink'
                if (isCurrent) {
                  badgeStyle = 'ring-2 ring-brand-dark font-extrabold bg-brand-dark text-white'
                } else if (isLocked && result === 'correct') {
                  badgeStyle = 'bg-emerald-500 text-white font-bold border-emerald-500'
                } else if (isLocked && result === 'wrong') {
                  badgeStyle = 'bg-rose-500 text-white font-bold border-rose-500'
                } else if (isFlagged) {
                  badgeStyle = 'bg-amber-400 text-amber-950 font-bold border-amber-400'
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavToQuestion(idx)}
                    disabled={!isClickable}
                    className={`h-11 rounded-xl text-xs font-bold border flex items-center justify-center transition-all relative ${badgeStyle} ${
                      !isClickable ? 'cursor-not-allowed opacity-80' : ''
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 absolute top-1 right-1" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON AT BOTTOM OF ASIDE */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 bg-brand-pink text-white rounded-xl text-xs font-extrabold hover:bg-brand-dark transition shadow-md active:scale-95"
            >
              Kumpulkan Ujian
            </button>
          </div>
        </aside>
      </div>

      {/* ── MODAL KONFIRMASI SUBMIT FINAL ── */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-brand-dark">
                Selesaikan Ujian Sekarang?
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Pastikan Anda telah memeriksa semua butir soal. Setelah disubmit, Anda tidak dapat mengubah jawaban lagi.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-gray-400 font-bold">Terjawab</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">{answeredCount}</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-gray-400 font-bold">Ragu-ragu</p>
                <p className="text-base font-extrabold text-amber-600 mt-0.5">{flaggedCount}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold">Belum</p>
                <p className="text-base font-extrabold text-gray-400 mt-0.5">{unansweredCount}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cek Ulang Soal
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-extrabold hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Submit Ujian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
