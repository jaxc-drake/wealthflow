import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dotted-bg flex min-h-dvh items-center justify-center p-4">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="checker absolute -left-16 -top-12 h-56 w-56 rotate-6 opacity-60" />
        <div className="checker absolute -right-20 top-1/3 h-48 w-48 -rotate-6 opacity-40" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="chrome mx-auto flex h-16 w-16 rotate-3 items-center justify-center rounded-full border-4 border-y2k-ink shadow-hard-lg">
            <Zap size={30} className="fill-y2k-ink" strokeWidth={2.2} />
          </div>
          <h1 className="wordmark mt-4 text-[42px]">WealthFlow</h1>
          <p className="mt-1 font-display text-[10px] font-800 uppercase tracking-[0.2em] text-y2k-muted">
            Catat & kelola keuanganmu
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
