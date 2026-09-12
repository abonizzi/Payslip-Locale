"use client";

import { ChevronDown } from "lucide-react";
import { usePayslips } from "@/context/PayslipsContext";

export default function YearMenu() {
  const { years, selectedYear, setSelectedYear } = usePayslips();

  if (!years || years.length === 0) return null;

  return (
    <div className="relative shrink-0">
      <select
        value={selectedYear}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedYear(val === "all" ? "all" : Number(val));
        }}
        className="appearance-none bg-base-850 border border-base-700 rounded-full pl-3 pr-7 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-accent cursor-pointer"
        aria-label="Filtra per anno"
      >
        <option value="all">Tutti gli anni</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
