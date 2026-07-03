'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Info, 
  FileText, 
  GraduationCap, 
  Users, 
  Pencil, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { 
  updateClass, 
  deleteClass, 
  assignStudent, 
  removeStudent, 
  assignMentor, 
  removeMentor, 
  uploadResource, 
  deleteResource,
  assignMultipleStudents
} from '../actions'
import ConfirmModal from '@/app/components/ConfirmModal'

// Pre-defined programs matching ClassForm
const PROGRAMS = [
  {
    value: 'PharmaCore Class',
    label: 'PharmaCore Class',
    description: 'Kelas pendampingan Mata Kuliah Farmasi (Basic Science, Chemistry, Pharmaceutics, Pharmacology, Phytochemistry, dll) berbasis blok. Program ini dirancang khusus untuk memperkuat pemahaman teori & praktikum, membantu persiapan ujian (UTS/UAS), pembahasan modul praktikum, serta latihan bank soal kefarmasian secara intensif.',
  },
  {
    value: 'Pharma Research Mentoring',
    label: 'Pharma Research Mentoring',
    description: 'Bimbingan privat riset & skripsi farmasi secara end-to-end (Private Monitoring Riset). Program meliputi pendampingan penentuan judul/topik riset, penyusunan outline proposal (Bab 1-3), bimbingan desain penelitian & metodologi lab, analisis data & statistika (SPSS), pembahasan hasil praktikum, hingga simulasi sidang skripsi.',
  },
  {
    value: 'PharmaPublish Academy',
    label: 'PharmaPublish Academy',
    description: 'Kelas khusus penulisan manuskrip jurnal ilmiah farmasi untuk publikasi nasional (SINTA) maupun internasional bereputasi (Scopus). Program mencakup drafting naskah, review artikel komprehensif, pemilihan jurnal target yang tepat, pendampingan proses submit, hingga strategi merespons revisi dari reviewer.',
  },
  {
    value: 'Pharma Impact',
    label: 'Pharma Impact',
    description: 'Kelas pendampingan intensif untuk kompetisi ilmiah kemahasiswaan nasional seperti PKM-RE (Riset Eksakta), P2MW (Wirausaha), PPK Ormawa, Program Mahasiswa Wirausaha, dan Lomba Karya Tulis Ilmiah (LKTI). Pendampingan dilakukan dari pencarian ide, penyusunan proposal berkualitas, pembuatan prototype, hingga persiapan presentasi penilaian.',
  },
  {
    value: 'Pharmacamp',
    label: 'Pharmacamp - Formulation Cosmetics Class',
    description: 'Program edukasi intensif formulasi kosmetik (skincare & personal care) dan sains formulasi. Menjembatani teori akademik dengan praktik industri nyata melalui pembelajaran hands-on lab, pengenalan bahan baku & fungsinya, teknik troubleshooting formula, regulasi dasar (CPKB, BPOM, Halal), serta business mentoring (costing, pricing, branding).',
  },
]

type ClassDetail = {
  id: string
  title: string
  description: string | null
  price: number
  level: string | null
  class_mentors: {
    id: string
    mentor_id: string
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  enrollments: {
    id: string
    student_id: string
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  class_resources: {
    id: string
    title: string
    file_url: string
    file_path: string
    created_at: string
  }[]
}

type TabType = 'detail' | 'resources' | 'students' | 'mentors'

export default function ClassManager({
  kelas,
  allStudents,
  allMentors,
}: {
  kelas: ClassDetail
  allStudents: any[]
  allMentors: any[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('detail')
  const [isPending, startTransition] = useTransition()

  // Alphabetical sort for student & mentor lists
  const sortedStudents = [...allStudents].sort((a, b) => 
    (a.full_name || a.email).localeCompare(b.full_name || b.email, 'id')
  )
  const sortedMentors = [...allMentors].sort((a, b) => 
    (a.full_name || a.email).localeCompare(b.full_name || b.email, 'id')
  )

  // Enrolled list guards
  const enrolledStudentIds = new Set(kelas.enrollments.map(e => e.student_id))
  const enrollableStudents = sortedStudents.filter(s => !enrolledStudentIds.has(s.id))

  const filteredStudents = enrollableStudents.filter(s => {
    const searchLower = studentSearch.toLowerCase()
    const fullName = (s.full_name || '').toLowerCase()
    const email = (s.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  const assignedMentorIds = new Set(kelas.class_mentors.map(m => m.mentor_id))
  const assignableMentors = sortedMentors.filter(m => !assignedMentorIds.has(m.id))

  const filteredMentors = assignableMentors.filter(m => {
    const searchLower = mentorSearch.toLowerCase()
    const fullName = (m.full_name || '').toLowerCase()
    const email = (m.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  // Message & Error states
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState(kelas.title)
  const [editLevel, setEditLevel] = useState(kelas.level || '')
  const [editPrice, setEditPrice] = useState(kelas.price)
  const [editDescription, setEditDescription] = useState(kelas.description || '')

  // File upload states
  const [uploadTitle, setUploadTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dropdown states
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [mentorSearch, setMentorSearch] = useState('')
  const [selectedMentorId, setSelectedMentorId] = useState('')

  // Delete confirmations state
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(false)
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' })
  const [confirmDeleteMentor, setConfirmDeleteMentor] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' })
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<{ isOpen: boolean; id: string; path: string }>({ isOpen: false, id: '', path: '' })

  const showFeedback = (success: string, error: string) => {
    if (success) {
      setSuccessMsg(success)
      setErrorMsg('')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else if (error) {
      setErrorMsg(error)
      setSuccessMsg('')
      setTimeout(() => setErrorMsg(''), 4000)
    }
  }

  // --- ACTIONS ---

  const handleEditClassSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', kelas.id)
      formData.append('title', editTitle)
      formData.append('description', editDescription)
      formData.append('price', String(editPrice))
      formData.append('level', editLevel)

      const res = await updateClass({}, formData)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Detail kelas berhasil diperbarui!', '')
        setIsEditMode(false)
      }
    })
  }

  const handleDeleteClass = () => {
    startTransition(async () => {
      const res = await deleteClass(kelas.id)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        router.push('/admin/classes')
      }
    })
  }

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudentIds.length === 0) return
    startTransition(async () => {
      const res = await assignMultipleStudents(kelas.id, selectedStudentIds)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback(res.success || 'Siswa berhasil didaftarkan!', '')
        setSelectedStudentIds([])
        setStudentSearch('')
      }
    })
  }

  const handleRemoveStudent = (enrollmentId: string) => {
    startTransition(async () => {
      const res = await removeStudent(enrollmentId)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Siswa dikeluarkan dari kelas.', '')
      }
    })
  }

  const handleAddMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentorId) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('classId', kelas.id)
      formData.append('mentorId', selectedMentorId)

      const res = await assignMentor({}, formData)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Mentor berhasil ditugaskan!', '')
        setSelectedMentorId('')
        setMentorSearch('')
      }
    })
  }

  const handleRemoveMentor = (assignmentId: string) => {
    startTransition(async () => {
      const res = await removeMentor(assignmentId)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Mentor dilepas dari kelas.', '')
      }
    })
  }

  const handleUploadFileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadTitle || !selectedFile) return
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert(`File terlalu besar! Maks 50MB. File kamu: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('classId', kelas.id)
      formData.append('title', uploadTitle)
      formData.append('file', selectedFile)

      const res = await uploadResource({}, formData)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('E-Book berhasil diupload!', '')
        setUploadTitle('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  const handleDeleteFile = (id: string, path: string) => {
    startTransition(async () => {
      const res = await deleteResource(id, path)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('File materi berhasil dihapus.', '')
      }
    })
  }

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-card overflow-hidden">
      {/* 1. Header Tab Navigation */}
      <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab('detail'); setIsEditMode(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'detail' 
              ? 'bg-brand-darkblue text-white shadow-sm' 
              : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
            }`}
        >
          <Info className="w-4 h-4" />
          Detail Kelas
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'resources' 
              ? 'bg-brand-darkblue text-white shadow-sm' 
              : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
            }`}
        >
          <FileText className="w-4 h-4" />
          Materi &amp; E-Book
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
            ${activeTab === 'resources' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
            {kelas.class_resources?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'students' 
              ? 'bg-brand-darkblue text-white shadow-sm' 
              : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          Siswa Terdaftar
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
            ${activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
            {kelas.enrollments?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'mentors' 
              ? 'bg-brand-darkblue text-white shadow-sm' 
              : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
            }`}
        >
          <Users className="w-4 h-4" />
          Mentor Bertugas
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
            ${activeTab === 'mentors' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
            {kelas.class_mentors?.length || 0}
          </span>
        </button>
      </div>

      {/* 2. Feedback Messages */}
      {successMsg && (
        <div className="mx-6 mt-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 text-sm border border-green-100">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* 3. Tab Contents */}
      <div className="p-6 md:p-8">
        
        {/* --- TAB 1: DETAIL & EDIT KELAS --- */}
        {activeTab === 'detail' && (
          <div className="space-y-6">
            {!isEditMode ? (
              <div className="space-y-6">
                <div>
                  <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {kelas.level ? `${kelas.level}x Pertemuan` : '-'}
                  </span>
                  <h2 className="font-heading font-bold text-2xl text-brand-dark mt-3">{kelas.title}</h2>
                  <p className="text-xl font-extrabold text-brand-dark mt-2" suppressHydrationWarning>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kelas.price)}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-2 opacity-50">Deskripsi Kelas</h4>
                  <p className="text-brand-dark text-sm leading-relaxed whitespace-pre-line">
                    {kelas.description || "Tidak ada deskripsi."}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-brand-cream text-brand-dark rounded-xl text-xs font-bold hover:bg-brand-darkblue hover:text-white transition-all shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Detail Kelas
                  </button>
                  <button
                    onClick={() => setConfirmDeleteClass(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Kelas
                  </button>
                </div>
              </div>
            ) : (
              // EDIT FORM INLINE
              <form onSubmit={handleEditClassSubmit} className="space-y-4 max-w-2xl">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="font-heading font-bold text-lg text-brand-dark">Edit Detail Kelas</h3>
                  <p className="text-xs text-brand-gray">Perbarui informasi utama untuk kelas ini.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Program / Judul</label>
                  <select
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value)
                      // Auto-sync description
                      const prog = PROGRAMS.find(p => p.value === e.target.value)
                      if (prog) setEditDescription(prog.description)
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                    required
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Jumlah Pertemuan</label>
                    <input
                      type="number"
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      placeholder="Contoh: 5"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Harga Kelas (IDR)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      placeholder="Contoh: 500000"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Deskripsi</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-3 bg-brand-darkblue text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-5 py-3 bg-gray-100 text-brand-dark rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* --- TAB 2: MATERI & E-BOOK --- */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Upload Form */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Upload E-Book Baru</h3>
                <p className="text-xs text-brand-gray">Unggah modul atau materi ajar baru.</p>
              </div>

              <form onSubmit={handleUploadFileSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Judul File</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: Modul Pertemuan 1"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Pilih File (PDF, Word, PPT)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                    required
                    disabled={isPending}
                  />
                </div>

                {isPending && selectedFile && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-xs text-blue-700 font-semibold">Mengupload {selectedFile.name}...</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Unggah Materi
                </button>
              </form>
            </div>

            {/* Right side: File list */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-dark">Materi Terdaftar</h3>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {kelas.class_resources?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada file materi diupload.</p>
                ) : (
                  kelas.class_resources.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-brand-dark truncate">{item.title}</p>
                          <span className="text-[10px] text-gray-400">
                            Uploaded: {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-brand-cream text-brand-dark hover:bg-brand-darkblue hover:text-white transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setConfirmDeleteFile({ isOpen: true, id: item.id, path: item.file_path })}
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ATUR SISWA --- */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Enroll Student Form */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Daftarkan Siswa Baru</h3>
                <p className="text-xs text-brand-gray">Masukkan siswa secara manual ke kelas ini.</p>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Pilih Siswa ({selectedStudentIds.length} Terpilih)</label>
                  
                  {/* Search Input */}
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white mb-2"
                    disabled={isPending}
                  />
                  
                  {/* Checkbox List */}
                  <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto p-3 space-y-2 bg-white">
                    {filteredStudents.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2 text-center">
                        {studentSearch ? 'Tidak ada siswa yang cocok.' : 'Semua siswa sudah terdaftar.'}
                      </p>
                    ) : (
                      filteredStudents.map((s) => {
                        const isChecked = selectedStudentIds.includes(s.id)
                        return (
                          <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedStudentIds(prev => prev.filter(id => id !== s.id))
                                } else {
                                  setSelectedStudentIds(prev => [...prev, s.id])
                                }
                              }}
                              className="rounded border-gray-300 text-brand-darkblue focus:ring-brand-blue"
                              disabled={isPending}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-brand-dark truncate">{s.full_name || 'Tanpa Nama'}</p>
                              <p className="text-xs text-gray-500 truncate">{s.email}</p>
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || selectedStudentIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Daftarkan {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} Siswa` : 'Siswa'}
                </button>
              </form>
            </div>

            {/* Right side: Enrolled Students List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-dark">Siswa Terdaftar</h3>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {kelas.enrollments?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada siswa di kelas ini.</p>
                ) : (
                  kelas.enrollments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-green-50 text-green-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {item.profiles?.full_name?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</p>
                          <p className="text-xs text-gray-400 truncate">{item.profiles?.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setConfirmDeleteStudent({ isOpen: true, id: item.id })}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Keluarkan dari Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: ATUR MENTOR --- */}
        {activeTab === 'mentors' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Assign Mentor Form */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Tugaskan Mentor Baru</h3>
                <p className="text-xs text-brand-gray">Pilih mentor yang mengajar di kelas ini.</p>
              </div>

              <form onSubmit={handleAddMentorSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Pilih Mentor</label>
                  
                  {/* Search Input */}
                  <input
                    type="text"
                    value={mentorSearch}
                    onChange={(e) => setMentorSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white mb-2"
                    disabled={isPending}
                  />
                  
                  {/* Filtered List */}
                  <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto p-3 space-y-2 bg-white">
                    {filteredMentors.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2 text-center">
                        {mentorSearch ? 'Tidak ada mentor yang cocok.' : 'Semua mentor sudah ditugaskan.'}
                      </p>
                    ) : (
                      filteredMentors.map((m) => {
                        const isSelected = selectedMentorId === m.id
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMentorId(isSelected ? '' : m.id)}
                            className={`p-2 rounded-lg cursor-pointer text-sm flex items-center justify-between transition-colors
                              ${isSelected ? 'bg-brand-blue/10 border border-brand-blue' : 'hover:bg-gray-50 border border-transparent'}
                            `}
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-brand-dark truncate">{m.full_name || 'Tanpa Nama'}</p>
                              <p className="text-xs text-gray-500 truncate">{m.email}</p>
                            </div>
                            {isSelected && <span className="text-xs font-bold text-brand-blue flex-shrink-0">Terpilih</span>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !selectedMentorId}
                  className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Tugaskan Mentor
                </button>
              </form>
            </div>

            {/* Right side: Assigned Mentors List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-dark">Mentor Ditugaskan</h3>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {kelas.class_mentors?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada mentor di kelas ini.</p>
                ) : (
                  kelas.class_mentors.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {item.profiles?.full_name?.[0] || 'M'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</p>
                          <p className="text-xs text-gray-400 truncate">{item.profiles?.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setConfirmDeleteMentor({ isOpen: true, id: item.id })}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Hapus Penugasan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- CONFIRMATION MODALS (Hanya untuk aksi berbahaya/hapus) --- */}
      <ConfirmModal
        isOpen={confirmDeleteClass}
        onClose={() => setConfirmDeleteClass(false)}
        onConfirm={() => {
          setConfirmDeleteClass(false)
          handleDeleteClass()
        }}
        title="Hapus Kelas"
        message="Apakah kamu yakin ingin menghapus kelas ini beserta semua materi dan enrollments di dalamnya?"
        variant="danger"
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={confirmDeleteStudent.isOpen}
        onClose={() => setConfirmDeleteStudent({ isOpen: false, id: '' })}
        onConfirm={() => {
          handleRemoveStudent(confirmDeleteStudent.id)
          setConfirmDeleteStudent({ isOpen: false, id: '' })
        }}
        title="Keluarkan Siswa"
        message="Apakah kamu yakin ingin mengeluarkan siswa ini dari kelas?"
        variant="danger"
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={confirmDeleteMentor.isOpen}
        onClose={() => setConfirmDeleteMentor({ isOpen: false, id: '' })}
        onConfirm={() => {
          handleRemoveMentor(confirmDeleteMentor.id)
          setConfirmDeleteMentor({ isOpen: false, id: '' })
        }}
        title="Hapus Penugasan Mentor"
        message="Apakah kamu yakin ingin mencabut tugas mentor ini dari kelas?"
        variant="danger"
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={confirmDeleteFile.isOpen}
        onClose={() => setConfirmDeleteFile({ isOpen: false, id: '', path: '' })}
        onConfirm={() => {
          handleDeleteFile(confirmDeleteFile.id, confirmDeleteFile.path)
          setConfirmDeleteFile({ isOpen: false, id: '', path: '' })
        }}
        title="Hapus File Materi"
        message="Apakah kamu yakin ingin menghapus file ini dari kelas secara permanen?"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  )
}
