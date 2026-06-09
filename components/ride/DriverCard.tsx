"use client";

import { useRouter } from "next/navigation";
import { StarIcon, PhoneIcon, MessageIcon, ShieldIcon } from "@/components/ui/icons";
import type { Driver } from "@/lib/mock/data";

/** Expanded driver info (UX improvement: BiTaksi shows very little). */
export function DriverCard({
  driver,
  etaLabel,
}: {
  driver: Driver;
  etaLabel: string;
}) {
  const router = useRouter();
  return (
    <div className="rounded-2xl border border-hairline bg-white p-3">
      <div className="flex items-center gap-3">
        {/* generated avatar */}
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl font-black text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${driver.photoHue} 65% 55%), hsl(${driver.photoHue + 30} 70% 45%))`,
          }}
          aria-hidden
        >
          {driver.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-lg font-extrabold text-ink">{driver.name}</span>
            <span className="flex items-center gap-0.5 rounded-full bg-chip px-2 py-0.5 text-sm font-bold text-ink">
              <span className="text-taxi">
                <StarIcon size={14} filled />
              </span>
              {driver.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-muted">
            {driver.trips.toLocaleString()} trips · {driver.car} · {driver.color}
          </p>
          <p className="mt-0.5 inline-block rounded-lg bg-ink px-2 py-0.5 text-sm font-black tracking-wider text-cream">
            {driver.plate}
          </p>
        </div>
      </div>

      {/* ETA line */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-lavender px-3 py-2">
        <span className="text-sm font-bold text-brand">{etaLabel}</span>
        <span className="text-sm font-bold text-brand">Meet at pickup point</span>
      </div>

      {/* contact actions — each labelled (accessibility) */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <ContactBtn
          label="Call"
          onClick={() => router.push("/call")}
          icon={<PhoneIcon size={18} />}
        />
        <ContactBtn
          label="Message"
          onClick={() => router.push("/chat")}
          icon={<MessageIcon size={18} />}
        />
        <ContactBtn
          label="Safety"
          onClick={() => router.push("/safety")}
          icon={<ShieldIcon size={18} />}
        />
      </div>
    </div>
  );
}

function ContactBtn({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl bg-chip py-2.5 text-xs font-bold text-brand"
    >
      {icon}
      {label}
    </button>
  );
}
