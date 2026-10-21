"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  userName: string;
  userId: string;
}

export default function TopBar({ userName }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-brand-yellow border-b-3 border-neo-border h-16 flex items-center px-4 justify-between"
            style={{ boxShadow: "0 4px 0px #1A1A1A" }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">💰</span>
        <span className="font-display font-800 text-xl text-neo-text">WealthFlow</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-display font-600 hidden sm:block">
          Hei, {userName.split(" ")[0]}!
        </span>
        <Link href="/dashboard/settings"
          className="w-9 h-9 flex items-center justify-center border-3 border-neo-border rounded-xl bg-white"
          style={{ boxShadow: "2px 2px 0px #1A1A1A" }}>
          <Settings size={16} />
        </Link>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center border-3 border-neo-border rounded-xl bg-white"
          style={{ boxShadow: "2px 2px 0px #1A1A1A" }}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
