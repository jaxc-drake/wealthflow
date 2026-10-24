"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TransactionModal from "@/components/transactions/TransactionModal";

interface Props {
  userId: string;
}

export default function QuickAddButton({ userId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fab-dock">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Tambah transaksi"
          className="chrome-fab flex h-16 w-16 items-center justify-center rounded-full border-4 border-y2k-ink shadow-[4px_4px_0_#D6FF3F] transition-transform duration-100 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#D6FF3F]"
        >
          <Plus size={32} strokeWidth={3.2} />
        </button>
      </div>

      {open && (
        <TransactionModal
          userId={userId}
          defaultType="expense"
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
