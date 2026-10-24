/* eslint-disable @next/next/no-img-element */
interface Props {
  name: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
}

export default function Avatar({
  name,
  src,
  size = 56,
  ring = true,
  className = "",
}: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "W";

  return (
    <div
      className={`shrink-0 rounded-full ${ring ? "chrome p-[4px]" : ""} ${
        ring ? "border-[3px] border-y2k-ink" : ""
      } ${className}`}
      style={{ width: size + (ring ? 14 : 0), height: size + (ring ? 14 : 0) }}
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-y2k-ink bg-brand-purple"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span
            className="font-wordmark leading-none text-white"
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}
