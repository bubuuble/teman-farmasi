'use client'

import { useState, useActionState, useRef } from 'react'
import { FileText, X, Upload, Trash2, Download, Loader2 } from 'lucide-react'
import { uploadResource, deleteResource, type ActionState } from './actions'
import ConfirmModal from '@/app/components/ConfirmModal'

// Tipe Data
type Resource = {
  id: string
  title: string
  file_url: string
  file_path: string
  created_at: string
}

const initialState: ActionState = { error: '', success: '' }

export default function ManageResources({ 
  classId, 
  classTitle,
  resources,
  inline
}: { 
  classId: string, 
  classTitle: string,
  resources: Resource[]
  inline?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(uploadResource, initialState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    path: string;
  }>({
    isOpen: false,
    id: '',
    path: '',
  });

  const uploadMessage = selectedFile 
    ? `Mengupload "${selectedFile.name}" (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)...`
    : ''

  const handleCloseModal = () => {
    setIsOpen(false)
    setSelectedFile(null)
  }

  const handleFormAction = async (formData: FormData) => {
    await formAction(formData)
    setSelectedFile(null)
    formRef.current?.reset()
  }

  const handleDelete = async (id: string, path: string) => {
    await deleteResource(id, path)
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024

  const handleFileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formElement = e.currentTarget
    const fileInput = formElement.querySelector('input[name="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        e.preventDefault()
        alert(`File terlalu besar! Maksimal ukuran adalah 50MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const renderContent = () => (
    <div className="space-y-6">
      {/* LIST RESOURCES */}
      <div>
        <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-brand-dark uppercase">File Tersedia</h4>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-bold">{resources.length} File</span>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {resources.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Belum ada materi diupload.</p>
          ) : (
            resources.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-brand-dark truncate">{item.title}</p>
                    <a 
                        href={item.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-brand-blue hover:underline flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                </div>
                <button 
                  onClick={() => setConfirmModal({ isOpen: true, id: item.id, path: item.file_path })}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Hapus File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

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

      <hr className="border-gray-100" />

      {/* FORM UPLOAD */}
      <form ref={formRef} action={handleFormAction} onSubmit={handleFileSubmit} className="space-y-3">
        <input type="hidden" name="classId" value={classId} />
        
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-brand-dark uppercase">Upload File Baru (PDF)</h4>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-semibold">Maks 50 MB</span>
        </div>
        
        <div className="space-y-2">
            <input 
                name="title" 
                type="text" 
                placeholder="Judul Materi (Misal: Modul Bab 1)" 
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue text-sm"
                required
                disabled={isPending}
            />
            
            <div className="flex gap-2">
                <input 
                    name="file" 
                    type="file" 
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="flex-1 p-2 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
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
                📎 File terpilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
        </div>

        {isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-700">Sedang mengupload...</p>
                <p className="text-xs text-blue-600">{uploadMessage}</p>
                <p className="text-[10px] text-blue-500 mt-1">Mohon tunggu, jangan tutup halaman ini</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" 
                   style={{ width: '100%', animation: 'progress 2s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {state?.error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">❌ {state.error}</p>}
        {state?.success && (
          <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">✅ Upload berhasil!</p>
        )}
      </form>
    </div>
  )

  if (inline) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-brand-dark">Kelola E-Book</h3>
            <p className="text-xs text-brand-gray">{classTitle}</p>
          </div>
        </div>
        {renderContent()}
      </div>
    )
  }

  return (
    <>
      {/* Trigger Button (Icon File) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-purple-500 hover:text-white transition-colors"
        title="Kelola E-Book & Materi"
      >
        <FileText className="w-4 h-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <div>
                <h3 className="font-heading font-bold text-lg text-brand-dark">E-Book & Materi</h3>
                <p className="text-xs text-brand-gray">{classTitle}</p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="text-brand-gray hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}