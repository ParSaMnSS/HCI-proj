"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  CardIcon,
  TrashIcon,
  CheckIcon,
  LockIcon,
  ShieldIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { useStore } from "@/lib/store";

export default function PaymentPage() {
  const router = useRouter();
  const cards = useStore((s) => s.cards);
  const addCard = useStore((s) => s.addCard);
  const makeDefault = useStore((s) => s.makeDefault);
  const removeCard = useStore((s) => s.removeCard);
  const showToast = useStore((s) => s.showToast);

  const [adding, setAdding] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      <Toast />

      {/* header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <button
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full text-brand"
        >
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-black text-ink">Payment methods</h1>
      </div>

      {/* security reassurance banner (trust improvement) */}
      <div className="mx-4 mt-2 flex items-center gap-3 rounded-2xl bg-lavender px-3 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white">
          <ShieldIcon size={20} />
        </span>
        <p className="text-sm font-semibold text-brand">
          Your card details are encrypted and stored securely. bitaksi never sees
          your full card number.
        </p>
      </div>

      {/* card list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          Saved cards
        </h2>

        {cards.length === 0 && (
          <p className="rounded-2xl border border-dashed border-hairline p-6 text-center text-muted">
            No cards yet. Add one to pay cashless.
          </p>
        )}

        <div className="space-y-2">
          {cards.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-hairline p-3"
            >
              <span
                className="grid h-10 w-14 place-items-center rounded-lg text-xs font-black text-white"
                style={{
                  background:
                    c.brand === "visa"
                      ? "linear-gradient(135deg,#1a1f71,#2e3aad)"
                      : "linear-gradient(135deg,#eb001b,#f79e1b)",
                }}
              >
                {c.brand === "visa" ? "VISA" : "MC"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">
                  •••• •••• •••• {c.last4}
                </p>
                <p className="text-sm text-muted">
                  {c.holder} · exp {c.exp}
                </p>
              </div>
              {c.isDefault ? (
                <span className="flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-xs font-bold text-green">
                  <CheckIcon size={14} /> Default
                </span>
              ) : (
                <button
                  onClick={() => {
                    makeDefault(c.id);
                    showToast("Default card updated", "ok");
                  }}
                  className="rounded-full bg-chip px-3 py-1 text-xs font-bold text-brand"
                >
                  Set default
                </button>
              )}
              <button
                aria-label="Remove card"
                onClick={() => {
                  removeCard(c.id);
                  showToast("Card removed", "warn");
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-alert"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-3.5 font-extrabold text-brand"
        >
          <PlusIcon size={20} /> Add a new card
        </button>
      </div>

      {adding && (
        <AddCardForm
          onClose={() => setAdding(false)}
          onSave={(c) => {
            addCard(c);
            setAdding(false);
            showToast("Card added & saved securely", "ok");
          }}
        />
      )}
    </div>
  );
}

function AddCardForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (c: {
    brand: "visa" | "mastercard";
    last4: string;
    exp: string;
    holder: string;
  }) => void;
}) {
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");
  const [saving, setSaving] = useState(false);

  const digits = number.replace(/\D/g, "");
  const numberValid = digits.length === 16;
  const expValid = /^\d{2}\/\d{2}$/.test(exp);
  const cvcValid = /^\d{3,4}$/.test(cvc);
  const holderValid = holder.trim().length >= 2;
  const valid = numberValid && expValid && cvcValid && holderValid;

  function formatNumber(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 16);
    return d.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExp(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  function submit() {
    if (!valid) return;
    setSaving(true);
    // mock "saving" delay so the success feedback is visible
    setTimeout(() => {
      const brand: "visa" | "mastercard" = digits.startsWith("4")
        ? "visa"
        : "mastercard";
      onSave({ brand, last4: digits.slice(-4), exp, holder: holder.trim() });
    }, 900);
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/45 animate-fade"
      onClick={onClose}
    >
      <div
        className="rounded-t-[28px] bg-surface p-5 animate-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-hairline" />
        <div className="mb-1 flex items-center gap-2">
          <CardIcon size={22} />
          <h2 className="text-xl font-black text-ink">Add card</h2>
        </div>
        <p className="mb-4 flex items-center gap-1.5 text-sm text-muted">
          <LockIcon size={15} /> Secured with 256-bit encryption
        </p>

        <Field
          label="Card number"
          value={number}
          onChange={(v) => setNumber(formatNumber(v))}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          error={number.length > 0 && !numberValid ? "Enter all 16 digits" : ""}
          valid={numberValid}
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <Field
              label="Expiry"
              value={exp}
              onChange={(v) => setExp(formatExp(v))}
              placeholder="MM/YY"
              inputMode="numeric"
              error={exp.length > 0 && !expValid ? "MM/YY" : ""}
              valid={expValid}
            />
          </div>
          <div className="flex-1">
            <Field
              label="CVC"
              value={cvc}
              onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
              error={cvc.length > 0 && !cvcValid ? "3–4 digits" : ""}
              valid={cvcValid}
            />
          </div>
        </div>
        <Field
          label="Cardholder name"
          value={holder}
          onChange={setHolder}
          placeholder="Name on card"
          error=""
          valid={holderValid}
        />

        <div className="mt-3 space-y-2">
          <Button full loading={saving} disabled={!valid} onClick={submit}>
            {saving ? "Saving securely…" : "Save card"}
          </Button>
          <button
            onClick={onClose}
            className="w-full py-2 font-bold text-brand underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  valid,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error: string;
  valid: boolean;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 ${
          error ? "border-alert" : valid ? "border-green" : "border-hairline"
        }`}
      >
        <input
          value={value}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-bold text-ink outline-none placeholder:font-medium placeholder:text-muted"
        />
        {valid && (
          <span className="text-green">
            <CheckIcon size={18} />
          </span>
        )}
      </div>
      {error && <span className="mt-1 block text-xs font-bold text-alert">{error}</span>}
    </label>
  );
}
