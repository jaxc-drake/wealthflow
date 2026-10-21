"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import TransactionModal from "@/components/transactions/TransactionModal";

interface Props {
  userId: string;
}

export default function QuickAddButton({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => { setType("income"); setOpen(true); }}
          className="neo-btn-green flex-1 h-12 text-sm font-display font-700"
        >
          📈 + Pemasukan
        </button>
        <button
          onClick={() => { setType("expense"); setOpen(true); }}
          className="neo-btn-pink flex-1 h-12 text-sm font-display font-700"
        >
          📉 + Pengeluaran
        </button>
      </div>

      {open && (
        <TransactionModal
          userId={userId}
          defaultType={type}
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
