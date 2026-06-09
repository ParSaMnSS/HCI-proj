"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";
import { useStore } from "@/lib/store";

const DRIVER = { name: "Mehmet K.", emoji: "🧑‍✈️", color: "hsl(250 60% 60%)" };

type Msg = { id: number; from: "user" | "driver"; text: string; time: string };

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const AUTO_REPLIES = [
  "I'm on my way! 🚕",
  "Traffic is a bit heavy, but I'll be there soon.",
  "I can see you on the map. 2 minutes!",
  "I'm right outside. Look for the yellow Hyundai i20.",
  "No problem, take your time!",
];

const QUICK_MESSAGES = [
  "I'm outside",
  "Running 2 min late",
  "At the entrance",
  "Can you call me?",
];

export default function ChatPage() {
  const router = useRouter();
  const active = useStore((s) => s.active);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "driver", text: "Hello! I'm heading to your pickup. 🚕", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function send(text: string) {
    if (!text.trim()) return;
    const id = Date.now();
    setMsgs((m) => [...m, { id, from: "user", text: text.trim(), time: now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = AUTO_REPLIES[replyIdx.current % AUTO_REPLIES.length];
      replyIdx.current++;
      setMsgs((m) => [...m, { id: id + 1, from: "driver", text: reply, time: now() }]);
    }, 1200 + Math.random() * 800);
  }

  const driverName = active?.driver?.name ?? DRIVER.name;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b border-hairline px-4 pb-4"
        style={{ paddingTop: "calc(var(--sat,0px) + 12px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full bg-chip text-brand"
        >
          <ChevronLeft />
        </motion.button>
        <div
          className="grid h-11 w-11 place-items-center rounded-full text-xl text-white shrink-0"
          style={{ background: DRIVER.color }}
        >
          {DRIVER.emoji}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-ink">{driverName}</p>
          <p className="text-xs font-semibold text-green">● Online · Your driver</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              m.from === "user"
                ? "rounded-br-sm bg-brand text-cream"
                : "rounded-bl-sm bg-chip text-ink"
            }`}>
              <p className="text-[15px] font-semibold leading-snug">{m.text}</p>
              <p className={`mt-1 text-[11px] font-bold text-right ${m.from === "user" ? "text-cream/60" : "text-muted"}`}>{m.time}</p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-chip px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                    className="block h-2 w-2 rounded-full bg-muted"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {QUICK_MESSAGES.map((q) => (
          <motion.button
            key={q}
            whileTap={{ scale: 0.93 }}
            onClick={() => send(q)}
            className="shrink-0 rounded-full border border-brand px-3.5 py-2 text-[13px] font-bold text-brand"
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-3 border-t border-hairline px-4 pt-3"
        style={{ paddingBottom: "calc(0.75rem + var(--sab,0px))" }}
      >
        <div className="flex flex-1 items-center rounded-full border-2 border-hairline bg-chip/40 px-4 focus-within:border-brand">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Message your driver…"
            className="flex-1 bg-transparent py-3 text-[15px] font-semibold text-ink outline-none placeholder:text-muted"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-cream shadow-md disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
