"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, DollarSign, LogOut, Save, Trash2, User } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { updateProfile } from "@/services/profile";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

interface Props {
  profile: Profile | null;
  initialAvatarUrl: string | null;
}

async function toSquareJpeg(file: File, size = 512): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gagal membaca file gambar."));
      img.src = objectUrl;
    });

    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Gagal memproses gambar."))),
        "image/jpeg",
        0.88
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function SettingsClient({ profile, initialAvatarUrl }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [currency, setCurrency] = useState(profile?.currency || "IDR");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
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
      router.refresh();
    } catch {
      setError("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile?.id) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("File harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setAvatarBusy(true);
    setAvatarError("");

    try {
      const blob = await toSquareJpeg(file, 512);
      const path = `${profile.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      await updateProfile(profile.id, { avatar_url: path });

      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60);

      setAvatarUrl(signed?.signedUrl || URL.createObjectURL(blob));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setAvatarError(
        message.toLowerCase().includes("bucket not found")
          ? "Storage avatar belum aktif. Jalankan migrasi 20261025_avatars_storage.sql di Supabase SQL Editor."
          : message
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!profile?.id || !profile.avatar_url || avatarBusy) return;
    if (!confirm("Hapus foto profil?")) return;

    setAvatarBusy(true);
    setAvatarError("");

    try {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
      await updateProfile(profile.id, { avatar_url: null });
      setAvatarUrl(null);
      router.refresh();
    } catch {
      setAvatarError("Gagal menghapus foto profil.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-4 pt-1 animate-fade-in">
      <div>
        <p className="y2k-eyebrow">Akun</p>
        <h1 className="mt-0.5 font-wordmark text-2xl uppercase leading-none tracking-[-0.04em]">
          Pengaturan
        </h1>
      </div>

      {/* Avatar */}
      <div className="y2k-card p-5">
        <div className="flex flex-col items-center text-center">
          <div className={avatarBusy ? "animate-pulse" : ""}>
            <Avatar
              name={fullName || profile?.email || "User"}
              src={avatarUrl}
              size={92}
              className="shadow-hard"
            />
          </div>

          <p className="mt-3 font-display text-lg font-700 leading-tight">
            {fullName || "User"}
          </p>
          <p className="text-xs text-y2k-muted">{profile?.email}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy || !profile?.id}
              className="neo-btn-chrome px-3 py-2 text-xs"
            >
              <Camera size={15} />
              {avatarBusy ? "Memproses..." : "Ganti Foto"}
            </button>

            {profile?.avatar_url && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarBusy}
                className="neo-btn-white px-3 py-2 text-xs text-brand-red"
              >
                <Trash2 size={15} />
                Hapus
              </button>
            )}
          </div>

          <p className="mt-2 max-w-[270px] text-[10px] leading-relaxed text-y2k-muted">
            JPG, PNG, atau WebP. Foto otomatis dipotong persegi 512px. Maks 5MB.
          </p>

          {avatarError && (
            <div className="mt-3 w-full rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 text-left text-xs font-display text-brand-red">
              {avatarError}
            </div>
          )}
        </div>
      </div>

      {/* Profile form */}
      <div className="y2k-card p-5">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="neo-label">
              <User size={13} className="mr-1 inline" />
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
              <DollarSign size={13} className="mr-1 inline" />
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
            <div className="rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neo-btn-yellow h-12 w-full text-base"
          >
            {saving ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : saved ? (
              "Tersimpan!"
            ) : (
              <>
                <Save size={18} />
                Simpan Profil
              </>
            )}
          </button>
        </form>
      </div>

      {/* App info */}
      <div className="y2k-card p-4">
        <h3 className="mb-3 font-wordmark text-base uppercase tracking-[-0.03em]">
          Tentang WealthFlow
        </h3>
        <div className="flex flex-col gap-2 text-xs text-y2k-muted">
          <p>Versi: <span className="font-mono font-700 text-y2k-ink">1.0.0</span></p>
          <p>Stack: <span className="font-display font-700 text-y2k-ink">Next.js + Supabase</span></p>
          <p>Design: <span className="font-display font-700 text-y2k-ink">Y2K Chrome</span></p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="neo-btn-white h-12 w-full text-sm text-brand-red"
      >
        <LogOut size={17} />
        Keluar dari Akun
      </button>
    </div>
  );
}
