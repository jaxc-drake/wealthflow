import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface TopBarProps {
  userName: string;
  avatarUrl?: string | null;
}

function ChromeBolt() {
  return (
    <svg
      viewBox="0 0 28 40"
      aria-hidden="true"
      className="h-8 w-7 shrink-0 -rotate-3"
    >
      <defs>
        <linearGradient id="boltChrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cfd1d8" />
          <stop offset="55%" stopColor="#7f828c" />
          <stop offset="75%" stopColor="#f8f8f9" />
          <stop offset="100%" stopColor="#a9acb5" />
        </linearGradient>
      </defs>
      <path
        d="M17.4 1.5 2.6 23h8.2l-1.5 15.5L26 15.4h-8.4l-.2-13.9Z"
        fill="url(#boltChrome)"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TopBar({ userName, avatarUrl }: TopBarProps) {
  const firstName = userName.split(" ")[0] || "User";

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-y2k-lavender via-y2k-lavender to-y2k-lavender/85 backdrop-blur-sm">
      <div className="mx-auto flex h-[108px] max-w-lg items-start justify-between px-4 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link href="/dashboard" className="wordmark text-[35px] sm:text-[39px]">
              WealthFlow
            </Link>
            <ChromeBolt />
          </div>
          <p className="mt-1 truncate font-display text-base font-bold">
            Hei, {firstName}!
          </p>
        </div>

        <div className="relative mt-1 flex items-center">
          <div className="absolute -left-[122px] top-0 hidden w-[104px] rotate-[-5deg] items-start gap-1 border-2 border-y2k-ink bg-white px-2 py-1.5 shadow-[2px_2px_0_#0A0A0A] sm:flex">
            <span className="font-display text-[8px] font-800 uppercase leading-[1.15] tracking-tight">
              Good money
              <br />
              brighter you
            </span>
            <span className="holo mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-y2k-ink text-[9px] leading-none">
              ☺
            </span>
          </div>

          <Link
            href="/dashboard/settings"
            title="Profil & pengaturan"
            className="relative z-10 block transition-transform duration-100 hover:-rotate-2 active:translate-y-0.5"
          >
            <Avatar
              name={userName}
              src={avatarUrl}
              size={58}
              className="shadow-[4px_4px_0_#0A0A0A]"
            />
          </Link>

          <span className="absolute -bottom-4 -right-1 rotate-[5deg] border-2 border-y2k-ink bg-white px-1.5 py-0.5 font-display text-[7px] font-800 uppercase leading-tight tracking-[0.1em] shadow-[2px_2px_0_#0A0A0A]">
            Discipline pays
          </span>
        </div>
      </div>
    </header>
  );
}
