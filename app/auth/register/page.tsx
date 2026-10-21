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
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-display font-700 mb-2">Akun Dibuat!</h2>
        <p className="text-neo-muted">Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="neo-card-lg p-6 animate-slide-up">
      <h2 className="text-2xl font-display font-700 mb-1">Daftar</h2>
      <p className="text-sm text-neo-muted mb-6">Mulai kelola keuanganmu! 🚀</p>

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
          <div className="neo-badge bg-brand-pink text-white border-brand-red w-full justify-center py-2">
            ⚠️ {error}
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

      <p className="text-center text-sm mt-5 text-neo-muted">
        Sudah punya akun?{" "}
        <Link
          href="/auth/login"
          className="font-display font-700 text-neo-text underline underline-offset-2"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
