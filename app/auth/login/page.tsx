"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah: " + error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
    } else {
      setError("Session tidak ditemukan, coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="neo-card-lg p-6 animate-slide-up">
      <h2 className="font-wordmark text-2xl uppercase tracking-[-0.03em]">Masuk</h2>
      <p className="mb-6 mt-1 text-sm text-y2k-muted">Selamat datang kembali.</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              className="neo-input pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="neo-btn-black w-full mt-2 h-12 text-base"
        >
          {loading ? (
            <span>Masuk...</span>
          ) : (
            <>
              <LogIn size={18} />
              Masuk Sekarang
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-y2k-muted">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-display font-800 text-y2k-ink underline decoration-2 underline-offset-2">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}