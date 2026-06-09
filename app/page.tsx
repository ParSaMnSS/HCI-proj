"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/Brand";

// Splash → auto-advance to the booking screen, matching the app launch.
export default function Splash() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1500);
    const t2 = setTimeout(() => router.push("/booking"), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [router]);

  return (
    <div
      className="absolute inset-0 grid place-items-center transition-opacity duration-300"
      style={{ background: "var(--brand-deep)", opacity: leaving ? 0 : 1 }}
    >
      <div className="animate-pop">
        <Wordmark tone="cream" />
      </div>
      <a
        href="/booking"
        className="absolute bottom-8 text-cream/60 text-sm underline"
      >
        Skip
      </a>
    </div>
  );
}
