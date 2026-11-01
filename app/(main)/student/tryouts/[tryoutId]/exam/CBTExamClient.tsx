'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Check, 
  AlertTriangle, 
  X,
  Maximize2,
  Minimize2,
  Layers,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react'
import { saveStudentAnswer, submitTryoutAttempt } from '@/app/(main)/student/tryouts/actions'

type Option = {
  id: string
  label: string
  option_text: string
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(initialAnswers)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTimeRemaining)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentQ = questions[currentIndex]
  const currentAnswer = currentQ ? (answers[currentQ.id] || { selectedOptionId: null, isFlagged: false }) : { selectedOptionId: null, isFlagged: false }

  // 1. COUNTDOWN TIMER
  useEffect(() => {
    if (timeRemaining === null) return

    if (timeRemaining <= 0) {
      handleFinalSubmit(true) // Auto-submit when time's up
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

  // 2. SELECT OPTION & AUTO SAVE
  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return
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

  // 3. TOGGLE FLAGGED (RAGU-RAGU)
  const handleToggleFlag = () => {
    if (!currentQ) return
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

  // 4. SUBMIT ATTEMPT
  const handleFinalSubmit = async (isTimeout = false) => {
    setIsSubmitting(true)
    try {
      await submitTryoutAttempt(attemptId)
      router.push(`/student/tryouts/${tryout.id}/result`)
    } catch (e: any) {
      alert(e.message || "Gagal submit tryout")
      setIsSubmitting(false)
    }
  }

  // 5. STATISTIK PENGERJAAN
  const totalQuestions = questions.length
  const answeredCount = Object.values(answers).filter(a => a.selectedOptionId !== null).length
  const flaggedCount = Object.values(answers).filter(a => a.isFlagged).length
  const unansweredCount = totalQuestions - answeredCount

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col font-sans select-none overflow-hidden">
      {/* ── TOPBAR CBT ── */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-dark flex items-center justify-center font-extrabold text-brand-yellow text-sm">
            TF
          </span>
          <div>
            <h1 className="font-extrabold text-brand-dark text-sm sm:text-base line-clamp-1 max-w-xs sm:max-w-md">
              {tryout.title}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Computer Based Test (CBT) Portal
            </p>
          </div>
        </div>

        {/* TIMER & CONTROLS */}
        <div className="flex items-center gap-4">
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-extrabold tracking-wider transition ${
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
            className="p-2 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-xl transition hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
          >
            <Layers className="w-4 h-4" /> Daftar Soal
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: QUESTION AREA */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
          {/* QUESTION HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Soal Nomor
              </span>
              <span className="w-9 h-9 rounded-xl bg-brand-dark text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                {currentIndex + 1}
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                dari {totalQuestions} Soal
              </span>
            </div>

            <button
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                currentAnswer.isFlagged
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${currentAnswer.isFlagged ? 'fill-current' : ''}`} />
              {currentAnswer.isFlagged ? 'Ditandai Ragu-ragu' : 'Tandai Ragu'}
            </button>
          </div>

          {/* QUESTION CONTENT */}
          {currentQ ? (
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
                <p className="text-brand-dark font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {currentQ.question_text}
                </p>

                {currentQ.question_image_url && (
                  <div className="max-w-lg rounded-2xl overflow-hidden border border-gray-200">
                    <img
                      src={currentQ.question_image_url}
                      alt="Gambar Lampiran"
                      className="w-full h-auto object-cover max-h-80"
                    />
                  </div>
                )}
              </div>

              {/* OPTIONS A-E */}
              <div className="space-y-3">
                {currentQ.options.map(opt => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? 'border-brand-pink bg-brand-pink/5 shadow-md shadow-brand-pink/5'
                          : 'border-white bg-white hover:border-gray-200 shadow-sm'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-all ${
                          isSelected
                            ? 'bg-brand-pink text-white shadow-md'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm text-brand-dark font-medium leading-relaxed mt-1">
                        {opt.option_text}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">Memuat soal...</div>
          )}

          {/* QUESTION BOTTOM CONTROLS */}
          <div className="pt-8 mt-auto flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-extrabold text-brand-dark hover:bg-gray-50 transition disabled:opacity-30 disabled:pointer-events-none shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" /> Selesai & Submit
            </button>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-extrabold text-brand-dark hover:bg-gray-50 transition disabled:opacity-30 disabled:pointer-events-none shadow-sm"
            >
              Soal Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* RIGHT: QUESTION NUMBER GRID (DESKTOP & DRAWER ON MOBILE) */}
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
          <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-500 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>{answeredCount} Terjawab</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>{flaggedCount} Ragu</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-md bg-gray-200" />
              <span>{unansweredCount} Kosong</span>
            </div>
          </div>

          {/* NUMBER BUTTONS GRID */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const ans = answers[q.id]
                const isCurrent = idx === currentIndex
                const isAnswered = ans && ans.selectedOptionId !== null
                const isFlagged = ans && ans.isFlagged

                let badgeStyle = 'bg-white border-gray-200 text-gray-600 hover:border-brand-pink'
                if (isCurrent) {
                  badgeStyle = 'ring-2 ring-brand-dark font-extrabold bg-brand-dark text-white'
                } else if (isFlagged) {
                  badgeStyle = 'bg-amber-400 text-amber-950 font-bold border-amber-400'
                } else if (isAnswered) {
                  badgeStyle = 'bg-emerald-500 text-white font-bold border-emerald-500'
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx)
                      setIsNavDrawerOpen(false)
                    }}
                    className={`h-11 rounded-xl text-xs font-bold border flex items-center justify-center transition-all relative ${badgeStyle}`}
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
