"use client";

import { useState } from "react";
import type { Profile } from "@/lib/supabase/types";
import { updateProfile } from "@/services/profile";
import { Save, User, DollarSign } from "lucide-react";

interface Props {
  profile: Profile | null;
}

export default function SettingsClient({ profile }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [currency, setCurrency] = useState(profile?.currency || "IDR");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile(profile.id, { full_name: fullName, currency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto flex flex-col gap-4 animate-fade-in">
      <h1 className="font-display font-800 text-2xl">⚙️ Pengaturan</h1>

      {/* Profile Card */}
      <div className="neo-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 bg-brand-yellow border-3 border-neo-border rounded-2xl flex items-center justify-center text-2xl"
               style={{ boxShadow: "3px 3px 0px #1A1A1A" }}>
            {fullName ? fullName[0].toUpperCase() : "👤"}
          </div>
          <div>
            <p className="font-display font-700">{fullName || "User"}</p>
            <p className="text-sm text-neo-muted">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="neo-label">
              <User size={14} className="inline mr-1" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama kamu"
              className="neo-input"
            />
          </div>

          <div>
            <label className="neo-label">
              <DollarSign size={14} className="inline mr-1" />
              Mata Uang
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="neo-select"
            >
              <option value="IDR">🇮🇩 IDR – Rupiah Indonesia</option>
              <option value="USD">🇺🇸 USD – US Dollar</option>
              <option value="SGD">🇸🇬 SGD – Singapore Dollar</option>
              <option value="MYR">🇲🇾 MYR – Malaysian Ringgit</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl px-3 py-2 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neo-btn-yellow w-full h-12 font-display font-700 text-base"
          >
            {saving ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : saved ? (
              "✅ Tersimpan!"
            ) : (
              <>
                <Save size={18} />
                Simpan Profil
              </>
            )}
          </button>
        </form>
      </div>

      {/* App Info */}
      <div className="neo-card p-4">
        <h3 className="font-display font-700 mb-3">ℹ️ Tentang WealthFlow</h3>
        <div className="flex flex-col gap-2 text-sm text-neo-muted">
          <p>Versi: <span className="font-700 text-neo-text">1.0.0</span></p>
          <p>Stack: <span className="font-700 text-neo-text">Next.js + Supabase</span></p>
          <p>Design: <span className="font-700 text-neo-text">Neo-Brutalism</span></p>
        </div>
      </div>
    </div>
  );
}
