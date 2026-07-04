// app/components/PageLoading.tsx

export default function PageLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-300">
      {/* Brand Logo Pulse */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-brand-pink/10 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-pink to-brand-darkblue flex items-center justify-center shadow-lg shadow-brand-pink/30">
          <div className="w-6 h-6 border-t-white rounded-full animate-spin" style={{ border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
        </div>
      </div>

      {/* Shimmer Content Blocks */}
      <div className="w-full max-w-4xl space-y-4 px-4">
        {/* Header row shimmer */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="h-4 w-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-7 w-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-9 w-full bg-gray-100 rounded-2xl animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <p className="text-brand-gray text-sm font-medium animate-pulse">Memuat halaman...</p>
    </div>
  )
}
