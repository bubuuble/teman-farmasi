export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner Circle */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-brand-pink/20"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-pink border-r-brand-pink animate-spin"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-brand-dark font-bold text-lg">Memuat...</p>
          <p className="text-brand-pink/70 text-sm mt-1">Silakan tunggu sebentar</p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 bg-brand-pink rounded-full"
            style={{
              animation: 'bounce 1.4s infinite',
              animationDelay: '0s',
            }}
          ></div>
          <div
            className="w-2 h-2 bg-brand-pink rounded-full"
            style={{
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.2s',
            }}
          ></div>
          <div
            className="w-2 h-2 bg-brand-pink rounded-full"
            style={{
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.4s',
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          40% {
            transform: translateY(-10px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
