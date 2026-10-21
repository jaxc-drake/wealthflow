export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh dotted-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow border-3 border-neo-border rounded-2xl mb-3"
               style={{ boxShadow: "4px 4px 0px #1A1A1A" }}>
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-display font-800 text-neo-text">
            WealthFlow
          </h1>
          <p className="text-sm text-neo-muted mt-1">Catat & Kelola Keuanganmu</p>
        </div>
        {children}
      </div>
    </div>
  );
}
