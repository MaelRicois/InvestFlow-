"use client";

import { useState } from "react";
import { BilanPatrimonialTab } from "@/components/dashboard/bilan-patrimonial-tab";
import type { AccountingTransaction } from "@/lib/portfolio/accounting";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type TabId = "projets" | "bilan";

type Props = {
  rows: DashboardPropertyRow[];
  transactions: AccountingTransaction[];
  annualSalary: number | null;
  children: React.ReactNode;
};

export function DashboardShell({
  rows,
  transactions,
  annualSalary,
  children,
}: Props) {
  const [tab, setTab] = useState<TabId>("projets");

  return (
    <>
      <div
        className="mt-8 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1"
        role="tablist"
        aria-label="Sections du dashboard"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "projets"}
          onClick={() => setTab("projets")}
          className={cx(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "projets"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-white/65 hover:text-white"
          )}
        >
          Mes projets
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bilan"}
          onClick={() => setTab("bilan")}
          className={cx(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "bilan"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-white/65 hover:text-white"
          )}
        >
          Bilan patrimonial
        </button>
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === "projets" ? (
          children
        ) : (
          <BilanPatrimonialTab
            rows={rows}
            transactions={transactions}
            initialAnnualSalary={annualSalary}
          />
        )}
      </div>
    </>
  );
}
