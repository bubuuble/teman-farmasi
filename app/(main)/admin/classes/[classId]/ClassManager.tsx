'use client'

import { useState, useRef, useTransition, useMemo } from 'react'
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
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight
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
  assignMultipleStudents,
  createSubClass,
  updateSubClass,
  deleteSubClass,
  assignMultipleStudentsToMentor,
  removeStudentFromMentor,
  reassignStudentMentor
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
    sub_class_id: string | null
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  enrollments: {
    id: string
    student_id: string
    sub_class_id: string | null
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  class_resources: {
    id: string
    title: string
    sub_class_id: string | null
    file_url: string
    file_path: string
    created_at: string
  }[]
}

type TabType = 'detail' | 'resources' | 'students' | 'mentors'

type SubClass = {
  id: string
  class_id: string
  title: string
  description: string | null
  session_offset: number
  created_at: string
}

type MentorStudentAssignment = {
  id: string
  mentor_id: string
  student_id: string
  class_id: string
  sub_class_id: string
  created_at: string
}

export default function ClassManager({
  kelas,
  subClasses,
  allStudents,
  allMentors,
  mentorStudentAssignments,
}: {
  kelas: ClassDetail
  subClasses: SubClass[]
  allStudents: any[]
  allMentors: any[]
  mentorStudentAssignments: MentorStudentAssignment[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('detail')
  const [isPending, startTransition] = useTransition()

  // Message & Error states
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const isPharmacamp = kelas.title?.startsWith('Pharmacamp')

  // Subclass States
  const [selectedSubClassId, setSelectedSubClassId] = useState<string | null>(subClasses[0]?.id || null)
  const [subClassActiveTab, setSubClassActiveTab] = useState<'detail' | 'students' | 'mentors' | 'resources'>('detail')
  const [newSubClassTitle, setNewSubClassTitle] = useState('')
  const [newSubClassDescription, setNewSubClassDescription] = useState('')
  const [newSubClassOffset, setNewSubClassOffset] = useState(0)
  const [isCreatingSubClass, setIsCreatingSubClass] = useState(false)
  const [editingSubClassId, setEditingSubClassId] = useState<string | null>(null)
  const [editingSubClassTitle, setEditingSubClassTitle] = useState('')
  const [editingSubClassDescription, setEditingSubClassDescription] = useState('')
  const [editingSubClassOffset, setEditingSubClassOffset] = useState(0)
  const [confirmDeleteSubClassId, setConfirmDeleteSubClassId] = useState<string | null>(null)

  // Helper untuk parse title kelas yang sudah ada (misal: "Pharma Research Mentoring 3")
  function parseTitleAndNumber(title: string): { program: string; number: string } {
    const programs = PROGRAMS.map(p => p.value).sort((a, b) => b.length - a.length)
    for (const p of programs) {
      if (title.startsWith(p)) {
        const rest = title.slice(p.length).trim()
        return { program: p, number: rest }
      }
    }
    return { program: title, number: '' }
  }

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const parsedTitle = parseTitleAndNumber(kelas.title)
  const [selectedProgram, setSelectedProgram] = useState(parsedTitle.program)
  const [classNumber, setClassNumber] = useState(parsedTitle.number)
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
  const [confirmDeleteMentorStudentAssignment, setConfirmDeleteMentorStudentAssignment] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' })

  // Mentor-Student Assignment states
  const [selectedMentorForStudents, setSelectedMentorForStudents] = useState<string>('')
  const [studentSearchForMentor, setStudentSearchForMentor] = useState('')
  const [selectedStudentIdsForMentor, setSelectedStudentIdsForMentor] = useState<string[]>([])
  const [expandedMentors, setExpandedMentors] = useState<Set<string>>(new Set())

  // Derived states / sorting / filtering
  const sortedStudents = [...allStudents].sort((a, b) => 
    (a.full_name || a.email).localeCompare(b.full_name || b.email, 'id')
  )
  const sortedMentors = [...allMentors].sort((a, b) => 
    (a.full_name || a.email).localeCompare(b.full_name || b.email, 'id')
  )

  const currentEnrollments = isPharmacamp 
    ? kelas.enrollments 
    : kelas.enrollments.filter(e => e.sub_class_id === selectedSubClassId)
  
  const currentMentors = isPharmacamp 
    ? kelas.class_mentors 
    : kelas.class_mentors.filter(m => m.sub_class_id === selectedSubClassId)

  const currentResources = isPharmacamp 
    ? kelas.class_resources 
    : kelas.class_resources.filter(r => r.sub_class_id === selectedSubClassId)

  const enrolledStudentIds = new Set(currentEnrollments.map(e => e.student_id))
  
  const enrollableStudents = useMemo(() => {
    const list = sortedStudents.filter(s => !enrolledStudentIds.has(s.id))
    return list.sort((a, b) => {
      const enrollA = kelas.enrollments.find(e => e.student_id === a.id)
      const enrollB = kelas.enrollments.find(e => e.student_id === b.id)
      
      const scoreA = enrollA ? (enrollA.sub_class_id === null ? 2 : 1) : 0
      const scoreB = enrollB ? (enrollB.sub_class_id === null ? 2 : 1) : 0
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      
      return (a.full_name || a.email).localeCompare(b.full_name || b.email, 'id')
    })
  }, [sortedStudents, enrolledStudentIds, kelas.enrollments])

  const filteredStudents = enrollableStudents.filter(s => {
    const searchLower = studentSearch.toLowerCase()
    const fullName = (s.full_name || '').toLowerCase()
    const email = (s.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  const assignedMentorIds = new Set(currentMentors.map(m => m.mentor_id))
  const assignableMentors = sortedMentors.filter(m => !assignedMentorIds.has(m.id))

  // Mentor-Student Assignment derived values
  const currentMSAssignments = mentorStudentAssignments.filter(
    a => a.sub_class_id === selectedSubClassId
  )
  // Student IDs yang SUDAH di-assign ke mentor mana pun di sub_class ini
  const assignedStudentIds = new Set(currentMSAssignments.map(a => a.student_id))
  // Student yang terdaftar di sub_class ini tapi belum di-assign ke mentor mana pun
  const unassignedStudents = currentEnrollments.filter(e => !assignedStudentIds.has(e.student_id))
  // Helper: dapat list student yang di-assign ke mentor tertentu
  const getStudentsForMentor = (mentorId: string) => {
    const assignmentIds = currentMSAssignments
      .filter(a => a.mentor_id === mentorId)
      .map(a => a.student_id)
    return currentEnrollments.filter(e => assignmentIds.includes(e.student_id)).map(e => ({
      ...e,
      assignmentId: currentMSAssignments.find(a => a.mentor_id === mentorId && a.student_id === e.student_id)?.id || ''
    }))
  }
  // Student enrolled di sub_class ini yang belum di-assign ke mentor yang sedang dipilih
  const getAssignableStudentsForMentor = (mentorId: string) => {
    const alreadyAssignedToThisMentor = new Set(
      currentMSAssignments.filter(a => a.mentor_id === mentorId).map(a => a.student_id)
    )
    return currentEnrollments.filter(e => !alreadyAssignedToThisMentor.has(e.student_id))
  }
  const assignableStudentsForSelectedMentor = selectedMentorForStudents
    ? getAssignableStudentsForMentor(selectedMentorForStudents)
    : []
  const filteredStudentsForMentor = assignableStudentsForSelectedMentor.filter(e => {
    const searchLower = studentSearchForMentor.toLowerCase()
    const fullName = (e.profiles?.full_name || '').toLowerCase()
    const email = (e.profiles?.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  const filteredMentors = assignableMentors.filter(m => {
    const searchLower = mentorSearch.toLowerCase()
    const fullName = (m.full_name || '').toLowerCase()
    const email = (m.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

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

  const composedTitle = classNumber
    ? `${selectedProgram} ${classNumber}`.trim()
    : selectedProgram

  const handleEditClassSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', kelas.id)
      formData.append('title', composedTitle)
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

  const handleEnterEditMode = () => {
    const parsed = parseTitleAndNumber(kelas.title)
    setSelectedProgram(parsed.program)
    setClassNumber(parsed.number)
    setEditLevel(kelas.level || '')
    setEditPrice(kelas.price)
    setEditDescription(kelas.description || '')
    setIsEditMode(true)
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
      const res = await assignMultipleStudents(kelas.id, selectedStudentIds, (!isPharmacamp && selectedSubClassId) ? selectedSubClassId : undefined)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback(res.success || 'Student berhasil didaftarkan!', '')
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
        showFeedback('Student dikeluarkan dari kelas.', '')
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
      if (!isPharmacamp && selectedSubClassId) {
        formData.append('subClassId', selectedSubClassId)
      }

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
      if (!isPharmacamp && selectedSubClassId) {
        formData.append('subClassId', selectedSubClassId)
      }

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

  // --- MENTOR-STUDENT ASSIGNMENT HANDLERS ---

  const handleAssignStudentsToMentor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentorForStudents || selectedStudentIdsForMentor.length === 0 || !selectedSubClassId) return
    startTransition(async () => {
      const res = await assignMultipleStudentsToMentor(
        selectedMentorForStudents,
        selectedStudentIdsForMentor,
        kelas.id,
        selectedSubClassId
      )
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback(res.success || 'Student berhasil di-assign!', '')
        setSelectedStudentIdsForMentor([])
        setStudentSearchForMentor('')
      }
    })
  }

  const handleRemoveStudentFromMentor = (assignmentId: string) => {
    startTransition(async () => {
      const res = await removeStudentFromMentor(assignmentId)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Student di-unassign dari mentor.', '')
      }
    })
  }

  const toggleMentorExpand = (mentorId: string) => {
    setExpandedMentors(prev => {
      const next = new Set(prev)
      if (next.has(mentorId)) {
        next.delete(mentorId)
      } else {
        next.add(mentorId)
      }
      return next
    })
  }

  const handleCreateSubClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubClassTitle.trim()) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('classId', kelas.id)
      formData.append('title', newSubClassTitle.trim())
      formData.append('description', newSubClassDescription.trim())
      formData.append('session_offset', String(newSubClassOffset || 0))
      const res = await createSubClass({}, formData)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Sub kelas berhasil dibuat!', '')
        setNewSubClassTitle('')
        setNewSubClassDescription('')
        setNewSubClassOffset(0)
        setIsCreatingSubClass(false)
        router.refresh()
      }
    })
  }

  const handleUpdateSubClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubClassId || !editingSubClassTitle.trim()) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', editingSubClassId)
      formData.append('title', editingSubClassTitle.trim())
      formData.append('description', editingSubClassDescription.trim())
      formData.append('session_offset', String(editingSubClassOffset || 0))
      const res = await updateSubClass({}, formData)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Sub kelas berhasil diperbarui!', '')
        setEditingSubClassId(null)
        setEditingSubClassTitle('')
        setEditingSubClassDescription('')
        setEditingSubClassOffset(0)
        router.refresh()
      }
    })
  }

  const handleDeleteSubClass = (id: string) => {
    startTransition(async () => {
      const res = await deleteSubClass(id)
      if (res.error) {
        showFeedback('', res.error)
      } else {
        showFeedback('Sub kelas berhasil dihapus!', '')
        if (selectedSubClassId === id) {
          setSelectedSubClassId(subClasses.find(s => s.id !== id)?.id || null)
        }
        router.refresh()
      }
    })
  }

  if (!isPharmacamp) {
    const selectedSubClass = subClasses.find(s => s.id === selectedSubClassId)

    return (
      <div className="space-y-8">
        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 text-sm border border-green-100 shadow-sm animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100 shadow-sm animate-in fade-in duration-200">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Unassigned subclass warning */}
        {kelas.enrollments.filter(e => e.sub_class_id === null).length > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 text-sm text-orange-850 shadow-sm animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-orange-950">Ada Student Belum Masuk Sub Kelas</p>
              <p className="text-xs text-orange-800/80 mt-0.5">
                Terdapat <span className="font-bold text-orange-900">{kelas.enrollments.filter(e => e.sub_class_id === null).length} student</span> yang sudah terdaftar di kelas ini (via pembayaran/order), tetapi belum dimasukkan ke sub kelas (peminatan) mana pun. Silakan pilih sub kelas di sebelah kiri, buka tab <strong>Assign Student</strong>, lalu masukkan mereka.
              </p>
            </div>
          </div>
        )}

        {/* NEW SECTION: Class Student Directory */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-brand-dark">Direktori Student Kelas</h3>
              <p className="text-xs text-brand-gray mt-0.5 font-medium">Daftar seluruh student yang terdaftar di kelas ini beserta peminatan (sub kelas) mereka.</p>
            </div>
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-100 w-fit">
              Total {kelas.enrollments?.length || 0} Student
            </span>
          </div>

          <div className="overflow-x-auto">
            {kelas.enrollments?.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-8 text-center">Belum ada student terdaftar di kelas ini.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-brand-gray uppercase bg-gray-50/50">
                    <th className="py-3 px-4 rounded-l-xl">Nama Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Peminatan (Sub Kelas)</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kelas.enrollments.map((enroll) => {
                    return (
                      <tr key={enroll.id} className="hover:bg-gray-50/30 transition-colors text-sm">
                        <td className="py-3.5 px-4 font-bold text-brand-dark">
                          {enroll.profiles?.full_name || 'Tanpa Nama'}
                        </td>
                        <td className="py-3.5 px-4 text-brand-gray">
                          {enroll.profiles?.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={enroll.sub_class_id || ''}
                            onChange={(e) => {
                              const newSubId = e.target.value || undefined
                              startTransition(async () => {
                                const res = await assignMultipleStudents(kelas.id, [enroll.student_id], newSubId)
                                if (res.error) {
                                  showFeedback('', res.error)
                                } else {
                                  showFeedback('Peminatan student berhasil diperbarui!', '')
                                  router.refresh()
                                }
                              })
                            }}
                            className={`p-2 rounded-xl border text-xs font-semibold outline-none focus:border-brand-blue bg-white cursor-pointer
                              ${enroll.sub_class_id 
                                ? 'border-gray-200 text-brand-dark' 
                                : 'border-orange-200 bg-orange-50/50 text-orange-700 font-bold'
                              }
                            `}
                            disabled={isPending}
                          >
                            <option value="">-- Pilih Peminatan (Belum Ditentukan) --</option>
                            {subClasses.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.title}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setConfirmDeleteStudent({ isOpen: true, id: enroll.id })}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors inline-flex items-center justify-center"
                            title="Keluarkan dari Kelas"
                            disabled={isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* TOP SECTION: Detail Kelas Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-card p-8">
          {!isEditMode ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {kelas.level || "Regular"}
                  </span>
                  <span className="px-2.5 py-1 bg-brand-pink/10 text-brand-pink text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Kelas Wrapper (Peminatan)
                  </span>
                </div>
                <h2 className="font-heading font-bold text-3xl text-brand-dark">{kelas.title}</h2>
                <p className="text-xl font-extrabold text-brand-dark" suppressHydrationWarning>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kelas.price)}
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-4xl mt-3">
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-1.5 opacity-60">Deskripsi Kelas</h4>
                  <p className="text-brand-dark text-sm leading-relaxed whitespace-pre-line">
                    {kelas.description || "Tidak ada deskripsi."}
                  </p>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-3 shrink-0 self-start md:self-center">
                <button
                  onClick={handleEnterEditMode}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-cream text-brand-dark rounded-xl text-xs font-bold hover:bg-brand-darkblue hover:text-white transition-all shadow-sm w-full"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Detail Kelas
                </button>
                <button
                  onClick={() => setConfirmDeleteClass(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Kelas
                </button>
              </div>
            </div>
          ) : (
            // EDIT FORM INLINE
            <form onSubmit={handleEditClassSubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="font-heading font-bold text-lg text-brand-dark">Edit Detail Kelas</h3>
                <p className="text-xs text-brand-gray">Perbarui informasi utama untuk kelas wrapper ini.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value)
                    const prog = PROGRAMS.find(p => p.value === e.target.value)
                    if (prog) setEditDescription(prog.description)
                  }}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                  required
                >
                  <option value="" disabled>Pilih program...</option>
                  {PROGRAMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">
                  Nomor Kelas <span className="text-brand-gray font-normal normal-case">(opsional, misal: 1 → &quot;{selectedProgram || 'Program'} 1&quot;)</span>
                </label>
                <input
                  type="text"
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                  placeholder="Kosongkan jika hanya 1 kelas"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                />
                {composedTitle && (
                  <p className="text-xs text-brand-blue font-semibold mt-1">
                    Nama kelas: <span className="font-bold">{composedTitle}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Jumlah Pertemuan/Hari</label>
                  <input
                    type="text"
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

        {/* BOTTOM SECTION: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Sub Classes Cards */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center justify-between px-2">
              <span>Sub Kelas (Peminatan)</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full font-bold">
                {subClasses.length}
              </span>
            </h3>

            <div className="space-y-3">
              {subClasses.map((sub) => {
                const isSelected = selectedSubClassId === sub.id
                const studCount = kelas.enrollments.filter(e => e.sub_class_id === sub.id).length
                const mentCount = kelas.class_mentors.filter(m => m.sub_class_id === sub.id).length
                const resCount = kelas.class_resources.filter(r => r.sub_class_id === sub.id).length
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubClassId(sub.id)
                      setEditingSubClassId(null)
                    }}
                    className={`p-6 rounded-[24px] cursor-pointer transition-all border flex flex-col gap-3 relative overflow-hidden group
                      ${isSelected 
                        ? 'bg-brand-cream/20 border-brand-blue shadow-md' 
                        : 'bg-white border-gray-100 hover:border-brand-blue/30 hover:shadow-sm'
                      }
                    `}
                  >
                    <h4 className="font-bold text-brand-dark text-base line-clamp-2">
                      {sub.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-50 text-[10px] font-bold text-brand-gray text-center">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="block text-brand-dark text-sm">{studCount}</span>
                        Siswa
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="block text-brand-dark text-sm">{mentCount}</span>
                        Mentor
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="block text-brand-dark text-sm">{resCount}</span>
                        E-Book
                      </div>
                    </div>
                  </div>
                )
              })}

              {!isCreatingSubClass ? (
                <button
                  onClick={() => setIsCreatingSubClass(true)}
                  className="w-full p-5 rounded-[24px] border-2 border-dashed border-gray-200 text-brand-gray font-bold hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Sub Kelas
                </button>
              ) : (
                <form onSubmit={handleCreateSubClass} className="bg-gray-50 p-5 rounded-[24px] border border-gray-200 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-brand-dark uppercase">Tambah Sub Kelas</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase">Nama Peminatan</label>
                    <input
                      type="text"
                      value={newSubClassTitle}
                      onChange={(e) => setNewSubClassTitle(e.target.value)}
                      placeholder="Contoh: Peminatan Industri"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase">Deskripsi Peminatan</label>
                    <textarea
                      value={newSubClassDescription}
                      onChange={(e) => setNewSubClassDescription(e.target.value)}
                      placeholder="Tuliskan deskripsi peminatan..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1 bg-amber-50/60 border border-amber-100 rounded-xl p-3">
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Mulai dari Sesi ke- (Opsional)</label>
                    <input
                      type="number"
                      min={0}
                      value={newSubClassOffset || ''}
                      onChange={(e) => setNewSubClassOffset(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full p-3 rounded-xl border border-amber-200 outline-none focus:border-amber-400 bg-white text-sm"
                      disabled={isPending}
                    />
                    <p className="text-[10px] text-amber-600 leading-relaxed">
                      Isi ini jika kelas sudah berjalan beberapa sesi secara manual sebelum migrasi ke sistem ini. 
                      Contoh: isi <strong>2</strong> jika sudah ada 2 sesi manual → sesi baru di sistem akan mulai dari <strong>Sesi 3</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCreatingSubClass(false)}
                      className="px-3 py-1.5 bg-gray-200 text-brand-dark rounded-lg text-xs font-semibold hover:bg-gray-300 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-3 py-1.5 bg-brand-darkblue text-white rounded-lg text-xs font-semibold hover:bg-brand-dark transition-all flex items-center gap-1"
                    >
                      {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sub Class Action Tabs */}
          <div className="lg:col-span-8">
            {selectedSubClass ? (
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-card overflow-hidden flex flex-col min-h-[500px]">
                {/* Tabs Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSubClassActiveTab('detail'); setEditingSubClassId(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${subClassActiveTab === 'detail' 
                        ? 'bg-brand-darkblue text-white shadow-sm' 
                        : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
                      }`}
                  >
                    <Info className="w-4 h-4" />
                    Detail Sub Kelas
                  </button>

                  <button
                    onClick={() => setSubClassActiveTab('students')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${subClassActiveTab === 'students' 
                        ? 'bg-brand-darkblue text-white shadow-sm' 
                        : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
                      }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Assign Student
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
                      ${subClassActiveTab === 'students' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
                      {currentEnrollments.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubClassActiveTab('mentors')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${subClassActiveTab === 'mentors' 
                        ? 'bg-brand-darkblue text-white shadow-sm' 
                        : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    Assign Mentor
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
                      ${subClassActiveTab === 'mentors' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
                      {currentMentors.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubClassActiveTab('resources')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${subClassActiveTab === 'resources' 
                        ? 'bg-brand-darkblue text-white shadow-sm' 
                        : 'text-brand-gray hover:text-brand-dark hover:bg-gray-100'
                      }`}
                  >
                    <FileText className="w-4 h-4" />
                    E-Book
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1
                      ${subClassActiveTab === 'resources' ? 'bg-white/20 text-white' : 'bg-gray-200 text-brand-dark'}`}>
                      {currentResources.length}
                    </span>
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6 md:p-8 flex-1">
                  {/* TAB: Detail Sub Kelas */}
                  {subClassActiveTab === 'detail' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {editingSubClassId !== selectedSubClass.id ? (
                        <div className="space-y-6">
                          <div>
                            <span className="px-2.5 py-1 bg-brand-cream text-brand-dark text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Detail Sub Kelas
                            </span>
                            <h3 className="font-heading font-bold text-2xl text-brand-dark mt-3">{selectedSubClass.title}</h3>
                            <p className="text-xs text-brand-gray mt-1">Dibuat pada {new Date(selectedSubClass.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-2xl mt-4">
                              <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 opacity-60">Deskripsi Sub Kelas / Peminatan</h4>
                              <p className="text-brand-dark text-sm leading-relaxed whitespace-pre-line">
                                {selectedSubClass.description || "Tidak ada deskripsi."}
                              </p>
                            </div>

                            {selectedSubClass.session_offset > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                                  ⚡ Mulai dari Sesi {selectedSubClass.session_offset + 1} (offset: {selectedSubClass.session_offset} sesi manual)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => {
                                setEditingSubClassId(selectedSubClass.id)
                                setEditingSubClassTitle(selectedSubClass.title)
                                setEditingSubClassDescription(selectedSubClass.description || '')
                                setEditingSubClassOffset(selectedSubClass.session_offset || 0)
                              }}
                              className="flex items-center gap-2 px-5 py-3 bg-brand-cream text-brand-dark rounded-xl text-xs font-bold hover:bg-brand-darkblue hover:text-white transition-all shadow-sm"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit Sub Kelas
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSubClassId(selectedSubClass.id)}
                              className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              Hapus Sub Kelas
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleUpdateSubClass} className="space-y-4 max-w-lg animate-in fade-in duration-200">
                          <h4 className="font-bold text-brand-dark text-base">Edit Sub Kelas</h4>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-dark uppercase">Nama Peminatan</label>
                            <input
                              type="text"
                              value={editingSubClassTitle}
                              onChange={(e) => setEditingSubClassTitle(e.target.value)}
                              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                              required
                              disabled={isPending}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-dark uppercase">Deskripsi Peminatan</label>
                            <textarea
                              value={editingSubClassDescription}
                              onChange={(e) => setEditingSubClassDescription(e.target.value)}
                              placeholder="Tuliskan deskripsi..."
                              rows={4}
                              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                              disabled={isPending}
                            />
                          </div>
                          <div className="space-y-1 bg-amber-50/60 border border-amber-100 rounded-xl p-3">
                            <label className="text-[10px] font-bold text-amber-700 uppercase">Mulai dari Sesi ke- (Opsional)</label>
                            <input
                              type="number"
                              min={0}
                              value={editingSubClassOffset || ''}
                              onChange={(e) => setEditingSubClassOffset(parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full p-3 rounded-xl border border-amber-200 outline-none focus:border-amber-400 bg-white text-sm"
                              disabled={isPending}
                            />
                            <p className="text-[10px] text-amber-600 leading-relaxed">
                              Isi ini jika kelas sudah berjalan beberapa sesi secara manual sebelum migrasi ke sistem ini.
                              Contoh: isi <strong>2</strong> jika sudah ada 2 sesi manual → sesi baru di sistem akan mulai dari <strong>Sesi 3</strong>.
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={isPending}
                              className="px-5 py-3 bg-brand-darkblue text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-2"
                            >
                              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSubClassId(null)}
                              className="px-5 py-3 bg-gray-100 text-brand-dark rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB: Assign Student */}
                  {subClassActiveTab === 'students' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">

                      {/* Left Column: Enroll Student Form */}
                      <div className="lg:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 h-fit space-y-4">
                        <div>
                          <h4 className="font-bold text-sm text-brand-dark">Enroll Student ke Peminatan Ini</h4>
                          <p className="text-xs text-brand-gray mt-0.5">Daftarkan atau pindahkan student ke peminatan ini.</p>
                        </div>
                        <form onSubmit={handleAddStudentSubmit} className="space-y-2">
                          <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            placeholder="Cari nama atau email student..."
                            className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white"
                            disabled={isPending}
                          />
                          <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-white">
                            {filteredStudents.length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-4 text-center">
                                {studentSearch ? 'Tidak ada yang cocok.' : 'Semua student sudah terdaftar di peminatan ini.'}
                              </p>
                            ) : (
                              <div className="p-2 space-y-1">
                                {filteredStudents.map((s) => {
                                  const isChecked = selectedStudentIds.includes(s.id)
                                  return (
                                    <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStudentIds([...selectedStudentIds, s.id])
                                          } else {
                                            setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id))
                                          }
                                        }}
                                        className="rounded text-brand-blue focus:ring-brand-blue"
                                        disabled={isPending}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-brand-dark truncate text-xs">{s.full_name || 'Tanpa Nama'}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{s.email}</p>
                                      </div>
                                      {(() => {
                                        const mainClassEnrollment = kelas.enrollments.find(e => e.student_id === s.id)
                                        if (!mainClassEnrollment) return null
                                        if (mainClassEnrollment.sub_class_id === null) {
                                          return (
                                            <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                              Belum ada Peminatan
                                            </span>
                                          )
                                        } else {
                                          const otherSubClass = subClasses.find(sc => sc.id === mainClassEnrollment.sub_class_id)
                                          return (
                                            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold flex-shrink-0 max-w-[120px] truncate" title={otherSubClass?.title || "Peminatan Lain"}>
                                              Peminatan: {otherSubClass?.title || "Lain"}
                                            </span>
                                          )
                                        }
                                      })()}
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          <button
                            type="submit"
                            disabled={isPending || selectedStudentIds.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                          >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Enroll {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ` : ''}Student
                          </button>
                        </form>
                      </div>

                      {/* Right Column: Enrolled Students List & Mentor Assignment */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Section: Student Terdaftar di Peminatan */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-heading font-bold text-sm text-brand-dark">Student Terdaftar di Peminatan</h4>
                            <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold">
                              {currentEnrollments.length} Terdaftar
                            </span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-gray-50/30 p-3 rounded-2xl border border-gray-100/80">
                            {currentEnrollments.length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-6 text-center">Belum ada student di peminatan ini.</p>
                            ) : (
                              currentEnrollments.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 hover:border-brand-blue/20 transition-colors">
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <div className="w-8 h-8 bg-brand-cream text-brand-dark rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                      {item.profiles?.full_name?.[0] || 'S'}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-xs text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</p>
                                      <p className="text-[10px] text-gray-400 truncate">{item.profiles?.email}</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setConfirmDeleteStudent({ isOpen: true, id: item.id })}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    title="Keluarkan dari peminatan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Section: Assign ke Mentor */}
                        <div className="border-t border-gray-100 pt-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-brand-dark">Assign Student ke Mentor</h4>
                            {unassignedStudents.length > 0 && (
                              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {unassignedStudents.length} belum di-assign
                              </span>
                            )}
                          </div>

                          {currentMentors.length === 0 ? (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                              <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-1.5" />
                              <p className="text-xs font-bold text-orange-700">Belum ada mentor di peminatan ini</p>
                              <p className="text-[10px] text-orange-500 mt-0.5">Assign mentor di tab "Assign Mentor" terlebih dahulu.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Form assign: pilih mentor, lalu pilih student */}
                              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Form Assign Student → Mentor</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Pilih Mentor */}
                                  <div>
                                    <label className="text-[10px] font-bold text-brand-dark uppercase mb-1 block">Pilih Mentor</label>
                                    <select
                                      value={selectedMentorForStudents}
                                      onChange={(e) => {
                                        setSelectedMentorForStudents(e.target.value)
                                        setSelectedStudentIdsForMentor([])
                                        setStudentSearchForMentor('')
                                      }}
                                      className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                                      disabled={isPending}
                                    >
                                      <option value="">-- Pilih Mentor --</option>
                                      {currentMentors.map(m => (
                                        <option key={m.id} value={m.mentor_id}>
                                          {m.profiles?.full_name || m.profiles?.email || 'Mentor'}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Cari Student */}
                                  {selectedMentorForStudents && (
                                    <div>
                                      <label className="text-[10px] font-bold text-brand-dark uppercase mb-1 block">Cari Student</label>
                                      <input
                                        type="text"
                                        value={studentSearchForMentor}
                                        onChange={(e) => setStudentSearchForMentor(e.target.value)}
                                        placeholder="Nama atau email..."
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white"
                                        disabled={isPending}
                                      />
                                    </div>
                                  )}
                                </div>

                                {selectedMentorForStudents && (
                                  <form onSubmit={handleAssignStudentsToMentor} className="space-y-2">
                                    <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto bg-white">
                                      {filteredStudentsForMentor.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic py-4 text-center">
                                          {currentEnrollments.length === 0
                                            ? 'Belum ada student enrolled di peminatan ini.'
                                            : 'Semua student sudah di-assign ke mentor ini.'}
                                        </p>
                                      ) : (
                                        <div className="p-2 space-y-1">
                                          {filteredStudentsForMentor.map((e) => {
                                            const isChecked = selectedStudentIdsForMentor.includes(e.student_id)
                                            // Find if this student is already assigned to another mentor
                                            const existingAssignment = currentMSAssignments.find(a => a.student_id === e.student_id)
                                            const existingMentorData = existingAssignment
                                              ? currentMentors.find(m => m.mentor_id === existingAssignment.mentor_id)
                                              : null
                                            return (
                                              <label key={e.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(ev) => {
                                                    if (ev.target.checked) {
                                                      setSelectedStudentIdsForMentor([...selectedStudentIdsForMentor, e.student_id])
                                                    } else {
                                                      setSelectedStudentIdsForMentor(selectedStudentIdsForMentor.filter(id => id !== e.student_id))
                                                    }
                                                  }}
                                                  className="rounded text-brand-blue focus:ring-brand-blue"
                                                  disabled={isPending}
                                                />
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-bold text-brand-dark truncate text-xs">{e.profiles?.full_name || 'Tanpa Nama'}</p>
                                                  <p className="text-[10px] text-gray-400 truncate">{e.profiles?.email}</p>
                                                </div>
                                                {existingMentorData && (
                                                  <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                                                    Di mentor lain
                                                  </span>
                                                )}
                                              </label>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="submit"
                                      disabled={isPending || selectedStudentIdsForMentor.length === 0}
                                      className="w-full flex items-center justify-center gap-2 bg-brand-pink text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                                    >
                                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                      Assign {selectedStudentIdsForMentor.length > 0 ? `${selectedStudentIdsForMentor.length} ` : ''}Student ke Mentor Ini
                                    </button>
                                  </form>
                                )}
                              </div>

                              {/* List mentor + student mereka */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-wider px-1">Daftar Mentor & Student Mereka</p>
                                {currentMentors.map(mentor => {
                                  const mentorStudents = getStudentsForMentor(mentor.mentor_id)
                                  const isExpanded = expandedMentors.has(mentor.mentor_id)
                                  return (
                                    <div key={mentor.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                      <button
                                        onClick={() => toggleMentorExpand(mentor.mentor_id)}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                                      >
                                        <div className="w-9 h-9 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                                          {mentor.profiles?.full_name?.[0] || 'M'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-bold text-sm text-brand-dark truncate">{mentor.profiles?.full_name || 'Tanpa Nama'}</p>
                                          <p className="text-[10px] text-gray-400 truncate">{mentor.profiles?.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${mentorStudents.length === 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}>
                                            {mentorStudents.length} Student
                                          </span>
                                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                      </button>

                                      {isExpanded && (
                                        <div className="border-t border-gray-50 divide-y divide-gray-50">
                                          {mentorStudents.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic py-4 text-center">Belum ada student di-assign ke mentor ini.</p>
                                          ) : (
                                            mentorStudents.map(item => (
                                              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                  <div className="w-8 h-8 bg-brand-cream text-brand-dark rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                                    {item.profiles?.full_name?.[0] || 'S'}
                                                  </div>
                                                  <div className="min-w-0">
                                                    <p className="font-bold text-xs text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{item.profiles?.email}</p>
                                                  </div>
                                                </div>
                                                <button
                                                  onClick={() => setConfirmDeleteMentorStudentAssignment({ isOpen: true, id: item.assignmentId })}
                                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                  title="Unassign dari mentor ini"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Student yang belum di-assign ke mentor mana pun */}
                              {unassignedStudents.length > 0 && (
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                  <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Student Belum Di-assign ke Mentor ({unassignedStudents.length})
                                  </p>
                                  <div className="space-y-1.5">
                                    {unassignedStudents.map(e => (
                                      <div key={e.id} className="flex items-center gap-2 bg-white rounded-xl p-2.5">
                                        <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                                          {e.profiles?.full_name?.[0] || 'S'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-bold text-xs text-brand-dark truncate">{e.profiles?.full_name || 'Tanpa Nama'}</p>
                                          <p className="text-[10px] text-gray-400 truncate">{e.profiles?.email}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB: Assign Mentor */}
                  {subClassActiveTab === 'mentors' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                      {/* Left form */}
                      <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
                        <div>
                          <h3 className="font-heading font-bold text-base text-brand-dark">Tugaskan Mentor</h3>
                          <p className="text-xs text-brand-gray">Pilih mentor untuk sub kelas ini.</p>
                        </div>
                        <form onSubmit={handleAddMentorSubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-brand-dark uppercase">Pilih Mentor</label>
                            <input
                              type="text"
                              value={mentorSearch}
                              onChange={(e) => setMentorSearch(e.target.value)}
                              placeholder="Cari nama atau email..."
                              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white mb-2"
                              disabled={isPending}
                            />
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

                      {/* Right list */}
                      <div className="lg:col-span-7 space-y-4">
                        <h3 className="font-heading font-bold text-base text-brand-dark">Mentor Ditugaskan</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {currentMentors.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada mentor di sub kelas ini.</p>
                          ) : (
                            currentMentors.map((item) => (
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

                  {/* TAB: E-Book */}
                  {subClassActiveTab === 'resources' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                      {/* Left side: Upload Form */}
                      <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
                        <div>
                          <h3 className="font-heading font-bold text-base text-brand-dark">Upload E-Book</h3>
                          <p className="text-xs text-brand-gray">Unggah modul ajar untuk sub kelas ini.</p>
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
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 animate-pulse text-xs text-blue-700">
                              Sedang mengupload file...
                            </div>
                          )}
                          <button
                            type="submit"
                            disabled={isPending || !selectedFile || !uploadTitle}
                            className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                          >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Upload E-Book
                          </button>
                        </form>
                      </div>

                      {/* Right side: Resource List */}
                      <div className="lg:col-span-7 space-y-4">
                        <h3 className="font-heading font-bold text-base text-brand-dark">Daftar E-Book & Materi</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {currentResources.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada materi di sub kelas ini.</p>
                          ) : (
                            currentResources.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    PDF
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-sm text-brand-dark truncate">{item.title}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Uploaded: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={item.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                                    title="Download/Buka"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => setConfirmDeleteFile({ isOpen: true, id: item.id, path: item.file_path })}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] min-h-[500px]">
                <Info className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-bold text-brand-dark text-lg">Pilih Sub Kelas</h3>
                <p className="text-brand-gray text-sm mt-1 max-w-xs">Silakan pilih salah satu sub kelas di panel sebelah kiri untuk mulai mengelola detail, student, mentor, dan materi.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- CONFIRMATION MODALS --- */}
        <ConfirmModal
          isOpen={confirmDeleteClass}
          onClose={() => setConfirmDeleteClass(false)}
          onConfirm={() => {
            setConfirmDeleteClass(false)
            handleDeleteClass()
          }}
          title="Hapus Kelas"
          message="Apakah kamu yakin ingin menghapus kelas wrapper ini beserta semua sub kelas dan materi di dalamnya?"
          variant="danger"
          isLoading={isPending}
        />

        <ConfirmModal
          isOpen={confirmDeleteSubClassId !== null}
          onClose={() => setConfirmDeleteSubClassId(null)}
          onConfirm={() => {
            if (confirmDeleteSubClassId) {
              handleDeleteSubClass(confirmDeleteSubClassId)
            }
            setConfirmDeleteSubClassId(null)
          }}
          title="Hapus Sub Kelas"
          message="Apakah kamu yakin ingin menghapus sub kelas ini? Semua data students, mentors, ebooks, dan sessions di dalamnya akan terhapus atau terdampak."
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
          title="Keluarkan Student"
          message="Apakah kamu yakin ingin mengeluarkan student ini dari sub kelas?"
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
          message="Apakah kamu yakin ingin mencabut tugas mentor ini dari sub kelas?"
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
          message="Apakah kamu yakin ingin menghapus file ini dari sub kelas secara permanen?"
          variant="danger"
          isLoading={isPending}
        />

        <ConfirmModal
          isOpen={confirmDeleteMentorStudentAssignment.isOpen}
          onClose={() => setConfirmDeleteMentorStudentAssignment({ isOpen: false, id: '' })}
          onConfirm={() => {
            handleRemoveStudentFromMentor(confirmDeleteMentorStudentAssignment.id)
            setConfirmDeleteMentorStudentAssignment({ isOpen: false, id: '' })
          }}
          title="Hapus Assignment Mentor-Student"
          message="Apakah kamu yakin ingin melepaskan student ini dari mentor? Student akan menjadi unassigned."
          variant="danger"
          isLoading={isPending}
        />
      </div>
    )
  }

  // ORIGINAL PHARMACAMP LAYOUT
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
          Student Terdaftar
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
                    {kelas.level 
                      ? (kelas.title?.startsWith('Pharmacamp') ? `${kelas.level} Hari` : `${kelas.level}x Pertemuan`) 
                      : '-'
                    }
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
                    onClick={handleEnterEditMode}
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
                  <label className="text-xs font-bold text-brand-dark uppercase">Program</label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => {
                      setSelectedProgram(e.target.value)
                      // Auto-sync description
                      const prog = PROGRAMS.find(p => p.value === e.target.value)
                      if (prog) setEditDescription(prog.description)
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                    required
                  >
                    <option value="" disabled>Pilih program...</option>
                    {PROGRAMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">
                    Nomor Kelas <span className="text-brand-gray font-normal normal-case">(opsional, misal: 1 → &quot;{selectedProgram || 'Program'} 1&quot;)</span>
                  </label>
                  <input
                    type="text"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    placeholder="Kosongkan jika hanya 1 kelas"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                  />
                  {composedTitle && (
                    <p className="text-xs text-brand-blue font-semibold mt-1">
                      Nama kelas: <span className="font-bold">{composedTitle}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">
                      {kelas.title?.startsWith('Pharmacamp') ? 'Jumlah Hari' : 'Jumlah Pertemuan'}
                    </label>
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
                      <span className="text-xs text-blue-700 font-semibold">Mengunggah file...</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || !selectedFile || !uploadTitle}
                  className="w-full flex items-center justify-center gap-2 bg-brand-darkblue text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Unggah File
                </button>
              </form>
            </div>

            {/* Right side: Materials List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-dark">Daftar E-Book &amp; Materi</h3>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {kelas.class_resources?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada materi di kelas ini.</p>
                ) : (
                  kelas.class_resources.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-brand-dark truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Uploaded: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                          title="Buka / Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setConfirmDeleteFile({ isOpen: true, id: item.id, path: item.file_path })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* --- TAB 3: ATUR STUDENT --- */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Enroll Student Form */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Daftarkan Student Baru</h3>
                <p className="text-xs text-brand-gray">Masukkan student secara manual ke kelas ini.</p>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Pilih Student ({selectedStudentIds.length} Terpilih)</label>
                  
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
                        {studentSearch ? 'Tidak ada student yang cocok.' : 'Semua student sudah terdaftar.'}
                      </p>
                    ) : (
                      filteredStudents.map((s) => {
                        const isChecked = selectedStudentIds.includes(s.id)
                        return (
                          <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, s.id])
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id))
                                }
                              }}
                              className="rounded text-brand-blue focus:ring-brand-blue"
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
                  Daftarkan Student
                </button>
              </form>
            </div>

            {/* Right side: Enrolled Students List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-dark">Student Terdaftar</h3>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {kelas.enrollments?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">Belum ada student di kelas ini.</p>
                ) : (
                  kelas.enrollments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-brand-cream text-brand-dark rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
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

      {/* --- CONFIRMATION MODALS --- */}
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
        title="Keluarkan Student"
        message="Apakah kamu yakin ingin mengeluarkan student ini dari kelas?"
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
