"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  if (success) {
    return (
      <div className="neo-card-lg p-8 text-center animate-slide-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-3 border-y2k-ink bg-brand-lime shadow-hard">
          <UserPlus size={26} strokeWidth={2.8} />
        </div>
        <h2 className="mb-2 font-wordmark text-2xl uppercase tracking-[-0.03em]">Akun Dibuat!</h2>
        <p className="text-y2k-muted">Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="neo-card-lg p-6 animate-slide-up">
      <h2 className="font-wordmark text-2xl uppercase tracking-[-0.03em]">Daftar</h2>
      <p className="mb-6 mt-1 text-sm text-y2k-muted">Mulai kelola keuanganmu.</p>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div>
          <label className="neo-label">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Budi Santoso"
            className="neo-input"
            required
          />
        </div>

        <div>
          <label className="neo-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="neo-input"
            required
          />
        </div>

        <div>
          <label className="neo-label">Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              className="neo-input pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-muted"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 text-center text-sm text-brand-red">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="neo-btn-green w-full mt-2 h-12 text-base font-700"
        >
          {loading ? (
            <span className="animate-pulse">Mendaftarkan...</span>
          ) : (
            <>
              <UserPlus size={18} />
              Buat Akun
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-y2k-muted">
        Sudah punya akun?{" "}
        <Link
          href="/auth/login"
          className="font-display font-800 text-y2k-ink underline decoration-2 underline-offset-2"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
