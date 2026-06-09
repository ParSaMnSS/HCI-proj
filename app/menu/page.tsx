"use client";

import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/Brand";
import {
  ChevronLeft,
  CardIcon,
  ClockIcon,
  InfoIcon,
  ShieldIcon,
  UserIcon,
  ChevronRight,
} from "@/components/ui/icons";

export default function MenuPage() {
  const router = useRouter();
  const items = [
    { icon: <UserIcon size={20} />, label: "Profile", to: null },
    { icon: <ClockIcon size={20} />, label: "Trip history", to: null },
    { icon: <CardIcon size={20} />, label: "Payment methods", to: "/payment" },
    { icon: <ShieldIcon size={20} />, label: "Safety center", to: null },
    { icon: <InfoIcon size={20} />, label: "HCI improvements", to: "/ux-notes" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <button
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full text-brand"
        >
          <ChevronLeft />
        </button>
      </div>

      <div className="px-5 pt-2">
        <Wordmark className="!text-left" withTagline={false} />
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-lavender p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-xl font-black text-cream">
            P
          </span>
          <div>
            <p className="font-extrabold text-ink">Parsa Mansouri</p>
            <p className="text-sm text-muted">Always Win · Gold member</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 px-3">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => it.to && router.push(it.to)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left hover:bg-chip/60"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-chip text-brand">
              {it.icon}
            </span>
            <span className="flex-1 font-bold text-ink">{it.label}</span>
            <span className="text-muted">
              <ChevronRight size={18} />
            </span>
          </button>
        ))}
      </div>

      <div className="p-5">
        <button
          onClick={() => router.push("/booking")}
          className="w-full rounded-2xl bg-brand py-4 font-extrabold text-cream"
        >
          Back to map
        </button>
      </div>
    </div>
  );
}
