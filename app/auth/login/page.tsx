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
      <h2 className="text-2xl font-bold mb-1">Masuk</h2>
      <p className="text-sm text-gray-500 mb-6">Selamat datang kembali! 👋</p>

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
          <div className="bg-red-100 border-2 border-red-400 rounded-xl px-3 py-2 text-sm text-red-700">
            ⚠️ {error}
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

      <p className="text-center text-sm mt-5 text-gray-500">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-bold text-black underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}