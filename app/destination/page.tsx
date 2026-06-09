"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, PlusIcon, ClockIcon, MapIcon, PinIcon, CheckIcon } from "@/components/ui/icons";
import { PICKUP, RECENT_ADDRESSES, QUICK_DESTINATIONS, type SavedAddress } from "@/lib/mock/data";
import { useStore } from "@/lib/store";

type Sheet = "none" | "home" | "work" | "someone";

export default function DestinationPage() {
  const router = useRouter();
  const setDestination = useStore((s) => s.setDestination);
  const showToast = useStore((s) => s.showToast);
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<Sheet>("none");
  const [savedHome, setSavedHome] = useState("");
  const [savedWork, setSavedWork] = useState("");
  const [homeInput, setHomeInput] = useState("");
  const [workInput, setWorkInput] = useState("");
  const [someoneName, setSomeoneName] = useState("");
  const [someonePhone, setSomeonePhone] = useState("");

  const all = [...QUICK_DESTINATIONS, ...RECENT_ADDRESSES];
  const results = query
    ? all.filter((a) => (a.title + a.subtitle).toLowerCase().includes(query.toLowerCase()))
    : RECENT_ADDRESSES;

  function choose(a: SavedAddress) { setDestination(a); router.push("/booking"); }

  function saveHome() {
    if (!homeInput.trim()) return;
    setSavedHome(homeInput.trim());
    setSheet("none");
    showToast("Home address saved!", "ok");
  }
  function saveWork() {
    if (!workInput.trim()) return;
    setSavedWork(workInput.trim());
    setSheet("none");
    showToast("Work address saved!", "ok");
  }
  function confirmSomeone() {
    if (!someoneName.trim()) return;
    setSheet("none");
    showToast(`Booking for ${someoneName} — ${someonePhone}`, "ok");
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 pb-2"
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

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSheet("someone")}
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-cream"
        >
          👤 For someone else
        </motion.button>

        <div className="w-11" />
      </div>

      {/* Origin → Destination inputs */}
      <div className="px-4 pb-3">
        <div className="flex items-stretch gap-3">
          {/* Vertical connector */}
          <div className="flex flex-col items-center pt-4 pb-1">
            <span className="h-4 w-4 rounded-full border-[3px] border-brand bg-white shrink-0" />
            <span className="my-1 flex flex-1 flex-col items-center gap-[5px]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
            </span>
            <span className="shrink-0 text-brand"><PinIcon size={18} /></span>
          </div>

          {/* Input fields */}
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex items-center rounded-2xl border-2 border-hairline bg-chip/40 px-4 py-3.5 min-h-[52px]">
              <span className="text-[15px] font-bold text-ink truncate">{PICKUP.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-2xl border-2 border-brand bg-lavender/30 px-4 min-h-[52px]">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where to?"
                  className="w-full bg-transparent py-3 text-[15px] font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                aria-label="Add stop"
                className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border-2 border-brand text-brand"
              >
                <PlusIcon size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Add home / work */}
        <div className="mt-3 flex gap-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("home")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand px-3 py-3 text-[15px] font-bold text-brand"
          >
            {savedHome ? <><CheckIcon size={16} /> Home</> : <><PlusIcon size={16} /> Add home</>}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("work")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand px-3 py-3 text-[15px] font-bold text-brand"
          >
            {savedWork ? <><CheckIcon size={16} /> Work</> : <><PlusIcon size={16} /> Add work</>}
          </motion.button>
        </div>
      </div>

      {/* Recents / search results */}
      <div className="flex-1 overflow-y-auto border-t border-hairline">
        <AnimatePresence mode="wait">
          <motion.div
            key={query}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {/* Saved shortcuts */}
            {!query && (savedHome || savedWork) && (
              <div className="px-5 pt-3 pb-1 space-y-1">
                {savedHome && (
                  <motion.button
                    whileTap={{ backgroundColor: "#eaeafb" }}
                    onClick={() => choose({ id: "home", kind: "saved", title: savedHome, subtitle: "Home", lngLat: QUICK_DESTINATIONS[0].lngLat })}
                    className="flex w-full items-center gap-4 rounded-2xl border border-hairline px-4 py-3"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-cream text-xl">🏠</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold text-ink">Home</span>
                      <span className="block truncate text-sm text-muted">{savedHome}</span>
                    </span>
                  </motion.button>
                )}
                {savedWork && (
                  <motion.button
                    whileTap={{ backgroundColor: "#eaeafb" }}
                    onClick={() => choose({ id: "work", kind: "saved", title: savedWork, subtitle: "Work", lngLat: QUICK_DESTINATIONS[1].lngLat })}
                    className="flex w-full items-center gap-4 rounded-2xl border border-hairline px-4 py-3"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-cream text-xl">🏢</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold text-ink">Work</span>
                      <span className="block truncate text-sm text-muted">{savedWork}</span>
                    </span>
                  </motion.button>
                )}
              </div>
            )}

            {results.length === 0 ? (
              <p className="py-10 text-center text-muted">No places match &ldquo;{query}&rdquo;</p>
            ) : (
              results.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ backgroundColor: "#eaeafb" }}
                  onClick={() => choose(a)}
                  className="flex w-full items-center gap-4 border-b border-hairline/60 px-5 py-3.5 text-left"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-chip text-brand">
                    {a.kind === "recent" ? <ClockIcon size={20} /> : <PinIcon size={20} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold text-ink">{a.title}</span>
                    <span className="block truncate text-sm text-muted">{a.subtitle}</span>
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pick from map (sticky bottom) */}
      <div
        className="shrink-0 border-t border-hairline bg-white px-4 pt-3"
        style={{ paddingBottom: "calc(1rem + var(--sab,0px))" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => choose(QUICK_DESTINATIONS[0])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 text-[17px] font-extrabold text-brand"
        >
          <MapIcon size={22} /> Pick from map
        </motion.button>
      </div>

      {/* ── Sheets ── */}
      <AnimatePresence>
        {sheet !== "none" && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet("none")}
              className="absolute inset-0 bg-black/40 z-20"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute bottom-0 left-0 right-0 z-30 rounded-t-[32px] bg-white px-5 pt-4"
              style={{ paddingBottom: "calc(1.5rem + var(--sab,0px))" }}
            >
              {/* Grabber */}
              <div className="mx-auto mb-5 h-[5px] w-14 rounded-full bg-[#e7e9f0]" />

              {sheet === "home" && (
                <AddAddressSheet
                  title="Add home address"
                  emoji="🏠"
                  value={homeInput}
                  onChange={setHomeInput}
                  onSave={saveHome}
                  onCancel={() => setSheet("none")}
                />
              )}
              {sheet === "work" && (
                <AddAddressSheet
                  title="Add work address"
                  emoji="🏢"
                  value={workInput}
                  onChange={setWorkInput}
                  onSave={saveWork}
                  onCancel={() => setSheet("none")}
                />
              )}
              {sheet === "someone" && (
                <SomeoneElseSheet
                  name={someoneName}
                  phone={someonePhone}
                  onName={setSomeoneName}
                  onPhone={setSomeonePhone}
                  onConfirm={confirmSomeone}
                  onCancel={() => setSheet("none")}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddAddressSheet({ title, emoji, value, onChange, onSave, onCancel }: {
  title: string; emoji: string; value: string;
  onChange: (v: string) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-2xl">{emoji}</span>
        <h2 className="text-xl font-black text-ink">{title}</h2>
      </div>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type an address or neighbourhood…"
        className="w-full rounded-2xl border-2 border-brand bg-lavender/20 px-4 py-3.5 text-[15px] font-bold text-ink outline-none placeholder:text-muted"
      />
      <p className="mt-2 text-xs text-muted px-1">This will be saved for quick access next time.</p>
      <div className="mt-5 flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-hairline py-4 font-bold text-ink"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={!value.trim()}
          className="flex-1 rounded-2xl bg-brand py-4 font-black text-cream disabled:opacity-40"
        >
          Save
        </motion.button>
      </div>
    </div>
  );
}

function SomeoneElseSheet({ name, phone, onName, onPhone, onConfirm, onCancel }: {
  name: string; phone: string;
  onName: (v: string) => void; onPhone: (v: string) => void;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-2xl">👤</span>
        <h2 className="text-xl font-black text-ink">Book for someone else</h2>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. Ayşe Yılmaz"
            className="w-full rounded-2xl border-2 border-hairline bg-chip/30 px-4 py-3.5 text-[15px] font-bold text-ink outline-none placeholder:text-muted focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="+90 5XX XXX XXXX"
            className="w-full rounded-2xl border-2 border-hairline bg-chip/30 px-4 py-3.5 text-[15px] font-bold text-ink outline-none placeholder:text-muted focus:border-brand"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted px-1">The driver will call this number if needed.</p>
      <div className="mt-5 flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-hairline py-4 font-bold text-ink"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          disabled={!name.trim()}
          className="flex-1 rounded-2xl bg-brand py-4 font-black text-cream disabled:opacity-40"
        >
          Confirm
        </motion.button>
      </div>
    </div>
  );
}
