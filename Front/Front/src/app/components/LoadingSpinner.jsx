export function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-background h-screen w-screen' : 'min-h-[60vh] w-full'}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* SIKOS Pulsing Logo Container */}
        <div className="relative flex items-center justify-center h-20 w-20">
          <img
            src="/logo.png"
            alt="SIKOS Loading"
            className="h-16 w-16 object-contain animate-pulse"
            style={{
              animationDuration: '1.2s',
            }}
          />
          {/* Subtle spinning outer accent */}
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        
        {/* Premium Loading text with bouncing loading dots */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/70">Memuat SIKOS</span>
          <span className="flex gap-0.5 mt-0.5">
            <span className="h-1 w-1 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1 w-1 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1 w-1 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}

