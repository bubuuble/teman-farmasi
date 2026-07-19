'use client'

import { useState, useActionState, useRef } from 'react'
import { FileText, Upload, Trash2, Download, Loader2, BookOpen, X } from 'lucide-react'
import { uploadMentorResource, deleteMentorResource, type ActionState } from '../actions'
import ConfirmModal from '@/app/components/ConfirmModal'

type Resource = {
  id: string
  title: string
  file_url: string
  file_path: string
  created_at: string
}

const initialState: ActionState = { error: '', success: '' }

export default function MentorManageResources({
  classId,
  subClassId,
  resources,
}: {
  classId: string
  subClassId?: string | null
  resources: Resource[]
}) {
  const [state, formAction, isPending] = useActionState(uploadMentorResource, initialState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    id: string
    path: string
  }>({ isOpen: false, id: '', path: '' })

  const uploadMessage = selectedFile
    ? `Mengupload "${selectedFile.name}" (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)...`
    : ''

  const handleFormAction = async (formData: FormData) => {
    await formAction(formData)
    setSelectedFile(null)
    formRef.current?.reset()
  }

  const handleFileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const file = (e.currentTarget.querySelector('input[name="file"]') as HTMLInputElement)?.files?.[0]
    if (file && file.size > 50 * 1024 * 1024) {
      e.preventDefault()
      alert(`File terlalu besar! Maks 50MB. File kamu: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }
    if (file) setSelectedFile(file)
  }

  const handleDelete = async (id: string, path: string) => {
    await deleteMentorResource(id, path, classId)
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Modul &amp; E-Book
        </h3>
        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-md font-bold uppercase">
          {resources.length} File
        </span>
      </div>

      {/* Daftar Resource */}
      <div className="space-y-2">
        {resources.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-4 italic bg-gray-50 rounded-2xl">
            Belum ada modul. Upload sekarang!
          </p>
        ) : (
          resources.map((res) => (
            <div
              key={res.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-brand-dark truncate">{res.title}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(res.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-brand-cream text-brand-dark hover:bg-brand-darkblue hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setConfirmModal({ isOpen: true, id: res.id, path: res.file_path })}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: '', path: '' })}
        onConfirm={() => {
          handleDelete(confirmModal.id, confirmModal.path)
          setConfirmModal({ isOpen: false, id: '', path: '' })
        }}
        title="Hapus File"
        message="Apakah kamu yakin ingin menghapus file ini secara permanen?"
        variant="danger"
      />

      {/* Form Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-brand-dark uppercase">Upload File Baru</h4>
          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-semibold">
            Maks 50 MB
          </span>
        </div>

        <form
          ref={formRef}
          action={handleFormAction}
          onSubmit={handleFileSubmit}
          className="space-y-2"
        >
          <input type="hidden" name="classId" value={classId} />
          {subClassId && <input type="hidden" name="subClassId" value={subClassId} />}

          <input
            name="title"
            type="text"
            placeholder="Judul Materi (Misal: Modul Bab 1)"
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm disabled:opacity-50"
            required
            disabled={isPending}
          />

          <div className="flex gap-2">
            <input
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              className="flex-1 min-w-0 p-2 rounded-xl border border-gray-200 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-brand-darkblue text-white p-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 min-w-[48px] flex items-center justify-center"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </button>
          </div>

          {selectedFile && !isPending && (
            <p className="text-xs text-gray-500">
              📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          {isPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700">Sedang mengupload...</p>
                  <p className="text-xs text-blue-600">{uploadMessage}</p>
                  <p className="text-[10px] text-blue-500 mt-0.5">Mohon tunggu, jangan tutup halaman</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          )}

          {state?.error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {state.error}
            </div>
          )}
          {state?.success && (
            <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">✅ {state.success}</p>
          )}
        </form>
      </div>
    </section>
  )
}
