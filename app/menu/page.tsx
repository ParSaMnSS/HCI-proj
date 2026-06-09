"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wordmark } from "@/components/ui/Brand";
import { ChevronLeft, CardIcon, ClockIcon, InfoIcon, ShieldIcon, UserIcon, ChevronRight } from "@/components/ui/icons";

const items = [
  { icon: <UserIcon size={20} />, label: "Profile", to: null },
  { icon: <ClockIcon size={20} />, label: "Trip history", to: null },
  { icon: <CardIcon size={20} />, label: "Payment methods", to: "/payment" },
  { icon: <ShieldIcon size={20} />, label: "Safety center", to: null },
  { icon: <InfoIcon size={20} />, label: "HCI improvements", to: "/ux-notes" },
];

export default function MenuPage() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(var(--sat, 0px) + 14px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full bg-chip text-brand"
        >
          <ChevronLeft />
        </motion.button>
      </div>

      <div className="px-5">
        <Wordmark withTagline={false} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 flex items-center gap-4 rounded-3xl bg-lavender p-5"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-2xl font-black text-cream">
            P
          </span>
          <div>
            <p className="text-lg font-extrabold text-ink">Parsa Mansouri</p>
            <p className="text-sm text-muted">Always Win · Gold member</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 flex-1 px-4">
        {items.map((it, i) => (
          <motion.button
            key={it.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileTap={{ backgroundColor: "#eaeafb", scale: 0.99 }}
            onClick={() => it.to && router.push(it.to)}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-chip text-brand">
              {it.icon}
            </span>
            <span className="flex-1 text-base font-bold text-ink">{it.label}</span>
            <span className="text-muted"><ChevronRight size={18} /></span>
          </motion.button>
        ))}
      </div>

      <div
        className="px-5 pt-3"
        style={{ paddingBottom: "calc(1.25rem + var(--sab, 0px))" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/booking")}
          className="w-full rounded-2xl bg-brand py-4 text-lg font-extrabold text-cream"
        >
          Back to map
        </motion.button>
      </div>
    </motion.div>
  );
}
